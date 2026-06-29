"""
BetLife365 track record engine (single source of merge + settle logic).
Used by the builders (intake) and the settlement bot (grading) so the rules
never diverge. The master is trackrecord.json in the vip-dashboard repo.

Rules (locked with Fred 29-06-2026):
- Canonical, idempotent betid: re-running a build = update, never a new row.
- Intake adds rows as Pending; never downgrades a decided/locked row.
- Settlement sets W / L / V (void = stake back) / Push (stake back); a void
  leg in a parley counts as 1.00 and the parley settles on the rest.
- manual_lock=True rows are never touched by the bot (hand-correction wins).
- Conflict / unconfirmed -> needs_review, stays Pending.
- Only settle when the event is finished and two sources agree (enforced by
  the caller; this lib just records the decision + evidence).
"""
import json, re, os, datetime

DECIDED = {"W", "L", "V", "Push"}
_EMOJI = re.compile(r"[\U0001F000-\U0001FAFF☀-➿←-⇿️]")

def norm(s):
    return _EMOJI.sub("", str(s or "")).replace("⁠", "").strip()

def tier_from(selection):
    s = (selection or "").lower()
    if "lucky" in s: return "lucky"
    if "jackpot" in s: return "jackpot"
    if "value" in s: return "value"
    if "safe" in s: return "safe"
    return "x"

def canonical_betid(row):
    """Deterministic id. row needs: kind, date, sport, match, selection (+tier for parley)."""
    date = row.get("date", "")
    kind = row.get("kind", "card")
    if kind == "parley":
        sport = (row.get("sport", "") or "").lower()
        tier = row.get("tier") or tier_from(row.get("selection", ""))
        return "parley|%s|%s|%s" % (date, sport, tier)
    pre = "prop" if (row.get("prop") or kind == "prop") else "card"
    return "%s|%s|%s|%s" % (pre, date, row.get("match", ""), norm(row.get("selection", "")))

def load(path):
    if not os.path.exists(path): return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save(path, rows):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False)

def index(master):
    return {r.get("betid") or canonical_betid(r): r for r in master}

def upsert(master, new_rows):
    """Idempotent intake. Adds new bets as Pending; updates non-decided, non-locked
    rows in place; never overwrites a decided result or a manual_lock row."""
    by = index(master)
    added = updated = skipped = 0
    for row in new_rows:
        bid = row.get("betid") or canonical_betid(row)
        row["betid"] = bid
        row.setdefault("public", True)
        row.setdefault("manual_lock", False)
        row.setdefault("result", "P")
        ex = by.get(bid)
        if ex is None:
            by[bid] = row; master.append(row); added += 1
        elif ex.get("manual_lock") or ex.get("result") in DECIDED:
            skipped += 1  # protect locked / already-settled rows
        else:
            ex.update({k: v for k, v in row.items() if k not in ("result",)})
            updated += 1
    return {"added": added, "updated": updated, "skipped": skipped, "total": len(master)}

def settle(master, results):
    """results: {betid: {"result": "W|L|V|Push", "evidence": {...}}}.
    Skips manual_lock rows. Returns what changed + what was protected."""
    by = index(master)
    changed, locked, missing = [], [], []
    now = datetime.datetime.utcnow().isoformat() + "Z"
    for bid, info in results.items():
        r = by.get(bid)
        if r is None: missing.append(bid); continue
        if r.get("manual_lock"): locked.append(bid); continue
        res = info.get("result")
        if res not in DECIDED: continue
        r["result"] = res
        r["evidence"] = info.get("evidence", {})
        r["updated_at"] = now
        r.pop("needs_review", None)
        changed.append(bid)
    return {"changed": changed, "locked_skipped": locked, "missing": missing}

def flag_review(master, betid, reason):
    by = index(master)
    if betid in by and not by[betid].get("manual_lock"):
        by[betid]["needs_review"] = reason

def parley_result(leg_results):
    """leg_results: list of 'W'/'L'/'V'/'Push'. Void/Push leg = 1.00 (ignored).
    Lost if any remaining leg lost; won if all remaining win; else pending."""
    live = [x for x in leg_results if x not in ("V", "Push")]
    if any(x == "L" for x in live): return "L"
    if live and all(x == "W" for x in live): return "W"
    if not live: return "V"      # every leg void/push -> stake back
    return "P"

def stats(master, public_only=True):
    rows = [r for r in master if (r.get("public", True) or not public_only)]
    staked = profit = wins = losses = 0.0
    for r in rows:
        if r.get("result") not in DECIDED: continue
        stake = float(r.get("stake", 0) or 0)
        odds = float(r.get("odds", 0) or 0)
        res = r.get("result")
        if res in ("V", "Push"):
            continue  # stake back, no P/L
        staked += stake
        if res == "W":
            profit += stake * (odds - 1); wins += 1
        elif res == "L":
            profit -= stake; losses += 1
    n = wins + losses
    return {
        "bets": int(n),
        "wins": int(wins), "losses": int(losses),
        "profit_u": round(profit, 2),
        "staked_u": round(staked, 2),
        "roi_pct": round(100 * profit / staked, 1) if staked else 0.0,
        "winrate_pct": round(100 * wins / n, 1) if n else 0.0,
    }

if __name__ == "__main__":
    import sys
    m = load(sys.argv[1] if len(sys.argv) > 1 else "trackrecord.json")
    print(json.dumps(stats(m), indent=1))
