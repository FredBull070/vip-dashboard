/* BetLife365 · VIP Results photo composer (drop-in module)
   Adds a "Share a slip" sub-tab to the VIP Results page (#page-vip / #subbar).
   - Pick settled bets from the public track record
   - Attach one or more photos of the bet slip
   - Choose per post what goes on the card: units, running record, VIP invite
   - Posts to Discord (VIP RESULTS webhook, saved in Settings) WITH the photos attached
   Loaded from index.html via: <script defer src="/vip-results-composer.js?v=1"></scr` + `ipt>
*/
(function () {
  if (window.__vrcInit) return;
  window.__vrcInit = true;

  var RAW = "https://raw.githubusercontent.com/FredBull070/vip-dashboard/main/trackrecord.json";
  var KNOWN = ["vip-perf", "vip-cards", "vip-challenge", "vip-cardsresult"];
  var ALL = [], photos = [], record = { w: 0, l: 0 }, loaded = false;

  function $(id) { return document.getElementById(id); }
  function norm(s) { return (s || "").toString().trim().toLowerCase(); }
  function esc(s) { return (s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var CSS = [
    "#vip-share .vrc-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:0 0 4px}",
    "#vip-share .vrc-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:16px}",
    "@media(max-width:860px){#vip-share .vrc-grid{grid-template-columns:1fr}}",
    "#vip-share .vrc-col{background:rgba(255,255,255,.02);border:1px solid var(--line2);border-radius:14px;padding:14px 14px 16px}",
    "#vip-share .vrc-step{display:flex;align-items:center;gap:8px;font-size:11px;letter-spacing:.6px;text-transform:uppercase;color:var(--muted);font-weight:700;margin:0 0 12px}",
    "#vip-share .vrc-step b{display:inline-flex;align-items:center;justify-content:center;width:19px;height:19px;border-radius:50%;background:var(--accent);color:#1c0d00;font-size:11px;font-weight:800}",
    "#vip-share .vrc-substep{font-size:11px;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);font-weight:700;margin:16px 0 8px}",
    "#vip-share .vrc-row2{display:flex;gap:10px;margin-bottom:10px}#vip-share .vrc-row2>*{flex:1;min-width:0}",
    "#vip-share select,#vip-share .vrc-in{width:100%;background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:11px;color:var(--text);padding:10px 12px;font:inherit;font-size:14px}",
    "#vip-share textarea.vrc-in{resize:vertical;min-height:52px}",
    "#vip-share .vrc-lbl{display:block;font-size:12px;color:var(--muted);margin:0 0 5px}",
    "#vip-share .vrc-bets{max-height:330px;overflow:auto;display:flex;flex-direction:column;gap:6px}",
    "#vip-share .vrc-bet{display:flex;gap:10px;align-items:flex-start;padding:9px 11px;border:1px solid var(--line);border-radius:11px;background:rgba(255,255,255,.02);cursor:pointer}",
    "#vip-share .vrc-bet:hover{border-color:var(--accent)}",
    "#vip-share .vrc-bet input{margin-top:3px;accent-color:var(--accent);width:15px;height:15px;flex-shrink:0}",
    "#vip-share .vrc-bet .info{flex:1;min-width:0}",
    "#vip-share .vrc-bet .top{display:flex;justify-content:space-between;gap:8px}",
    "#vip-share .vrc-bet .m{font-weight:600;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    "#vip-share .vrc-bet .sel{color:var(--muted);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    "#vip-share .vrc-bet .meta{color:var(--muted);font-size:11px;margin-top:2px;opacity:.8}",
    "#vip-share .vrc-pill{font-size:11px;font-weight:800;padding:2px 8px;border-radius:20px;flex-shrink:0;height:fit-content}",
    "#vip-share .vrc-pill.W{background:rgba(48,209,88,.15);color:var(--green)}",
    "#vip-share .vrc-pill.L{background:rgba(255,69,58,.14);color:var(--red)}",
    "#vip-share .vrc-drop{border:1.5px dashed var(--line);border-radius:12px;padding:18px;text-align:center;color:var(--muted);font-size:13px;cursor:pointer;background:rgba(255,255,255,.02);transition:.15s}",
    "#vip-share .vrc-drop.over{border-color:var(--accent);color:var(--text);background:rgba(255,122,26,.06)}",
    "#vip-share .vrc-thumbs{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 0}",
    "#vip-share .vrc-thumb{position:relative;width:64px;height:64px}",
    "#vip-share .vrc-thumb img{width:64px;height:64px;object-fit:cover;border-radius:10px;border:1px solid var(--line)}",
    "#vip-share .vrc-thumb button{position:absolute;top:-6px;right:-6px;width:19px;height:19px;border:none;border-radius:50%;background:var(--red);color:#fff;font-size:12px;cursor:pointer;line-height:1}",
    "#vip-share .vrc-preview-wrap{margin-top:16px}",
    "#vip-share .vrc-dc{background:#313338;border-radius:10px;color:#dbdee1;font-size:14px;padding:2px 0;margin-top:8px;max-width:520px}",
    "#vip-share .vrc-embed{border-left:4px solid var(--green);background:#2b2d31;border-radius:4px;margin:8px 12px;padding:10px 14px 12px}",
    "#vip-share .vrc-dc.loss .vrc-embed{border-left-color:var(--red)}",
    "#vip-share .vrc-et{font-weight:700;margin:2px 0 6px;font-size:15px}",
    "#vip-share .vrc-leg{font-size:13.5px;margin:2px 0}#vip-share .vrc-leg small{color:#b5bac1}",
    "#vip-share .vrc-tot{margin-top:8px;font-size:13.5px}",
    "#vip-share .vrc-rec{margin-top:6px;font-size:12px;color:#b5bac1}",
    "#vip-share .vrc-cta{margin-top:8px;font-size:13px;color:#c9cdd3}",
    "#vip-share .vrc-imgs{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}",
    "#vip-share .vrc-imgs img{max-width:150px;max-height:150px;border-radius:6px}",
    "#vip-share .vrc-foot{font-size:11px;color:#949ba4;margin:8px 14px 6px}",
    "#vip-share .vrc-checks{display:flex;flex-direction:column;gap:4px}",
    "#vip-share .vrc-check{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text);cursor:pointer}",
    "#vip-share .vrc-check input{accent-color:var(--accent);width:15px;height:15px}",
    "#vip-share .vrc-hint{font-size:11.5px;color:var(--muted);margin-top:12px}",
    "#vip-share .vrc-status{font-size:13px;margin-top:10px;min-height:18px}",
    "#vip-share .vrc-actions{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap}",
    "#vip-share .vrc-actions .btn,#vip-share .vrc-actions .btn-secondary{flex:1;min-width:160px}"
  ].join("");

  var HTML =
    '<section class="card">' +
    '<div class="vrc-head"><h2 class="section-title" style="margin:0">📸 Share a result with a photo</h2></div>' +
    '<p class="section-sub">Tick your slip, drag in the photo(s) and share it to your VIP Results channel. This is what non‑members see — short, honest and convincing. The win/loss badge, your text and the photo always go out; you choose the rest.</p>' +
    '<div class="vrc-grid">' +
      '<div class="vrc-col">' +
        '<div class="vrc-step"><b>1</b> Pick your bets</div>' +
        '<div class="vrc-row2">' +
          '<div><label class="vrc-lbl">Show</label><select id="vrcFilter"><option value="W">Won only</option><option value="L">Lost only</option><option value="all">All</option></select></div>' +
          '<div><label class="vrc-lbl">Period</label><select id="vrcDays"><option value="7">7 days</option><option value="14">14 days</option><option value="30" selected>30 days</option><option value="90">90 days</option></select></div>' +
        '</div>' +
        '<div id="vrcBets" class="vrc-bets"><p style="color:var(--muted);font-size:13px">Loading…</p></div>' +
      '</div>' +
      '<div class="vrc-col">' +
        '<div class="vrc-step"><b>2</b> Photos &amp; text</div>' +
        '<div id="vrcDrop" class="vrc-drop">📸 Drag your slip photo(s) here, or click to choose</div>' +
        '<input id="vrcFile" type="file" accept="image/*" multiple hidden>' +
        '<div id="vrcThumbs" class="vrc-thumbs"></div>' +
        '<div class="vrc-row2" style="margin-top:12px">' +
          '<div><label class="vrc-lbl">Stake (units)</label><input id="vrcStake" class="vrc-in" type="number" step="0.5" min="0" value="1"></div>' +
          '<div><label class="vrc-lbl">Title (optional)</label><input id="vrcTitle" class="vrc-in" type="text" placeholder="automatic"></div>' +
        '</div>' +
        '<label class="vrc-lbl">Your own text (optional)</label>' +
        '<textarea id="vrcNote" class="vrc-in" placeholder="Short personal line… (empty = clean)"></textarea>' +
        '<div class="vrc-substep">What goes on the card</div>' +
        '<div class="vrc-checks">' +
          '<label class="vrc-check"><input type="checkbox" id="vrcUnits" checked> Profit in units (+/–u)</label>' +
          '<label class="vrc-check"><input type="checkbox" id="vrcRecord" checked> Running record (e.g. 24W-9L)</label>' +
          '<label class="vrc-check"><input type="checkbox" id="vrcCta" checked> Subtle VIP invite</label>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="vrc-preview-wrap">' +
      '<div class="vrc-step"><b>3</b> Preview &amp; share</div>' +
      '<div id="vrcPreview" class="vrc-dc"><div style="padding:14px;color:#949ba4;font-size:13px">Select one or more bets…</div></div>' +
      '<div id="vrcHook" class="vrc-hint"></div>' +
      '<div class="vrc-actions">' +
        '<button id="vrcSend" class="btn" disabled>Share to VIP Results</button>' +
        '<button id="vrcCopy" class="btn-secondary" disabled>Copy text</button>' +
      '</div>' +
      '<div id="vrcStatus" class="vrc-status"></div>' +
    '</div>' +
    '</section>';

  function ords(e) { var m = (e.date || "").match(/(\d{1,2})-(\d{1,2})-(\d{4})/); return m ? new Date(m[3], m[2] - 1, m[1]).getTime() : 0; }

  function render() {
    if (!$("vrcFilter")) return;
    var fl = norm($("vrcFilter").value), dy = +$("vrcDays").value;
    var cut = new Date(Date.now() - dy * 864e5);
    var rows = ALL.filter(function (e) {
      var r = norm(e.result);
      if (fl !== "all" && r !== fl) return false;
      if (r !== "w" && r !== "l") return false;
      var m = (e.date || "").match(/(\d{1,2})-(\d{1,2})-(\d{4})/); if (!m) return false;
      return new Date(m[3], m[2] - 1, m[1]) >= cut;
    }).sort(function (a, b) { return ords(b) - ords(a); });
    var host = $("vrcBets");
    if (!rows.length) { host.innerHTML = '<p style="color:var(--muted);font-size:13px">No bets in this period.</p>'; return; }
    host.innerHTML = rows.map(function (e) {
      var R = norm(e.result).toUpperCase();
      return '<label class="vrc-bet"><input type="checkbox" data-i="' + ALL.indexOf(e) + '">' +
        '<div class="info"><div class="top"><span class="m">' + esc(e.match || e.selection || "") + '</span>' +
        '<span class="vrc-pill ' + R + '">' + (R === "W" ? "✅ Won" : "❌ Lost") + '</span></div>' +
        '<div class="sel">' + esc(e.selection || "") + ' ' + (e.odds ? "· @" + e.odds : "") + '</div>' +
        '<div class="meta">' + esc(e.sport || "") + ' · ' + esc(e.date || "") + '</div></div></label>';
    }).join("");
  }

  function selected() { return [].slice.call($("vrcBets").querySelectorAll("input:checked")).map(function (c) { return ALL[+c.dataset.i]; }); }

  function model() {
    var bets = selected(); if (!bets.length) return null;
    var won = bets.every(function (b) { return norm(b.result) === "w"; });
    var lost = bets.some(function (b) { return norm(b.result) === "l"; });
    var combo = bets.reduce(function (a, b) { return a * (parseFloat(b.odds) || 1); }, 1);
    var stake = parseFloat($("vrcStake").value) || 0;
    var profit = won ? ((combo - 1) * stake) : (lost ? -stake : 0);
    return { bets: bets, won: won, lost: lost, combo: combo, stake: stake, profit: profit };
  }

  function defaultTitle(m) { return m.won ? "✅ Won" : "❌ Just missed"; }
  function ctaLine(m) { return m.won ? "This went to VIP first. Join us? 👑" : "We post everything — misses too. The wins cover them. 👑"; }

  function build() {
    var m = model(), pv = $("vrcPreview");
    $("vrcSend").disabled = $("vrcCopy").disabled = !m;
    if (!m) { pv.className = "vrc-dc"; pv.innerHTML = '<div style="padding:14px;color:#949ba4;font-size:13px">Select one or more bets…</div>'; return; }
    var showU = $("vrcUnits").checked, showR = $("vrcRecord").checked;
    var title = $("vrcTitle").value.trim() || defaultTitle(m);
    var note = $("vrcNote").value.trim();
    var legs = m.bets.map(function (b) { return '<div class="vrc-leg">• ' + esc(b.selection || b.match) + ' <small>' + (b.odds ? "@" + b.odds : "") + '</small></div>'; }).join("");
    var tot = !showU ? "" : (m.bets.length > 1
      ? '<div class="vrc-tot"><b>Total odds @' + m.combo.toFixed(2) + '</b>' + (m.won && m.stake ? ' · +' + m.profit.toFixed(2) + 'u' : (m.lost && m.stake ? ' · ' + m.profit.toFixed(2) + 'u' : "")) + '</div>'
      : (m.stake ? '<div class="vrc-tot"><b>' + (m.won ? "+" + m.profit.toFixed(2) : m.profit.toFixed(2)) + 'u</b></div>' : ""));
    pv.className = "vrc-dc" + (m.won ? "" : " loss");
    pv.innerHTML = '<div class="vrc-embed">' +
      (note ? '<div class="vrc-leg" style="margin-bottom:6px;color:#dbdee1">' + esc(note) + '</div>' : "") +
      '<div class="vrc-et">' + esc(title) + '</div>' + legs + tot +
      (showR ? '<div class="vrc-rec">📊 Record: ' + record.w + 'W-' + record.l + 'L</div>' : "") +
      ($("vrcCta").checked ? '<div class="vrc-cta">' + ctaLine(m) + '</div>' : "") +
      (photos.length ? '<div class="vrc-imgs">' + photos.map(function (p) { return '<img src="' + p.url + '">'; }).join("") + '</div>' : "") +
      '<div class="vrc-foot">18+ · play responsibly</div></div>';
  }

  function textVersion() {
    var m = model(); if (!m) return "";
    var showU = $("vrcUnits").checked, showR = $("vrcRecord").checked;
    var title = $("vrcTitle").value.trim() || defaultTitle(m);
    var note = $("vrcNote").value.trim();
    var out = (note ? note + "\n\n" : "") + "**" + title + "**\n";
    m.bets.forEach(function (b) { out += "• " + (b.selection || b.match) + (b.odds ? " @" + b.odds : "") + "\n"; });
    if (showU) {
      if (m.bets.length > 1) out += "Total odds @" + m.combo.toFixed(2) + (m.stake ? (m.won ? "  ·  +" + m.profit.toFixed(2) + "u" : (m.lost ? "  ·  " + m.profit.toFixed(2) + "u" : "")) : "") + "\n";
      else if (m.stake) out += (m.won ? "+" + m.profit.toFixed(2) : m.profit.toFixed(2)) + "u\n";
    }
    if (showR) out += "📊 Record: " + record.w + "W-" + record.l + "L\n";
    if ($("vrcCta").checked) out += ctaLine(m) + "\n";
    out += "18+ · play responsibly";
    return out;
  }

  function status(t, ok) { var s = $("vrcStatus"); if (!s) return; s.textContent = t; s.style.color = ok === 1 ? "var(--green)" : ok === 0 ? "var(--red)" : "var(--muted)"; }

  function addFiles(fs) {
    [].slice.call(fs).forEach(function (f) {
      if (!f.type || f.type.indexOf("image/") !== 0) return;
      var rd = new FileReader();
      rd.onload = function (ev) { photos.push({ file: f, url: ev.target.result, name: (f.name || "photo.png").replace(/[^a-z0-9._-]/gi, "_") }); renderThumbs(); build(); };
      rd.readAsDataURL(f);
    });
  }
  function renderThumbs() {
    $("vrcThumbs").innerHTML = photos.map(function (p, i) { return '<div class="vrc-thumb"><img src="' + p.url + '"><button data-rm="' + i + '">×</button></div>'; }).join("");
  }

  function hookInfo() {
    var h = (localStorage.getItem("ba_hook_RESULTS") || "").trim();
    var ok = /^https:\/\/discord(app)?\.com\/api\/webhooks\//.test(h);
    var el = $("vrcHook"); if (!el) return;
    if (ok) el.innerHTML = "Goes to your <b>VIP RESULTS</b> channel (webhook is set under Settings › Channels).";
    else el.innerHTML = '<span style="color:var(--amber)">Set your VIP RESULTS webhook under Settings › Channels first — then this button shares there automatically.</span>';
  }

  async function send() {
    var m = model(); if (!m) return;
    var hook = (localStorage.getItem("ba_hook_RESULTS") || "").trim();
    if (!/^https:\/\/discord(app)?\.com\/api\/webhooks\//.test(hook)) { status("No valid VIP RESULTS webhook. Set it under Settings › Channels.", 0); return; }
    status("Sending…");
    var showU = $("vrcUnits").checked, showR = $("vrcRecord").checked;
    var title = $("vrcTitle").value.trim() || defaultTitle(m);
    var note = $("vrcNote").value.trim();
    var desc = (note ? note + "\n\n" : "");
    m.bets.forEach(function (b) { desc += "• " + (b.selection || b.match) + (b.odds ? " @" + b.odds : "") + "\n"; });
    if (showU) {
      if (m.bets.length > 1) desc += "\n**Total odds @" + m.combo.toFixed(2) + "**" + (m.stake ? (m.won ? "  ·  +" + m.profit.toFixed(2) + "u" : (m.lost ? "  ·  " + m.profit.toFixed(2) + "u" : "")) : "");
      else if (m.stake) desc += "\n**" + (m.won ? "+" + m.profit.toFixed(2) : m.profit.toFixed(2)) + "u**";
    }
    if ($("vrcCta").checked) desc += "\n\n" + ctaLine(m);
    var embed = { title: title, description: desc, color: m.won ? 3196011 : 15548485, footer: { text: showR ? ("18+ · play responsibly · Record " + record.w + "W-" + record.l + "L") : "18+ · play responsibly" } };
    if (photos.length) embed.image = { url: "attachment://" + photos[0].name };
    var fd = new FormData();
    fd.append("payload_json", JSON.stringify({ username: "BetLife365 · Results", embeds: [embed] }));
    photos.forEach(function (p, i) { fd.append("files[" + i + "]", p.file, p.name); });
    try {
      var r = await fetch(hook, { method: "POST", body: fd });
      if (r.ok || r.status === 204 || r.status === 200) {
        status("✅ Shared to VIP Results!", 1);
        photos = []; renderThumbs();
        [].slice.call($("vrcBets").querySelectorAll("input:checked")).forEach(function (c) { c.checked = false; });
        build();
      } else { status("Discord returned status " + r.status + ". Check the webhook.", 0); }
    } catch (e) { status("Sending failed: " + e.message, 0); }
  }

  async function load() {
    if (loaded) { render(); return; }
    try {
      var r = await fetch(RAW + "?t=" + Date.now(), { cache: "no-store" });
      ALL = await r.json();
      record = { w: ALL.filter(function (e) { return norm(e.result) === "w"; }).length, l: ALL.filter(function (e) { return norm(e.result) === "l"; }).length };
      loaded = true;
      render();
    } catch (e) { if ($("vrcBets")) $("vrcBets").innerHTML = '<p style="color:var(--red);font-size:13px">Could not load the track record. Check your connection.</p>'; }
  }

  function wire() {
    $("vrcFilter").onchange = render;
    $("vrcDays").onchange = render;
    ["vrcStake", "vrcTitle", "vrcNote", "vrcUnits", "vrcRecord", "vrcCta"].forEach(function (id) { $(id).addEventListener("input", build); });
    ["vrcUnits", "vrcRecord", "vrcCta"].forEach(function (id) {
      var v = localStorage.getItem("bl_" + id); if (v !== null) $(id).checked = (v === "1");
      $(id).addEventListener("change", function () { localStorage.setItem("bl_" + id, $(id).checked ? "1" : "0"); build(); });
    });
    var st = localStorage.getItem("bl_vrcStake"); if (st !== null) $("vrcStake").value = st;
    $("vrcStake").addEventListener("input", function () { localStorage.setItem("bl_vrcStake", $("vrcStake").value); });

    var drop = $("vrcDrop");
    drop.onclick = function () { $("vrcFile").click(); };
    $("vrcFile").onchange = function (e) { addFiles(e.target.files); };
    ["dragover", "dragenter"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("over"); }); });
    ["dragleave", "drop"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("over"); }); });
    drop.addEventListener("drop", function (e) { addFiles(e.dataTransfer.files); });

    $("vip-share").addEventListener("change", function (e) { if (e.target.matches('.vrc-bet input')) build(); });
    $("vrcThumbs").addEventListener("click", function (e) { var b = e.target.closest("button[data-rm]"); if (b) { photos.splice(+b.dataset.rm, 1); renderThumbs(); build(); } });

    $("vrcSend").addEventListener("click", send);
    $("vrcCopy").addEventListener("click", function () { navigator.clipboard.writeText(textVersion()).then(function () { status("✓ Text copied", 1); }); });
    hookInfo();
  }

  /* show my sub-tab: hide the other vip panels, show mine, set active states */
  function vrcShow() {
    KNOWN.forEach(function (id) { var e = $(id); if (e) e.style.display = "none"; });
    var mine = $("vip-share"); if (mine) mine.style.display = "block";
    [].slice.call(document.querySelectorAll("#subbar .subtab")).forEach(function (b) { b.classList.remove("active"); });
    var mb = $("vrcTabBtn"); if (mb) mb.classList.add("active");
    load();
  }
  window.vrcShow = vrcShow;

  /* ensure the sub-tab button + panel exist while on the VIP Results page */
  function ensure() {
    var page = $("page-vip"), bar = $("subbar");
    if (!page || !bar) return false;
    var isVip = !![].slice.call(bar.querySelectorAll(".subtab")).find(function (b) { return /showSub\(\s*['"]vip['"]/.test(b.getAttribute("onclick") || ""); });
    if (!isVip) return false;
    if (!$("vrc-style")) { var s = document.createElement("style"); s.id = "vrc-style"; s.textContent = CSS; document.head.appendChild(s); }
    if (!$("vip-share")) {
      var d = document.createElement("div"); d.id = "vip-share"; d.style.display = "none"; d.innerHTML = HTML;
      page.appendChild(d);
      wire();
    }
    if (!$("vrcTabBtn")) {
      var btn = document.createElement("button"); btn.id = "vrcTabBtn"; btn.className = "subtab";
      btn.innerHTML = "📸 Share a slip";
      btn.addEventListener("click", vrcShow);
      bar.insertBefore(btn, bar.firstChild);
    }
    return true;
  }

  /* clicking a native sub-tab must hide my panel + deactivate my button */
  function hookShowSub() {
    if (window.__vrcSubHooked || typeof window.showSub !== "function") return;
    var orig = window.showSub;
    window.showSub = function () {
      var mine = $("vip-share"); if (mine) mine.style.display = "none";
      var mb = $("vrcTabBtn"); if (mb) mb.classList.remove("active");
      return orig.apply(this, arguments);
    };
    window.__vrcSubHooked = true;
  }
  /* re-inject after page switches (subbar may be rebuilt) */
  function hookShowPage() {
    if (window.__vrcPageHooked || typeof window.showPage !== "function") return;
    var orig = window.showPage;
    window.showPage = function () { var r = orig.apply(this, arguments); setTimeout(ensure, 60); setTimeout(ensure, 350); return r; };
    window.__vrcPageHooked = true;
  }

  function boot() {
    hookShowSub(); hookShowPage(); ensure();
    var n = 0;
    var t = setInterval(function () { n++; hookShowSub(); hookShowPage(); ensure(); if (n > 40) clearInterval(t); }, 400);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
