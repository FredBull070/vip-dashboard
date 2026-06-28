#!/usr/bin/env python3
"""BetLife365 independent AUDIT pass (step 3).

A SECOND pair of eyes that runs separately from the settlement bot.
It re-fetches the verified (dual-source) results itself, re-computes what
each card/parley/challenge SHOULD be, and compares that to what was actually
recorded in the track record. Any disagreement is flagged for review.

This makes the settler no longer 'judge and executioner' in one: the audit can
catch a wrong settlement, a corrupted record, or a result that has since changed.
"""
import settle as E

def _key_card(c):    return f'card|{c["match"]}|{c["selection"]}'
def _key_parley(p):  return f'parley|{p["title"]}'

def audit(js, recorded, fresh_results):
    """recorded: {key -> 'W'/'L'/'V'} as stored in the track record.
       fresh_results: independently re-fetched & reconciled results dict.
       Returns (findings, summary)."""
    recomputed = E.settle_slate(js, fresh_results)
    findings = []

    def check(key, should):
        rec = recorded.get(key)
        if rec is None:
            status = "NOT-RECORDED" if should in ("W", "L", "V") else "ok-pending"
        elif rec == should:
            status = "OK"
        else:
            status = "MISMATCH"
        findings.append({"key": key, "recorded": rec, "audit_says": should, "status": status})

    for c in recomputed["cards"]:
        check(_key_card(c), c["result"])
    for p in recomputed["parleys"]:
        check(_key_parley(p), p["result"])
    if recomputed["challenge"]:
        check("challenge", recomputed["challenge"]["result"])

    mism = [f for f in findings if f["status"] == "MISMATCH"]
    missing = [f for f in findings if f["status"] == "NOT-RECORDED"]
    summary = {"total": len(findings), "ok": sum(1 for f in findings if f["status"] == "OK"),
               "mismatch": len(mism), "not_recorded": len(missing),
               "clean": not mism and not missing}
    return findings, summary
