/* =============================================================================
   BetLife365 — bl-compose.js   (Phase 2 of the CLV / Edge-Book system)
   Adds the new red-thread fields to the "Add a bet" composer (#page-mybets):
     - Conviction  A=2u / B=1u / C=0.5u   (edge-based staking)
     - Book        Auto / Edge / Lottery  (Auto = inferred by bl-books.js)
     - Factor tags sport-aware chips from the handicapping playbook
     - Posted odds captured automatically (= the odds we took) for CLV later

   Purely additive: it INJECTS fields into the existing form and WRAPS the global
   addTrackManual() — it never edits the inline page code. Requires bl-books.js
   (window.BL.books). Safe if loaded before/after it (guards + polls).

   Drop-in: commit to repo root, add AFTER bl-books.js:
     <script defer src="/bl-books.js?v=1"></script>
     <script defer src="/bl-compose.js?v=1"></script>
   ============================================================================= */
(function (w, d) {
  "use strict";

  var CONV = { A: 2, B: 1, C: 0.5 };
  var CONV_LABEL = { A: "A · High (2u)", B: "B · Standard (1u)", C: "C · Lean (0.5u)" };

  // factor tags straight from the playbook (general always shown, sport adds more)
  var TAGS_GENERAL = ["value vs close", "fade the narrative", "news timing"];
  var TAGS_SPORT = {
    tennis: ["surface mismatch", "jetlag/travel", "rest edge", "long prev match", "motivation", "style matchup", "wind/heat", "balls/court speed"],
    football: ["rotation", "team-news", "motivation/stakes", "travel/int. break", "weather/pitch", "tactical matchup", "referee", "home/away split"],
    soccer: ["rotation", "team-news", "motivation/stakes", "travel/int. break", "weather/pitch", "tactical matchup", "referee", "home/away split"],
    nba: ["rest/B2B", "load mgmt", "pace matchup", "injury cascade", "schedule spot", "tank/seeding"],
    basketball: ["rest/B2B", "load mgmt", "pace matchup", "injury cascade", "schedule spot", "tank/seeding"],
    nhl: ["goalie confirm", "B2B/backup", "special teams", "travel"],
    hockey: ["goalie confirm", "B2B/backup", "special teams", "travel"],
    nfl: ["rest/bye", "weather/wind", "QB/injury", "divisional/revenge", "motivation"]
  };

  var selectedTags = [];

  function books() { return (w.BL && w.BL.books) || null; }
  function num(x) { var n = parseFloat(x); return isNaN(n) ? 0 : n; }
  function todayDMY() {
    var n = new Date(), p = function (x) { return (x < 10 ? "0" : "") + x; };
    return p(n.getDate()) + "-" + p(n.getMonth() + 1) + "-" + n.getFullYear();
  }
  function val(id) { var e = d.getElementById(id); return e ? ("" + e.value).trim() : ""; }
  function sportKey() { return val("tr_sport").toLowerCase().replace(/[^a-z]/g, ""); }
  function tagsForSport() {
    var k = sportKey(), extra = [];
    Object.keys(TAGS_SPORT).forEach(function (s) { if (k.indexOf(s) >= 0 && !extra.length) extra = TAGS_SPORT[s]; });
    return TAGS_GENERAL.concat(extra);
  }

  // ---- injection ------------------------------------------------------------
  function injected() { return !!d.getElementById("blComposeRow"); }
  function findForm() {
    var risk = d.getElementById("tr_risk"); if (!risk) return null;
    var grid = risk.closest(".grid2"); var section = risk.closest(".card");
    return grid && section ? { grid: grid, section: section, risk: risk } : null;
  }

  function fieldHTML() {
    var convOpts = '<option value="">—</option>' +
      ["A", "B", "C"].map(function (k) { return '<option value="' + k + '">' + CONV_LABEL[k] + '</option>'; }).join("");
    return '' +
      '<div class="field bl-cf"><label>Conviction <span class="bl-q" title="Edge tier → stake. A=2u strong CLV signal, B=1u clear value, C=0.5u lean.">?</span></label>' +
        '<select id="bl_conv">' + convOpts + '</select></div>' +
      '<div class="field bl-cf"><label>Book</label>' +
        '<select id="bl_book"><option value="auto">Auto (inferred)</option><option value="edge">Edge desk</option><option value="lottery">Lottery</option></select></div>';
  }

  function tagsRowHTML() {
    return '<div id="blComposeTags" class="bl-cf-tags"><div class="bl-cf-lbl">Factor tags <span class="bl-cf-sub">why this pick has an edge — tag 1–2</span></div>' +
      '<div class="bl-chips" id="blChips"></div></div>';
  }

  function renderChips() {
    var host = d.getElementById("blChips"); if (!host) return;
    var tags = tagsForSport();
    host.innerHTML = tags.map(function (t) {
      var on = selectedTags.indexOf(t) >= 0;
      return '<button type="button" class="bl-chip' + (on ? " on" : "") + '" data-tag="' + t.replace(/"/g, "&quot;") + '">' + t + "</button>";
    }).join("");
  }

  function hintHTML() { return '<div id="blComposeHint" class="bl-cf-hint"></div>'; }
  function updateHint() {
    var el = d.getElementById("blComposeHint"); if (!el) return;
    var b = books();
    var conv = val("bl_conv");
    var parts = [];
    if (conv && CONV[conv]) parts.push('<b>Suggested stake: ' + CONV[conv] + 'u</b>');
    if (b) {
      var exp = 0; try { exp = b.dailyEdgeExposure(b.load(), todayDMY()); } catch (e) { }
      var cap = (b.CAPS && b.CAPS.dailyEdgeU) || 8;
      var over = exp >= cap;
      var st = num(val("tr_stake"));
      var proj = exp + st;
      parts.push('Today’s edge exposure: <b class="' + (over ? "bl-bad" : "") + '">' + exp.toFixed(2) + 'u</b> / ' + cap + 'u cap' +
        (st ? ' &middot; after this: <b class="' + (proj > cap ? "bl-bad" : "") + '">' + proj.toFixed(2) + 'u</b>' : ''));
      var single = (b.CAPS && b.CAPS.singleMaxU) || 2;
      if (num(val("tr_stake")) > single) parts.push('<span class="bl-bad">over ' + single + 'u single cap</span>');
    }
    el.innerHTML = parts.join(' &nbsp;·&nbsp; ');
  }

  function inject() {
    if (injected()) return true;
    var f = findForm(); if (!f) return false;
    // 1) conviction + book fields, right after the Risk field
    var wrap = d.createElement("div"); wrap.style.display = "contents"; wrap.id = "blComposeRow";
    wrap.innerHTML = fieldHTML();
    if (f.risk.parentNode && f.risk.parentNode.nextSibling) f.grid.insertBefore(wrap, f.risk.parentNode.nextSibling);
    else f.grid.appendChild(wrap);
    // 2) tags + hint, after the grid (before the actions)
    var block = d.createElement("div"); block.id = "blComposeExtra";
    block.innerHTML = tagsRowHTML() + hintHTML();
    var actions = f.section.querySelector(".actions");
    if (actions) f.section.insertBefore(block, actions); else f.section.appendChild(block);
    renderChips();
    // events
    var chips = d.getElementById("blChips");
    if (chips) chips.addEventListener("click", function (e) {
      var btn = e.target.closest(".bl-chip"); if (!btn) return;
      var t = btn.getAttribute("data-tag");
      var i = selectedTags.indexOf(t);
      if (i >= 0) selectedTags.splice(i, 1); else selectedTags.push(t);
      btn.classList.toggle("on");
    });
    var conv = d.getElementById("bl_conv");
    if (conv) conv.addEventListener("change", function () {
      var c = conv.value, se = d.getElementById("tr_stake");
      if (c && CONV[c] && se && !("" + se.value).trim()) se.value = CONV[c]; // auto-fill stake if empty
      updateHint();
    });
    ["tr_stake", "tr_sport"].forEach(function (id) {
      var e = d.getElementById(id); if (!e) return;
      e.addEventListener("input", function () { if (id === "tr_sport") renderChips(); updateHint(); });
    });
    injectCSS();
    updateHint();
    return true;
  }

  // ---- wrap addTrackManual --------------------------------------------------
  var wrapped = false;
  function wrap() {
    if (wrapped || typeof w.addTrackManual !== "function") return;
    var orig = w.addTrackManual;
    w.addTrackManual = function () {
      var conv = val("bl_conv");
      var bookSel = val("bl_book") || "auto";
      var tags = selectedTags.slice();
      var before = (w.TR && w.TR.length) || 0;
      var ret = orig.apply(this, arguments);        // pushes + saves + clears + renders, or early-returns
      var after = (w.TR && w.TR.length) || 0;
      if (after > before && w.TR) {
        var b = books();
        for (var i = before; i < after; i++) {
          var e = w.TR[i]; if (!e) continue;
          e.postedOdds = e.postedOdds || e.odds;     // capture the price we took (for CLV)
          if (conv) e.conviction = conv;
          if (tags.length) e.factorTags = tags;
          e.book = (bookSel !== "auto") ? bookSel : (b ? b.bookOf(e) : undefined);
        }
        try { w.saveTR && w.saveTR(); } catch (er) { }
        // reset my controls
        selectedTags = [];
        var cs = d.getElementById("bl_conv"); if (cs) cs.value = "";
        var bs = d.getElementById("bl_book"); if (bs) bs.value = "auto";
        renderChips(); updateHint();
        try { w.renderTrack && w.renderTrack(); } catch (er) { }
        try { b && b.render(); } catch (er) { }
      }
      return ret;
    };
    wrapped = true;
  }

  // ---- css ------------------------------------------------------------------
  function injectCSS() {
    if (d.getElementById("blComposeCSS")) return;
    var s = d.createElement("style"); s.id = "blComposeCSS";
    s.textContent = [
      ".bl-q{display:inline-block;width:15px;height:15px;line-height:15px;text-align:center;border-radius:50%;background:rgba(255,255,255,.12);color:#c7ccd4;font-size:10px;cursor:help;font-weight:700}",
      "#blComposeExtra{margin-top:12px}",
      ".bl-cf-lbl{font-size:12.5px;font-weight:600;color:#c7ccd4;margin-bottom:7px}",
      ".bl-cf-sub{font-weight:400;color:#7d828d;font-size:11.5px;margin-left:6px}",
      ".bl-chips{display:flex;flex-wrap:wrap;gap:7px}",
      ".bl-chip{background:#0e0f13;border:1px solid #2a2e37;color:#c7ccd4;border-radius:20px;padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer;transition:all .12s}",
      ".bl-chip:hover{border-color:#3a3f4a}",
      ".bl-chip.on{background:rgba(240,120,42,.16);border-color:#f0782a;color:#f0a36a}",
      ".bl-cf-hint{margin-top:11px;font-size:12.5px;color:#9aa0ab;line-height:1.5}",
      ".bl-cf-hint b{color:#e9eaee}.bl-cf-hint .bl-bad{color:#ff6a4d}"
    ].join("");
    d.head.appendChild(s);
  }

  // ---- boot -----------------------------------------------------------------
  function tick() { try { inject(); wrap(); } catch (e) { } }
  function boot() { tick(); var n = 0, iv = setInterval(function () { if (++n > 60) return clearInterval(iv); tick(); }, 700); }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 900); });
  else setTimeout(boot, 900);
  // re-inject when navigating to the log page (pages toggle display)
  d.addEventListener("click", function () { setTimeout(tick, 120); });

})(window, document);
