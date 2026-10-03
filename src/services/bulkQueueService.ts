/**
 * BulkQueueService — Binary Search Tree priority queue for bulk outreach operations.
 *
 * Design:
 *  - Each item in the BST is keyed by its scheduled execution timestamp (ms).
 *  - Items with smaller timestamps have higher priority (execute first).
 *  - SMS and Email queues each maintain a 5-minute minimum gap between sends
 *    to avoid carrier spam signals and Gmail rate limits.
 *  - AI Calls have no delay — each call starts immediately after the previous ends.
 *  - Manual Calls pop one lead at a time and wait for explicit "call ended" signal.
 *
 * The queue never mutates the lead directly — it calls the provided executor
 * function and emits progress events via the onProgress callback.
 */

export type BulkOpType = 'AI_CALL' | 'MANUAL_CALL' | 'SMS' | 'EMAIL';

export type ItemStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'CANCELLED';

export interface QueueItem {
  id: string;           // unique queue item id
  leadId: string;
  leadName: string;
  scheduledAt: number;  // epoch ms — BST key
  status: ItemStatus;
  error?: string;
  completedAt?: number;
  // For SMS/Email: track if already processed so we never double-send
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
  nextScheduledAt?: number;   // epoch ms — used for countdown timer
  isComplete: boolean;
  items: QueueItem[];
}

export type ProgressCallback = (progress: BulkProgress) => void;
export type ExecutorFn = (item: QueueItem) => Promise<{ success: boolean; error?: string }>;

// ─── BST Node ────────────────────────────────────────────────────────────────

class BSTNode {
  key: number;   // scheduledAt ms
  items: QueueItem[] = []; // multiple items can share the same ms
  left: BSTNode | null = null;
  right: BSTNode | null = null;

  constructor(key: number, item: QueueItem) {
    this.key = key;
    this.items = [item];
  }
}

// ─── BST Priority Queue ───────────────────────────────────────────────────────

class BSTQueue {
  private root: BSTNode | null = null;
  private _size = 0;

  get size() { return this._size; }

  insert(item: QueueItem): void {
    const key = item.scheduledAt;
    if (!this.root) {
      this.root = new BSTNode(key, item);
    } else {
      this._insertNode(this.root, key, item);
    }
    this._size++;
  }

  private _insertNode(node: BSTNode, key: number, item: QueueItem): void {
    if (key === node.key) {
      node.items.push(item);
    } else if (key < node.key) {
      if (!node.left) node.left = new BSTNode(key, item);
      else this._insertNode(node.left, key, item);
    } else {
      if (!node.right) node.right = new BSTNode(key, item);
      else this._insertNode(node.right, key, item);
    }
  }

  /** Pop the item with the smallest scheduledAt (highest priority). */
  popMin(): QueueItem | null {
    if (!this.root) return null;
    const { node, parent } = this._findMin(this.root, null);

    const item = node.items.shift()!;
    this._size--;

    if (node.items.length === 0) {
      // Remove this BST node
      if (!parent) {
        // root is the minimum — promote right child
        this.root = node.right;
      } else {
        parent.left = node.right; // min node never has a left child
      }
    }

    return item;
  }

  /** Peek at the next item without removing it. */
  peekMin(): QueueItem | null {
    if (!this.root) return null;
    const { node } = this._findMin(this.root, null);
    return node.items[0] ?? null;
  }

  private _findMin(node: BSTNode, parent: BSTNode | null): { node: BSTNode; parent: BSTNode | null } {
    if (!node.left) return { node, parent };
    return this._findMin(node.left, node);
  }

  isEmpty(): boolean { return this._size === 0; }

  /** Drain all remaining items (for cancel). */
  drain(): QueueItem[] {
    const result: QueueItem[] = [];
    this._inOrder(this.root, result);
    this.root = null;
    this._size = 0;
    return result;
  }

  private _inOrder(node: BSTNode | null, acc: QueueItem[]): void {
    if (!node) return;
    this._inOrder(node.left, acc);
    acc.push(...node.items);
    this._inOrder(node.right, acc);
  }
}

// ─── BulkQueue Controller ─────────────────────────────────────────────────────

export class BulkQueueController {
  private opType: BulkOpType;
  private bst = new BSTQueue();
  private allItems: Map<string, QueueItem> = new Map();
  private onProgress: ProgressCallback;
  private executor: ExecutorFn;
  private dedupSet: Set<string> = new Set();
  private isCancelled = false;
  private isRunning = false;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  /** Delay between consecutive SMS/Email sends (ms). Default = 5 minutes. */
  private gapMs: number;

