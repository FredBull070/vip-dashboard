/* =============================================================================
   BetLife365 — bl-books.js   (Phase 1 of the CLV / Edge-Book system)
   Single source of truth for the new "red thread":
     - Two ring-fenced books: EDGE (our real, CLV-judged desk) vs LOTTERY (fun long-shots)
     - Conviction-based staking (A=2u / B=1u / C=0.5u, quarter-Kelly cap)
     - Exposure caps + CLV ("beat the close") helpers
     - A self-mounting Edge vs Lottery split panel at the TOP of #page-trackrecord

   Backward-compatible: existing trackrecord entries have no `book`/`conviction`/
   `postedOdds`/`closingOdds` fields — they are INFERRED here so nothing breaks.
   New picks should write these fields explicitly (Phase 2 = composer).

   Drop-in: commit to repo root, add <script defer src="/bl-books.js?v=1"></script>
   in index.html <head>. Reads localStorage `ba_trackrecord`. No writes. Additive.
   ============================================================================= */
(function (w) {
  "use strict";

  // ---- schema constants (the new red thread) -------------------------------
  var CONVICTION_STAKE = { A: 2, B: 1, C: 0.5 };      // units, Edge Book
  var CAPS = {
    singleMaxU: 2,        // no single Edge-Book bet above 2u (~quarter-Kelly cap)
    dailyEdgeU: 8,        // max combined Edge-Book stake per day
    correlatedU: 3,       // max stake on outcomes sharing one driver
    lotteryBankPct: 5     // Lottery Book ring-fenced to <=5% of bankroll
  };
  var DRAWDOWN = [
    { toPct: -15, action: "Normal staking." },
    { toPct: -25, action: "Halve the unit (stake 0.5x). Audit factor tags." },
    { toPct: -100, action: "Pause new bets. Full review: variance or decayed edge?" }
  ];

  // ---- tiny helpers (self-contained, mirror the ledger) --------------------
  function num(x) { var n = parseFloat(x); return isNaN(n) ? 0 : n; }
  var DEC = { W: 1, L: 1, V: 1, Push: 1 };
  function load() { try { return JSON.parse(localStorage.getItem("ba_trackrecord") || "[]"); } catch (e) { return []; } }
  function ep(d) { var p = ("" + (d || "")).split("-"); return p.length === 3 ? new Date(+p[2], +p[1] - 1, +p[0]).getTime() : 0; }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function isLuckyLeg(r) { return r && r.kind !== "parley" && !r.prop && ("" + (r.risk || "")).toLowerCase() === "very high"; }
  function tierOf(r) {
    var s = ("" + (r.selection || "")).toLowerCase();
    if (/lucky/.test(s)) return "lucky";
    if (/jackpot/.test(s)) return "jackpot";
    if (/value/.test(s)) return "value";
    if (/safe/.test(s)) return "safe";
    var rk = ("" + (r.risk || "")).toLowerCase();
    if (rk === "low") return "safe";
    if (rk === "medium") return "value";
    if (rk === "high" || rk === "very high") return "jackpot";
    return "";
  }

  // ---- THE classifier: edge vs lottery -------------------------------------
  // Explicit r.book wins. Otherwise infer: long-shots (jackpot / lucky / the
  // $10->$1K challenge) are LOTTERY; everything else (safe/value singles,
  // props, low-variance builders) is EDGE.
  function bookOf(r) {
    if (r && (r.book === "edge" || r.book === "lottery")) return r.book;
    var sel = ("" + ((r && r.selection) || "") + " " + ((r && r.match) || "")).toLowerCase();
    if (/challenge|10.?to.?1k|10.?→.?1k/.test(sel)) return "lottery";
    if (isLuckyLeg(r)) return "lottery";
    var t = tierOf(r);
    if (t === "jackpot" || t === "lucky") return "lottery";
    return "edge";
  }

  // ---- CLV ("beat the close") ----------------------------------------------
  // Positive when we posted BIGGER odds than the closing line.
  // v1 = raw decimal ratio (not de-vigged). closingOdds must be supplied later.
  function postedOddsOf(r) { return num((r && (r.postedOdds != null ? r.postedOdds : r.odds)) || 0); }
  function clvOf(r) {
    if (!r) return null;
    if (r.clv != null && r.clv !== "") { var c = num(r.clv); return isFinite(c) ? c : null; }
    var posted = postedOddsOf(r), close = num(r.closingOdds);
    if (posted > 1 && close > 1) return (posted / close - 1) * 100;
    return null;
  }

  // ---- stats ----------------------------------------------------------------
  function compute(rows) {
    var staked = 0, profit = 0, w = 0, l = 0, open = 0, settled = 0;
    rows.forEach(function (r) {
      if (!DEC[r.result]) { open++; return; }
      if (r.result === "V" || r.result === "Push") return;
      settled++;
      var s = num(r.stake), o = num(r.odds); staked += s;
      if (r.result === "W") { profit += s * (o - 1); w++; }
      else if (r.result === "L") { profit -= s; l++; }
    });
    var n = w + l;
    return { profit: profit, roi: staked ? 100 * profit / staked : 0, wr: n ? 100 * w / n : 0, w: w, l: l, open: open, staked: staked, settled: settled };
  }
  function avgCLV(rows) {
    var vals = rows.map(clvOf).filter(function (v) { return v != null && isFinite(v); });
    if (!vals.length) return null;
    return vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
  }

  // ---- exposure / staking helpers (used by Phase 2 composer + guards) -------
  function convictionStake(conv) { return CONVICTION_STAKE[("" + conv).toUpperCase()] || 0; }
  function dailyEdgeExposure(rows, date) {
    return rows.filter(function (r) { return bookOf(r) === "edge" && (!date || r.date === date) && !DEC[r.result]; })
      .reduce(function (a, r) { return a + num(r.stake); }, 0);
  }
  function drawdownAction(pctFromPeak) {
    for (var i = 0; i < DRAWDOWN.length; i++) if (pctFromPeak >= DRAWDOWN[i].toPct) return DRAWDOWN[i].action;
    return DRAWDOWN[DRAWDOWN.length - 1].action;
  }

  // ---- public API -----------------------------------------------------------
  var BL = w.BL || {};
  BL.books = {
    CONVICTION_STAKE: CONVICTION_STAKE, CAPS: CAPS, DRAWDOWN: DRAWDOWN,
    bookOf: bookOf, tierOf: tierOf, clvOf: clvOf, postedOddsOf: postedOddsOf,
    compute: compute, avgCLV: avgCLV, convictionStake: convictionStake,
    dailyEdgeExposure: dailyEdgeExposure, drawdownAction: drawdownAction,
    load: load
  };
  w.BL = BL;

  // ==========================================================================
  //  UI: Edge Book vs Lottery Book split panel (top of #page-trackrecord)
  // ==========================================================================
  function fmtSigned(u) { return (u >= 0 ? "+" : "") + (Math.round(u * 10) / 10).toFixed(1) + "u"; }

  function bookCard(title, sub, rows, opts) {
    opts = opts || {};
    var s = compute(rows);
    var pc = s.profit >= 0 ? "pos" : "neg", rc = s.roi >= 0 ? "pos" : "neg";
    var clv = avgCLV(rows);
    var clvCell;
    if (opts.showCLV) {
      clvCell = clv == null
        ? '<div class="blb-m"><div class="blb-v muted">— </div><div class="blb-k">Avg CLV · <span class="blb-pending">close source pending</span></div></div>'
        : '<div class="blb-m"><div class="blb-v ' + (clv >= 0 ? "pos" : "neg") + '">' + (clv >= 0 ? "+" : "") + clv.toFixed(1) + '%</div><div class="blb-k">Avg CLV (beat the close)</div></div>';
    } else {
      clvCell = '<div class="blb-m"><div class="blb-v muted">' + rows.length + '</div><div class="blb-k">Tickets (long-shots)</div></div>';
    }
    return '<div class="blb-card ' + esc(opts.cls || "") + '">' +
      '<div class="blb-h"><span class="blb-badge ' + esc(opts.cls || "") + '">' + esc(title) + '</span><span class="blb-sub">' + esc(sub) + '</span></div>' +
      '<div class="blb-big ' + pc + '">' + fmtSigned(s.profit) + '</div>' +
      '<div class="blb-grid">' +
        '<div class="blb-m"><div class="blb-v ' + rc + '">' + (s.roi >= 0 ? "+" : "") + s.roi.toFixed(1) + '%</div><div class="blb-k">ROI</div></div>' +
        '<div class="blb-m"><div class="blb-v">' + s.wr.toFixed(0) + '%</div><div class="blb-k">Strike</div></div>' +
        '<div class="blb-m"><div class="blb-v">' + s.settled + '</div><div class="blb-k">Settled</div></div>' +
        clvCell +
      '</div></div>';
  }

  function buildPanel(rows) {
    var vis = rows.filter(function (r) { return r.public !== false; });
    var edge = vis.filter(function (r) { return bookOf(r) === "edge" && !isLuckyLeg(r); });
    var lottery = vis.filter(function (r) { return bookOf(r) === "lottery"; });
    return '<div class="blb-wrap">' +
      '<div class="blb-title"><span class="blb-dot"></span> Two books, judged separately' +
        '<span class="blb-hint">Edge = our real desk (ROI + CLV). Lottery = ring-fenced long-shots, never in the headline.</span></div>' +
      '<div class="blb-two">' +
        bookCard("EDGE BOOK", "singles + +EV builders", edge, { cls: "edge", showCLV: true }) +
        bookCard("LOTTERY BOOK", "jackpots · lucky shots · challenge", lottery, { cls: "lottery", showCLV: false }) +
      '</div></div>';
  }

  function injectCSS() {
    if (document.getElementById("blBooksCSS")) return;
    var s = document.createElement("style"); s.id = "blBooksCSS";
    s.textContent = [
      ".blb-wrap{font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#e9eaee;margin-bottom:14px}",
      ".blb-wrap .pos{color:#35c66b}.blb-wrap .neg{color:#ff6a4d}.blb-wrap .muted{color:#7d828d}",
      ".blb-title{display:flex;align-items:center;gap:9px;flex-wrap:wrap;font-weight:600;font-size:14px;margin:2px 2px 10px}",
      ".blb-dot{width:8px;height:8px;border-radius:50%;background:#f0782a;display:inline-block}",
      ".blb-hint{color:#7d828d;font-size:12px;font-weight:400}",
      ".blb-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}",
      ".blb-card{background:#121317;border:1px solid #232631;border-radius:16px;padding:16px 18px;position:relative;overflow:hidden}",
      ".blb-card.edge{border-color:rgba(53,198,107,.35)}.blb-card.lottery{border-color:rgba(178,120,255,.30)}",
      ".blb-card:before{content:'';position:absolute;top:0;left:0;right:0;height:3px}",
      ".blb-card.edge:before{background:#35c66b}.blb-card.lottery:before{background:#b27aff}",
      ".blb-h{display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap}",
      ".blb-badge{font-size:11px;font-weight:800;letter-spacing:.6px;padding:3px 9px;border-radius:20px}",
      ".blb-badge.edge{background:rgba(53,198,107,.14);color:#35c66b}.blb-badge.lottery{background:rgba(178,120,255,.16);color:#b27aff}",
      ".blb-sub{color:#7d828d;font-size:12px}",
      ".blb-big{font-size:34px;font-weight:800;line-height:1;letter-spacing:-.5px;margin:2px 0 12px}",
      ".blb-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}",
      ".blb-m .blb-v{font-size:17px;font-weight:700}.blb-m .blb-k{color:#7d828d;font-size:11px;margin-top:1px}",
      ".blb-pending{color:#f0a36a}",
      "@media(max-width:760px){.blb-two{grid-template-columns:1fr}.blb-grid{grid-template-columns:repeat(2,1fr)}}"
    ].join("");
    document.head.appendChild(s);
  }

  var box = null;
  function render() {
    var host = document.getElementById("page-trackrecord"); if (!host) return;
    injectCSS();
    if (!box || !box.isConnected) {
      box = document.createElement("div"); box.id = "blBooks";
      // mount at the very top of the track-record page, above the ledger
      host.insertBefore(box, host.firstChild);
    } else if (host.firstChild !== box) {
      host.insertBefore(box, host.firstChild);
    }
    try { box.innerHTML = buildPanel(load()); } catch (e) { /* never break the page */ }
  }
  BL.books.render = render;

  // mount + keep alive (the ledger rebuilds its own node; we just stay on top)
  function boot() { render(); var n = 0, iv = setInterval(function () { if (++n > 40) return clearInterval(iv); render(); }, 750); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 900); });
  else setTimeout(boot, 900);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) render(); });

})(window);
