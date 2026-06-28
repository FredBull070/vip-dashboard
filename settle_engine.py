#!/usr/bin/env python3
"""BetLife365 settlement engine (steps 1-2): parse bets, settle every market
against VERIFIED results, with dual-source cross-check. Pure logic, decoupled
from the data source and the website/dashboard. Never invents a result."""
import re, json, sys

def _norm(s): return re.sub(r"\s+", " ", (s or "").strip()).lower()

def split_match(m):
    parts = re.split(r"\s+x\s+", m.strip(), maxsplit=1)
    return (parts[0].strip(), parts[1].strip()) if len(parts) == 2 else (m.strip(), "")

def team_side(team, res):
    t = _norm(team)
    if t == _norm(res["home"]): return "home"
    if t == _norm(res["away"]): return "away"
    if t in _norm(res["home"]) or _norm(res["home"]) in t: return "home"
    if t in _norm(res["away"]) or _norm(res["away"]) in t: return "away"
    return None

def settle_pick(market, selection, res):
    if not res or not res.get("completed"):
        return ("P", (res or {}).get("note") or "no confirmed final result yet")
    hg, ag = res["hg"], res["ag"]; total = hg + ag
    mk, sel = _norm(market), selection.strip()
    m = re.search(r"(over|under)\s+([0-9]+(?:\.5)?)", sel, re.I)
    if "total goals" in mk or m:
        if m:
            side, line = m.group(1).lower(), float(m.group(2))
            if side == "over":
                return ("W", f"{total} goals > {line}") if total > line else ("L", f"{total} goals < {line}")
            return ("W", f"{total} goals < {line}") if total < line else ("L", f"{total} goals > {line}")
    if "both teams to score" in mk or re.search(r"\bbtts\b|both teams to score", sel, re.I):
        ok = hg > 0 and ag > 0
        return ("W", f"both scored ({hg}-{ag})") if ok else ("L", f"not both scored ({hg}-{ag})")
    m = re.search(r"(.+?)\s*([+-])\s*([0-9]+\.5)\b", sel)
    if "handicap" in mk and m:
        team, sign, h = m.group(1).strip(), m.group(2), float(m.group(3))
        side = team_side(team, res)
        if side is None: return ("V", f"team '{team}' not in result")
        gf, ga = (hg, ag) if side == "home" else (ag, hg)
        margin = gf - ga + (h if sign == "+" else -h)
        return ("W", f"{team} margin {gf-ga:+d} vs line {sign}{h}") if margin > 0 else ("L", f"{team} margin {gf-ga:+d} vs line {sign}{h}")
    if "to win to nil" in _norm(sel) or "win to nil" in mk:
        team = re.sub(r"to win to nil.*$", "", sel, flags=re.I).strip()
        side = team_side(team, res)
        if side is None: return ("V", f"team '{team}' not in result")
        gf, ga = (hg, ag) if side == "home" else (ag, hg)
        ok = gf > ga and ga == 0
        return ("W", f"{team} won {gf}-{ga} clean sheet") if ok else ("L", f"{team} {gf}-{ga}")
    if "match result" in mk or re.search(r"\bto win\b", sel, re.I):
        team = re.sub(r"to win.*$", "", sel, flags=re.I).strip()
        side = team_side(team, res)
        if side is None: return ("V", f"team '{team}' not in result")
        gf, ga = (hg, ag) if side == "home" else (ag, hg)
        if gf > ga: return ("W", f"{team} won {gf}-{ga}")
        if gf == ag: return ("L", f"draw {hg}-{ag}")
        return ("L", f"{team} lost {gf}-{ga}")
    if "to qualify" in mk or "to qualify" in _norm(sel):
        return ("P", "needs verified qualifier (ET/penalty) data from source")
    return ("P", f"unhandled market '{market}' / selection '{selection}'")

def parse_cards(js):
    m = re.search(r"DAILY_CARDS\s*=\s*`(.*?)`", js, re.S)
    if not m: return []
    cards = []
    for blk in m.group(1).split("\n===\n"):
        d = {}
        for line in blk.strip().splitlines():
            mm = re.match(r"(MATCH|MARKET|SELECTION|ODDS|STAKE|RISK|ANALYSIS):\s*(.*)", line.strip())
            if mm: d[mm.group(1).lower()] = mm.group(2).strip()
        if d.get("match"): cards.append(d)
    return cards

def parse_parleys(js):
    m = re.search(r"DAILY_MESSAGES\s*=\s*`(.*?)`", js, re.S)
    if not m: return []
    out = []
    for block in re.split(r"^\s*===NEXT MESSAGE===\s*$", m.group(1), flags=re.M):
        b = block.strip()
        if not b: continue
        first = b.splitlines()[0]
        title = re.sub(r"\*\*|:[a-z_]+:|[\U0001F000-\U0001FAFF☀-➿]", "", first).strip()
        is_free = "free bet" in title.lower()
        legs = []; lines = b.splitlines()
        for i, l in enumerate(lines):
            if "small_orange_diamond" in l or "\U0001F538" in l:
                match = re.sub(r"\*\*|:[a-z_]+:|\U0001F538", "", l).strip()
                pick = ""
                for j in range(i+1, len(lines)):
                    if lines[j].strip(): pick = lines[j].strip(); break
                pm = re.match(r"(.*?)\s*@\s*([0-9.]+)", pick)
                sel = pm.group(1).strip() if pm else pick
                legs.append({"match": match, "selection": sel})
        odds_m = re.search(r"Total odds:\s*±?\s*([0-9.]+)", b)
        out.append({"title": title, "is_free": is_free,
                    "odds_low": float(odds_m.group(1)) if odds_m else None, "legs": legs})
    return out

