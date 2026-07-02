/* BetLife365 · VIP Results photo composer (drop-in module)
   Injects a styled composer at the top of the VIP Results tab (#page-vip).
   - Pick settled bets from the public track record
   - Attach one or more photos of the bet slip
   - Choose per post what goes on the card: units, running record, VIP invite
   - Posts to Discord (VIP RESULTS webhook, saved in Settings) WITH the photos attached
   Deploy: put this file in the vip-dashboard repo and add, near the other module tags:
     <script defer src="/vip-results-composer.js?v=1"></script>
*/
(function () {
  if (window.__vrcInit) return;
  window.__vrcInit = true;

  var RAW = "https://raw.githubusercontent.com/FredBull070/vip-dashboard/main/trackrecord.json";
  var ALL = [], photos = [], record = { w: 0, l: 0 };

  function $(id) { return document.getElementById(id); }
  function norm(s) { return (s || "").toString().trim().toLowerCase(); }
  function esc(s) { return (s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var CSS = [
    "#vrc .vrc-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}",
    "@media(max-width:820px){#vrc .vrc-grid{grid-template-columns:1fr}}",
    "#vrc .vrc-step{font-size:12px;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);font-weight:700;margin:0 0 10px}",
    "#vrc .vrc-substep{font-size:11px;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);font-weight:700;margin:16px 0 8px}",
    "#vrc .vrc-row2{display:flex;gap:10px;margin-bottom:10px}#vrc .vrc-row2>*{flex:1;min-width:0}",
    "#vrc select,#vrc .vrc-in{width:100%;background:rgba(255,255,255,.035);border:1px solid var(--line);border-radius:11px;color:var(--text);padding:10px 12px;font:inherit;font-size:14px}",
    "#vrc textarea.vrc-in{resize:vertical;min-height:52px}",
    "#vrc .vrc-bets{max-height:340px;overflow:auto;display:flex;flex-direction:column;gap:6px}",
    "#vrc .vrc-bet{display:flex;gap:10px;align-items:flex-start;padding:9px 11px;border:1px solid var(--line);border-radius:11px;background:rgba(255,255,255,.02);cursor:pointer}",
    "#vrc .vrc-bet:hover{border-color:var(--accent)}",
    "#vrc .vrc-bet input{margin-top:3px;accent-color:var(--accent);width:15px;height:15px;flex-shrink:0}",
    "#vrc .vrc-bet .info{flex:1;min-width:0}",
    "#vrc .vrc-bet .top{display:flex;justify-content:space-between;gap:8px}",
    "#vrc .vrc-bet .m{font-weight:600;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    "#vrc .vrc-bet .sel{color:var(--muted);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    "#vrc .vrc-bet .meta{color:var(--muted);font-size:11px;margin-top:2px;opacity:.8}",
    "#vrc .vrc-pill{font-size:11px;font-weight:800;padding:2px 8px;border-radius:20px;flex-shrink:0;height:fit-content}",
    "#vrc .vrc-pill.W{background:rgba(48,209,88,.15);color:var(--green)}",
    "#vrc .vrc-pill.L{background:rgba(255,69,58,.14);color:var(--red)}",
    "#vrc .vrc-drop{border:1.5px dashed var(--line);border-radius:12px;padding:18px;text-align:center;color:var(--muted);font-size:13px;cursor:pointer;background:rgba(255,255,255,.02)}",
    "#vrc .vrc-drop.over{border-color:var(--accent);color:var(--text)}",
    "#vrc .vrc-thumbs{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 0}",
    "#vrc .vrc-thumb{position:relative;width:64px;height:64px}",
    "#vrc .vrc-thumb img{width:64px;height:64px;object-fit:cover;border-radius:10px;border:1px solid var(--line)}",
    "#vrc .vrc-thumb button{position:absolute;top:-6px;right:-6px;width:19px;height:19px;border:none;border-radius:50%;background:var(--red);color:#fff;font-size:12px;cursor:pointer;line-height:1}",
    "#vrc .vrc-dc{background:#313338;border-radius:10px;color:#dbdee1;font-size:14px;padding:2px 0;margin-top:6px}",
    "#vrc .vrc-embed{border-left:4px solid var(--green);background:#2b2d31;border-radius:4px;margin:8px 12px;padding:10px 14px 12px}",
    "#vrc .vrc-dc.loss .vrc-embed{border-left-color:var(--red)}",
    "#vrc .vrc-et{font-weight:700;margin:2px 0 6px;font-size:15px}",
    "#vrc .vrc-leg{font-size:13.5px;margin:2px 0}#vrc .vrc-leg small{color:#b5bac1}",
    "#vrc .vrc-tot{margin-top:8px;font-size:13.5px}",
    "#vrc .vrc-rec{margin-top:6px;font-size:12px;color:#b5bac1}",
    "#vrc .vrc-cta{margin-top:8px;font-size:13px;color:#c9cdd3}",
    "#vrc .vrc-imgs{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}",
    "#vrc .vrc-imgs img{max-width:150px;max-height:150px;border-radius:6px}",
    "#vrc .vrc-foot{font-size:11px;color:#949ba4;margin:8px 14px 6px}",
    "#vrc .vrc-checks{display:flex;flex-direction:column;gap:2px}",
    "#vrc .vrc-hint{font-size:11.5px;color:var(--muted);margin-top:10px}",
    "#vrc .vrc-status{font-size:13px;margin-top:10px;min-height:18px}",
    "#vrc .vrc-actions{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap}",
    "#vrc .vrc-actions .btn,#vrc .vrc-actions .btn-secondary{flex:1;min-width:150px}"
  ].join("");

  var HTML =
    '<h2 class="section-title">📸 Deel een resultaat met foto</h2>' +
    '<p class="section-sub">Vink je lijstje aan, sleep de foto(\'s) van je bon erbij en deel het in je VIP Results-kanaal. Dit is wat niet-leden zien — kort, eerlijk en overtuigend. Win‑/verliesbadge, jouw tekst en de foto gaan altijd mee; de rest kies je zelf.</p>' +
    '<div class="vrc-grid">' +
      '<div>' +
        '<div class="vrc-step">1 · Kies je bets</div>' +
        '<div class="vrc-row2">' +
          '<select id="vrcFilter"><option value="W">Alleen gewonnen</option><option value="L">Alleen verloren</option><option value="all">Alles</option></select>' +
          '<select id="vrcDays"><option value="7">7 dagen</option><option value="14">14 dagen</option><option value="30" selected>30 dagen</option><option value="90">90 dagen</option></select>' +
        '</div>' +
        '<div id="vrcBets" class="vrc-bets"><p style="color:var(--muted);font-size:13px">Laden…</p></div>' +
      '</div>' +
      '<div>' +
        '<div class="vrc-step">2 · Foto\'s &amp; tekst</div>' +
        '<div id="vrcDrop" class="vrc-drop">📸 Sleep hier de foto(\'s) van je bon, of klik om te kiezen</div>' +
        '<input id="vrcFile" type="file" accept="image/*" multiple hidden>' +
        '<div id="vrcThumbs" class="vrc-thumbs"></div>' +
        '<div class="vrc-row2" style="margin-top:12px">' +
          '<div><label class="lbl">Inzet (units)</label><input id="vrcStake" class="vrc-in" type="number" step="0.5" min="0" value="1"></div>' +
          '<div><label class="lbl">Titel (optioneel)</label><input id="vrcTitle" class="vrc-in" type="text" placeholder="automatisch"></div>' +
        '</div>' +
        '<label class="lbl">Eigen tekst (optioneel)</label>' +
        '<textarea id="vrcNote" class="vrc-in" placeholder="Kort persoonlijk lijntje… (leeg = clean)"></textarea>' +
        '<div class="vrc-substep">Wat gaat mee op de kaart</div>' +
        '<div class="vrc-checks">' +
          '<label class="check"><input type="checkbox" id="vrcUnits" checked> Winst in units (+/–u)</label>' +
          '<label class="check"><input type="checkbox" id="vrcRecord" checked> Lopend record (bv. 24W-9L)</label>' +
          '<label class="check"><input type="checkbox" id="vrcCta" checked> Subtiele VIP-uitnodiging</label>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="vrc-step" style="margin-top:18px">3 · Voorbeeld &amp; delen</div>' +
    '<div id="vrcPreview" class="vrc-dc"><div style="padding:14px;color:#949ba4;font-size:13px">Selecteer een of meer bets…</div></div>' +
    '<div id="vrcHook" class="vrc-hint"></div>' +
    '<div class="vrc-actions">' +
      '<button id="vrcSend" class="btn" disabled>Deel naar VIP Results</button>' +
      '<button id="vrcCopy" class="btn-secondary" disabled>Kopieer tekst</button>' +
    '</div>' +
    '<div id="vrcStatus" class="vrc-status"></div>';

  function ords(e) { var m = (e.date || "").match(/(\d{1,2})-(\d{1,2})-(\d{4})/); return m ? new Date(m[3], m[2] - 1, m[1]).getTime() : 0; }

  function render() {
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
    if (!rows.length) { host.innerHTML = '<p style="color:var(--muted);font-size:13px">Geen bets in deze periode.</p>'; return; }
    host.innerHTML = rows.map(function (e) {
      var R = norm(e.result).toUpperCase();
      return '<label class="vrc-bet"><input type="checkbox" data-i="' + ALL.indexOf(e) + '">' +
        '<div class="info"><div class="top"><span class="m">' + esc(e.match || e.selection || "") + '</span>' +
        '<span class="vrc-pill ' + R + '">' + (R === "W" ? "✅ Winst" : "❌ Verlies") + '</span></div>' +
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

  function defaultTitle(m) { return m.won ? "✅ Gewonnen" : "❌ Net niet"; }
  function ctaLine(m) { return m.won ? "Deze ging vooraf naar VIP. Meedoen? 👑" : "We posten álles — ook de missers. Winst dekt ze ruim. 👑"; }

  function build() {
    var m = model(), pv = $("vrcPreview");
    $("vrcSend").disabled = $("vrcCopy").disabled = !m;
    if (!m) { pv.className = "vrc-dc"; pv.innerHTML = '<div style="padding:14px;color:#949ba4;font-size:13px">Selecteer een of meer bets…</div>'; return; }
    var showU = $("vrcUnits").checked, showR = $("vrcRecord").checked;
    var title = $("vrcTitle").value.trim() || defaultTitle(m);
    var note = $("vrcNote").value.trim();
    var legs = m.bets.map(function (b) { return '<div class="vrc-leg">• ' + esc(b.selection || b.match) + ' <small>' + (b.odds ? "@" + b.odds : "") + '</small></div>'; }).join("");
    var tot = !showU ? "" : (m.bets.length > 1
      ? '<div class="vrc-tot"><b>Totale odds @' + m.combo.toFixed(2) + '</b>' + (m.won && m.stake ? ' · +' + m.profit.toFixed(2) + 'u' : (m.lost && m.stake ? ' · ' + m.profit.toFixed(2) + 'u' : "")) + '</div>'
      : (m.stake ? '<div class="vrc-tot"><b>' + (m.won ? "+" + m.profit.toFixed(2) : m.profit.toFixed(2)) + 'u</b></div>' : ""));
    pv.className = "vrc-dc" + (m.won ? "" : " loss");
    pv.innerHTML = '<div class="vrc-embed">' +
      (note ? '<div class="vrc-leg" style="margin-bottom:6px;color:#dbdee1">' + esc(note) + '</div>' : "") +
      '<div class="vrc-et">' + esc(title) + '</div>' + legs + tot +
      (showR ? '<div class="vrc-rec">📊 Record: ' + record.w + 'W-' + record.l + 'L</div>' : "") +
      ($("vrcCta").checked ? '<div class="vrc-cta">' + ctaLine(m) + '</div>' : "") +
      (photos.length ? '<div class="vrc-imgs">' + photos.map(function (p) { return '<img src="' + p.url + '">'; }).join("") + '</div>' : "") +
      '<div class="vrc-foot">18+ · speel bewust</div></div>';
  }

  function textVersion() {
    var m = model(); if (!m) return "";
    var showU = $("vrcUnits").checked, showR = $("vrcRecord").checked;
    var title = $("vrcTitle").value.trim() || defaultTitle(m);
    var note = $("vrcNote").value.trim();
    var out = (note ? note + "\n\n" : "") + "**" + title + "**\n";
    m.bets.forEach(function (b) { out += "• " + (b.selection || b.match) + (b.odds ? " @" + b.odds : "") + "\n"; });
    if (showU) {
      if (m.bets.length > 1) out += "Totale odds @" + m.combo.toFixed(2) + (m.stake ? (m.won ? "  ·  +" + m.profit.toFixed(2) + "u" : (m.lost ? "  ·  " + m.profit.toFixed(2) + "u" : "")) : "") + "\n";
      else if (m.stake) out += (m.won ? "+" + m.profit.toFixed(2) : m.profit.toFixed(2)) + "u\n";
    }
    if (showR) out += "📊 Record: " + record.w + "W-" + record.l + "L\n";
    if ($("vrcCta").checked) out += ctaLine(m) + "\n";
    out += "18+ · speel bewust";
    return out;
  }

  function status(t, ok) { var s = $("vrcStatus"); s.textContent = t; s.style.color = ok === 1 ? "var(--green)" : ok === 0 ? "var(--red)" : "var(--muted)"; }

  function addFiles(fs) {
    [].slice.call(fs).forEach(function (f) {
      if (!f.type || f.type.indexOf("image/") !== 0) return;
      var rd = new FileReader();
      rd.onload = function (ev) { photos.push({ file: f, url: ev.target.result, name: (f.name || "foto.png").replace(/[^a-z0-9._-]/gi, "_") }); renderThumbs(); build(); };
      rd.readAsDataURL(f);
    });
  }
  function renderThumbs() {
    $("vrcThumbs").innerHTML = photos.map(function (p, i) { return '<div class="vrc-thumb"><img src="' + p.url + '"><button data-rm="' + i + '">×</button></div>'; }).join("");
  }

  function hookInfo() {
    var h = (localStorage.getItem("ba_hook_RESULTS") || "").trim();
    var ok = /^https:\/\/discord(app)?\.com\/api\/webhooks\//.test(h);
    var el = $("vrcHook");
    if (ok) el.innerHTML = "Gaat naar je <b>VIP RESULTS</b>-kanaal (webhook staat ingesteld onder Settings › Channels).";
    else el.innerHTML = '<span style="color:var(--amber)">Stel eerst je VIP RESULTS-webhook in onder Settings › Channels — daarna deelt deze knop er automatisch naartoe.</span>';
    return ok ? h : "";
  }

  async function send() {
    var m = model(); if (!m) return;
    var hook = (localStorage.getItem("ba_hook_RESULTS") || "").trim();
    if (!/^https:\/\/discord(app)?\.com\/api\/webhooks\//.test(hook)) { status("Geen geldige VIP RESULTS-webhook. Stel hem in onder Settings › Channels.", 0); return; }
    status("Versturen…");
    var showU = $("vrcUnits").checked, showR = $("vrcRecord").checked;
    var title = $("vrcTitle").value.trim() || defaultTitle(m);
    var note = $("vrcNote").value.trim();
    var desc = (note ? note + "\n\n" : "");
    m.bets.forEach(function (b) { desc += "• " + (b.selection || b.match) + (b.odds ? " @" + b.odds : "") + "\n"; });
    if (showU) {
      if (m.bets.length > 1) desc += "\n**Totale odds @" + m.combo.toFixed(2) + "**" + (m.stake ? (m.won ? "  ·  +" + m.profit.toFixed(2) + "u" : (m.lost ? "  ·  " + m.profit.toFixed(2) + "u" : "")) : "");
      else if (m.stake) desc += "\n**" + (m.won ? "+" + m.profit.toFixed(2) : m.profit.toFixed(2)) + "u**";
    }
    if ($("vrcCta").checked) desc += "\n\n" + ctaLine(m);
    var embed = { title: title, description: desc, color: m.won ? 3196011 : 15548485, footer: { text: showR ? ("18+ · speel bewust · �Record " + record.w + "W-" + record.l + "L") : "18+ · speel bewust" } };
    if (photos.length) embed.image = { url: "attachment://" + photos[0].name };
    var fd = new FormData();
    fd.append("payload_json", JSON.stringify({ username: "BetLife365 · Results", embeds: [embed] }));
    photos.forEach(function (p, i) { fd.append("files[" + i + "]", p.file, p.name); });
    try {
      var r = await fetch(hook, { method: "POST", body: fd });
      if (r.ok || r.status === 204 || r.status === 200) {
        status("✅ Gedeeld in VIP Results!", 1);
        photos = []; renderThumbs();
        [].slice.call($("vrcBets").querySelectorAll("input:checked")).forEach(function (c) { c.checked = false; });
        build();
      } else { status("Discord gaf status " + r.status + ". Check de webhook.", 0); }
    } catch (e) { status("Versturen mislukt: " + e.message, 0); }
  }

  async function load() {
    try {
      var r = await fetch(RAW + "?t=" + Date.now(), { cache: "no-store" });
      ALL = await r.json();
      record = { w: ALL.filter(function (e) { return norm(e.result) === "w"; }).length, l: ALL.filter(function (e) { return norm(e.result) === "l"; }).length };
      render();
    } catch (e) { $("vrcBets").innerHTML = '<p style="color:var(--red);font-size:13px">Kon track record niet laden. Check je internet.</p>'; }
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

    $("vrc").addEventListener("change", function (e) { if (e.target.matches('.vrc-bet input')) build(); });
    $("vrcThumbs").addEventListener("click", function (e) { var b = e.target.closest("button[data-rm]"); if (b) { photos.splice(+b.dataset.rm, 1); renderThumbs(); build(); } });

    $("vrcSend").addEventListener("click", send);
    $("vrcCopy").addEventListener("click", function () { navigator.clipboard.writeText(textVersion()).then(function () { status("✓ Tekst gekopieerd", 1); }); });
    hookInfo();
  }

  function mount() {
    var page = document.getElementById("page-vip");
    if (!page) return false;
    if (document.getElementById("vrc")) return true;
    if (!document.getElementById("vrc-style")) {
      var style = document.createElement("style"); style.id = "vrc-style"; style.textContent = CSS; document.head.appendChild(style);
    }
    var sec = document.createElement("section");
    sec.className = "card"; sec.id = "vrc"; sec.innerHTML = HTML;
    page.insertBefore(sec, page.firstChild);
    wire();
    load();
    return true;
  }

  function boot() {
    if (mount()) return;
    var tries = 0;
    var t = setInterval(function () { tries++; if (mount() || tries > 40) clearInterval(t); }, 250);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