  constructor(opts: {
    opType: BulkOpType;
    executor: ExecutorFn;
    onProgress: ProgressCallback;
    gapMs?: number;
  }) {
    this.opType = opts.opType;
    this.executor = opts.executor;
    this.onProgress = opts.onProgress;
    this.gapMs = opts.gapMs ?? 5 * 60 * 1000; // 5 min default
  }

  /**
   * Enqueue a list of leads. Each lead gets a scheduled time:
   *   - SMS / EMAIL: t(0) = now, t(n) = now + n × gapMs
   *   - AI_CALL / MANUAL_CALL: all scheduled at now (sequential by index, no clock delay)
   */
  enqueue(leads: { leadId: string; leadName: string }[]): void {
    const now = Date.now();

    leads.forEach((lead, idx) => {
      // Dedup: never queue the same lead twice in one session
      if (this.dedupSet.has(lead.leadId)) return;
      this.dedupSet.add(lead.leadId);

      const useDelay = this.opType === 'SMS' || this.opType === 'EMAIL';
      const scheduledAt = useDelay ? now + idx * this.gapMs : now + idx; // +idx ensures BST ordering for calls

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

  /** Start processing. For MANUAL_CALL: returns after popping the first item. */
  async start(): Promise<void> {
    if (this.isRunning || this.isCancelled) return;
    this.isRunning = true;
    await this._processNext();
  }

  /** Signal that the current manual call is done — advance to the next. */
  async advanceManualCall(): Promise<void> {
    if (this.opType !== 'MANUAL_CALL') return;
    await this._processNext();
  }

  cancel(): void {
    this.isCancelled = true;
    this.isRunning = false;
    this._stopCountdown();

    // Mark all remaining PENDING as CANCELLED
    this.bst.drain().forEach((item) => {
      item.status = 'CANCELLED';
      this.allItems.set(item.id, item);
    });

    this._emit();
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  private async _processNext(): Promise<void> {
    if (this.isCancelled) return;

    const next = this.bst.peekMin();
    if (!next) {
      this.isRunning = false;
      this._stopCountdown();
      this._emit();
      return;
    }

    const now = Date.now();
    const waitMs = Math.max(0, next.scheduledAt - now);

    if (waitMs > 0) {
      // Start countdown ticker so UI updates every second
      this._startCountdown(next.scheduledAt);
      this._emit();
      await this._sleep(waitMs);
      this._stopCountdown();
    }

    if (this.isCancelled) return;

    const item = this.bst.popMin();
    if (!item) return;

    item.status = 'RUNNING';
    this.allItems.set(item.id, item);
    this._emit();

    try {
      const result = await this.executor(item);
      item.status = result.success ? 'SUCCESS' : 'FAILED';
      item.error = result.error;
    } catch (err: any) {
      item.status = 'FAILED';
      item.error = err?.message ?? 'Unknown error';
    }

    item.completedAt = Date.now();
    this.allItems.set(item.id, item);
    this._emit();

    // For MANUAL_CALL mode: stop here and wait for external advance() call
    if (this.opType === 'MANUAL_CALL') {
      this.isRunning = false;
      return;
    }

    // For all others: continue automatically
    await this._processNext();
  }

  private _startCountdown(targetMs: number): void {
    this._stopCountdown();
    this.countdownInterval = setInterval(() => {
      this._emit(targetMs);
    }, 1000);
  }

  private _stopCountdown(): void {
    if (this.countdownInterval !== null) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  private _emit(nextScheduledAt?: number): void {
    const items = Array.from(this.allItems.values());
    const running = items.find((i) => i.status === 'RUNNING');
    const nextPending = this.bst.peekMin();

    const progress: BulkProgress = {
      opType: this.opType,
      total: items.length,
      pending: items.filter((i) => i.status === 'PENDING').length,
      running: items.filter((i) => i.status === 'RUNNING').length,
      successful: items.filter((i) => i.status === 'SUCCESS').length,
      failed: items.filter((i) => i.status === 'FAILED').length,
      skipped: items.filter((i) => i.status === 'SKIPPED').length,
      cancelled: items.filter((i) => i.status === 'CANCELLED').length,
      currentLeadName: running?.leadName,
      nextScheduledAt: nextScheduledAt ?? nextPending?.scheduledAt,
      isComplete: !this.isRunning && this.bst.isEmpty(),
      items,
    };

    this.onProgress(progress);
  }

  private _sleep(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
  }
}