def parse_challenge(js):
    m = re.search(r"DAILY_CHALLENGE\s*=\s*\{(.*?)\};", js, re.S)
    if not m: return None
    body = m.group(1); legs = []
    legs_m = re.search(r"legs:\s*\[(.*?)\]", body, re.S)
    if legs_m:
        for s in re.findall(r'"(.*?)"', legs_m.group(1)):
            mm = re.match(r"(.*?):\s*(.*?)\s*@", s)
            if mm: legs.append({"match": mm.group(1).strip(), "selection": mm.group(2).strip()})
    om = re.search(r'oddLow:\s*([0-9.]+)', body)
    return {"legs": legs, "odds_low": float(om.group(1)) if om else None}

def market_for(match, selection, cards):
    for c in cards:
        if _norm(c["match"]) == _norm(match) and _norm(c["selection"]) == _norm(selection):
            return c.get("market", "")
    s = selection.lower()
    if "over" in s or "under" in s: return "Total goals"
    if "handicap" in s or re.search(r"[+-][0-9]\.5", s): return "Asian handicap"
    if "to win to nil" in s: return "Win to nil"
    if "both teams" in s or "btts" in s: return "Both teams to score"
    if "to qualify" in s: return "To qualify"
    if "to win" in s: return "Match result"
    return ""

def evidence(res):
    if not res: return None
    ev = {"score": f'{res["home"]} {res.get("hg","?")}-{res.get("ag","?")} {res["away"]}',
          "completed": res.get("completed", False), "source": res.get("source"),
          "source_url": res.get("source_url"), "fetched_at": res.get("fetched_at")}
    if res.get("confirmed_by"): ev["confirmed_by"] = res["confirmed_by"]
    if res.get("cross_check"):  ev["cross_check"]  = res["cross_check"]
    if res.get("note"):         ev["note"]         = res["note"]
    return ev

# ---- dual-source verification: settle only when 2 sources agree -------------
def reconcile_match(a, b):
    ca = bool(a and a.get("completed")); cb = bool(b and b.get("completed"))
    if ca and cb:
        if a["hg"] == b["hg"] and a["ag"] == b["ag"]:
            m = dict(a); m["confirmed_by"] = [a.get("source"), b.get("source")]
            m["cross_check"] = f'{b.get("source")}: {b["hg"]}-{b["ag"]}'
            return m
        return {"home": a["home"], "away": a["away"], "completed": False, "conflict": True,
                "note": f'CONFLICT - {a.get("source")} {a["hg"]}-{a["ag"]} vs {b.get("source")} {b["hg"]}-{b["ag"]} (flagged)',
                "source": a.get("source"), "fetched_at": a.get("fetched_at")}
    have = "source A only" if ca else ("source B only" if cb else "neither source")
    base = a or b or {}
    return {"home": base.get("home"), "away": base.get("away"), "completed": False,
            "note": f"awaiting both sources ({have} complete)",
            "source": base.get("source"), "fetched_at": base.get("fetched_at")}

def reconcile(results_a, results_b):
    A = {_norm(k): v for k, v in (results_a or {}).items()}
    B = {_norm(k): v for k, v in (results_b or {}).items()}
    out, conflicts = {}, []
    for key in set(A) | set(B):
        merged = reconcile_match(A.get(key), B.get(key)); out[key] = merged
        if merged.get("conflict"): conflicts.append(merged["note"])
    return out, conflicts

def combine(legs):
    vals = [l["result"] for l in legs]
    if "L" in vals: return "L"
    if "P" in vals: return "P"
    non_void = [v for v in vals if v != "V"]
    return ("W" if all(v == "W" for v in non_void) else "P") if non_void else "V"

def settle_slate(js, results):
    R = {_norm(k): v for k, v in results.items()}
    cards = parse_cards(js)
    out = {"cards": [], "parleys": [], "challenge": None}
    for c in cards:
        res = R.get(_norm(c["match"]))
        v, r = settle_pick(c.get("market", ""), c.get("selection", ""), res)
        out["cards"].append({**c, "result": v, "reason": r, "evidence": evidence(res)})
    for p in parse_parleys(js):
        if p["is_free"]: continue
        lr = []
        for leg in p["legs"]:
            res = R.get(_norm(leg["match"])); mk = market_for(leg["match"], leg["selection"], cards)
            v, r = settle_pick(mk, leg["selection"], res)
            lr.append({**leg, "market": mk, "result": v, "reason": r, "evidence": evidence(res)})
        out["parleys"].append({"title": p["title"], "odds_low": p["odds_low"], "result": combine(lr), "legs": lr})
    ch = parse_challenge(js)
    if ch:
        lr = []
        for leg in ch["legs"]:
            res = R.get(_norm(leg["match"])); mk = market_for(leg["match"], leg["selection"], cards)
            v, r = settle_pick(mk, leg["selection"], res)
            lr.append({**leg, "market": mk, "result": v, "reason": r, "evidence": evidence(res)})
        out["challenge"] = {"odds_low": ch["odds_low"], "result": combine(lr), "legs": lr}
    return out

if __name__ == "__main__":
    js = open(sys.argv[1], encoding="utf-8").read() if len(sys.argv) > 1 else ""
    results = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else {}
    print(json.dumps(settle_slate(js, results), indent=2, ensure_ascii=False))
