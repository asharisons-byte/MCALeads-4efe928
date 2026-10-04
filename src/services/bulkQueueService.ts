/**
 * BulkQueueService — Binary Search Tree priority queue for bulk outreach.
 *
 * BST keyed by scheduledAt (epoch ms). popMin() always returns the next
 * item to execute. For SMS/Email: items are spaced OUTREACH_GAP_MS apart.
 * For calls: items are spaced 1ms apart (essentially sequential, no delay).
 *
 * MANUAL_CALL mode: queue pauses after each item and waits for the caller
 * to invoke advanceManualCall() — e.g., after user closes the dialer.
 */

export type BulkOpType = 'AI_CALL' | 'MANUAL_CALL' | 'SMS' | 'EMAIL';
export type ItemStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'CANCELLED';

export interface QueueItem {
  id: string;
  leadId: string;
  leadName: string;
  scheduledAt: number;   // epoch ms — BST sort key
  status: ItemStatus;
  error?: string;
  completedAt?: number;
  dedupKey: string;
}

export interface BulkProgress {
  opType: BulkOpType;
  total: number;
  pending: number;
  running: number;
  successful: number;
  failed: number;
  skipped: number;
  cancelled: number;
  currentLeadName?: string;
  nextScheduledAt?: number;
  isComplete: boolean;
  items: QueueItem[];
}

export type ProgressCallback = (progress: BulkProgress) => void;
export type ExecutorFn = (item: QueueItem) => Promise<{ success: boolean; error?: string }>;

// ── BST ───────────────────────────────────────────────────────────────────────

class BSTNode {
  key: number;
  items: QueueItem[];
  left: BSTNode | null = null;
  right: BSTNode | null = null;
  constructor(key: number, item: QueueItem) {
    this.key = key;
    this.items = [item];
  }
}

class BSTQueue {
  private root: BSTNode | null = null;
  private _size = 0;
  get size() { return this._size; }

  insert(item: QueueItem): void {
    const key = item.scheduledAt;
    if (!this.root) { this.root = new BSTNode(key, item); }
    else { this._ins(this.root, key, item); }
    this._size++;
  }

  private _ins(node: BSTNode, key: number, item: QueueItem): void {
    if (key === node.key) { node.items.push(item); }
    else if (key < node.key) {
      if (!node.left) node.left = new BSTNode(key, item);
      else this._ins(node.left, key, item);
    } else {
      if (!node.right) node.right = new BSTNode(key, item);
      else this._ins(node.right, key, item);
    }
  }

  popMin(): QueueItem | null {
    if (!this.root) return null;
    const { node, parent } = this._findMin(this.root, null);
    const item = node.items.shift()!;
    this._size--;
    if (node.items.length === 0) {
      if (!parent) this.root = node.right;
      else parent.left = node.right;
    }
    return item;
  }

  peekMin(): QueueItem | null {
    if (!this.root) return null;
    return this._findMin(this.root, null).node.items[0] ?? null;
  }

  private _findMin(node: BSTNode, parent: BSTNode | null): { node: BSTNode; parent: BSTNode | null } {
    if (!node.left) return { node, parent };
    return this._findMin(node.left, node);
  }

  isEmpty(): boolean { return this._size === 0; }

  drain(): QueueItem[] {
    const acc: QueueItem[] = [];
    this._inOrder(this.root, acc);
    this.root = null;
    this._size = 0;
    return acc;
  }

  private _inOrder(node: BSTNode | null, acc: QueueItem[]): void {
    if (!node) return;
    this._inOrder(node.left, acc);
    acc.push(...node.items);
    this._inOrder(node.right, acc);
  }
}

// ── Controller ────────────────────────────────────────────────────────────────

export class BulkQueueController {
  private opType: BulkOpType;
  private bst = new BSTQueue();
  private allItems: Map<string, QueueItem> = new Map();
  private onProgress: ProgressCallback;
  private executor: ExecutorFn;
  private dedupSet: Set<string> = new Set();
  private isCancelled = false;
  private isRunning = false;
  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  /** ms gap between SMS / Email sends */
  readonly gapMs: number;

  constructor(opts: {
    opType: BulkOpType;
    executor: ExecutorFn;
    onProgress: ProgressCallback;
    gapMs?: number;
  }) {
    this.opType = opts.opType;
    this.executor = opts.executor;
    this.onProgress = opts.onProgress;
    this.gapMs = opts.gapMs ?? 5 * 60 * 1000;
  }

