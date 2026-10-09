#!/usr/bin/env python3
"""
Telnyx short-duration-call (SDC) report.

Telnyx rule (support.telnyx.com/en/articles/1130707): SDC = outbound call <= 6 s. Rate = SDC / CONNECTED calls
(0-second rows are excluded). If the month ends above 15%, the surcharge applies to ALL SDCs that month.

Usage:
  1) Portal -> Reporting -> Detailed Records -> outbound only -> export CSV (month to date, UTC)
  2) python3 sdc_report.py records.csv
  Optional: --connected N --short S   (use portal totals instead of a CSV)
"""
import argparse, csv, math, collections

def find_col(headers, *needles):
    for n in needles:
        for h in headers:
            if n in h.lower():
                return h
    return None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("csv", nargs="?")
    ap.add_argument("--connected", type=int); ap.add_argument("--short", type=int)
    ap.add_argument("--limit", type=float, default=0.15)
    a = ap.parse_args()
    N = S = 0
    by_conn = collections.Counter(); by_conn_all = collections.Counter()
    if a.csv:
        with open(a.csv, newline="", encoding="utf-8-sig") as f:
            rd = csv.DictReader(f); H = rd.fieldnames or []
            dcol = find_col(H, "billed_duration", "call_duration", "duration")
            ccol = find_col(H, "connection", "sip", "profile")
            dircol = find_col(H, "direction")
            if not dcol: raise SystemExit(f"no duration column in {H}")
            for r in rd:
                if dircol and "out" not in (r.get(dircol) or "").lower(): continue
                try: d = float(r[dcol] or 0)
                except ValueError: continue
                if d <= 0: continue                    # Telnyx drops 0-second rows
                N += 1; by_conn_all[r.get(ccol, "-")] += 1
                if d <= 6: S += 1; by_conn[r.get(ccol, "-")] += 1
    else:
        N, S = a.connected or 0, a.short or 0
    if not N: raise SystemExit("no connected calls found")
    rate = S / N
    print(f"connected={N}  short(<=6s)={S}  SDC rate={rate:.2%}  (limit {a.limit:.0%})")
    if by_conn:
        print("short calls by connection:", dict(by_conn.most_common(5)))
    if rate <= a.limit:
        print("OK: under the limit. Keep new calls at the same or a lower short rate."); return
    need = math.ceil(S / a.limit - N)
    print(f"Over the limit. If every future call is >6 s you still need {need} more connected calls this month to dilute "
          f"{S} existing short calls below {a.limit:.0%}.")
    for fr in (0.05, 0.10):
        # S + fr*M <= limit*(N+M)  ->  M >= (S - limit*N) / (limit - fr)
        m = math.ceil((S - a.limit * N) / (a.limit - fr))
        print(f"  at a {fr:.0%} short rate on new calls: {m} more connected calls needed")

if __name__ == "__main__":
    main()