  enqueue(leads: { leadId: string; leadName: string }[]): void {
    const now = Date.now();
    const useDelay = this.opType === 'SMS' || this.opType === 'EMAIL';

    leads.forEach((lead, idx) => {
      if (this.dedupSet.has(lead.leadId)) return; // dedup
      this.dedupSet.add(lead.leadId);

      const scheduledAt = useDelay
        ? now + idx * this.gapMs       // staggered for SMS/Email
        : now + idx;                    // 1ms apart for calls (preserves order)

      const item: QueueItem = {
        id: `bq-${Date.now()}-${idx}`,
        leadId: lead.leadId,
        leadName: lead.leadName,
        scheduledAt,
        status: 'PENDING',
        dedupKey: lead.leadId,
      };
      this.bst.insert(item);
      this.allItems.set(item.id, item);
    });
    this._emit();
  }

  async start(): Promise<void> {
    if (this.isRunning || this.isCancelled) return;
    this.isRunning = true;
    await this._next();
  }

  /** Signal that the current manual call ended — process the next lead */
  async advanceManualCall(): Promise<void> {
    if (this.opType !== 'MANUAL_CALL' || this.isRunning) return;
    this.isRunning = true;
    await this._next();
  }

  cancel(): void {
    this.isCancelled = true;
    this.isRunning = false;
    this._stopCountdown();
    this.bst.drain().forEach((item) => {
      item.status = 'CANCELLED';
      this.allItems.set(item.id, item);
    });
    this._emit();
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private async _next(): Promise<void> {
    if (this.isCancelled) { this.isRunning = false; return; }
    if (this.bst.isEmpty()) { this.isRunning = false; this._emit(); return; }

    // Wait until the next item's scheduled time
    const peek = this.bst.peekMin()!;
    const waitMs = Math.max(0, peek.scheduledAt - Date.now());

    if (waitMs > 500) {
      this._startCountdown(peek.scheduledAt);
      this._emit();
      await this._sleep(waitMs);
      this._stopCountdown();
    }

    if (this.isCancelled) { this.isRunning = false; return; }

    const item = this.bst.popMin();
    if (!item) { this.isRunning = false; return; }

    // Mark running
    item.status = 'RUNNING';
    this.allItems.set(item.id, item);
    this._emit();

    try {
      const result = await this.executor(item);
      item.status = result.success ? 'SUCCESS' : 'FAILED';
      if (!result.success) item.error = result.error || 'Unknown error';
    } catch (err: any) {
      item.status = 'FAILED';
      item.error = err?.message ?? 'Unhandled error';
    }
    if (item.status === 'FAILED') {
      console.error(`[Bulk ${this.opType}] FAILED for "${item.leadName}" (${item.leadId}): ${item.error}`);
    }

    item.completedAt = Date.now();
    this.allItems.set(item.id, item);
    this._emit();

    // MANUAL_CALL: pause and wait for advanceManualCall() signal
    if (this.opType === 'MANUAL_CALL') {
      this.isRunning = false;
      return;
    }

    // Everything else: continue immediately
    await this._next();
  }

  private _startCountdown(targetMs: number): void {
    this._stopCountdown();
    this.countdownTimer = setInterval(() => this._emit(targetMs), 1000);
  }

  private _stopCountdown(): void {
    if (this.countdownTimer !== null) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  private _emit(nextScheduledAt?: number): void {
    const items = Array.from(this.allItems.values());
    const runningItem = items.find((i) => i.status === 'RUNNING');
    const nextPending = this.bst.peekMin();
    const done = !this.isRunning && this.bst.isEmpty();

    this.onProgress({
      opType: this.opType,
      total: items.length,
      pending: items.filter((i) => i.status === 'PENDING').length,
      running: items.filter((i) => i.status === 'RUNNING').length,
      successful: items.filter((i) => i.status === 'SUCCESS').length,
      failed: items.filter((i) => i.status === 'FAILED').length,
      skipped: items.filter((i) => i.status === 'SKIPPED').length,
      cancelled: items.filter((i) => i.status === 'CANCELLED').length,
      currentLeadName: runningItem?.leadName,
      nextScheduledAt: nextScheduledAt ?? nextPending?.scheduledAt,
      isComplete: done,
      items,
    });
  }

  private _sleep(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
  }
}
