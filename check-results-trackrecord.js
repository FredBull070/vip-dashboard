/* check-results-trackrecord.js — "Check resultaten" op de Track Record-tab, MET DRY-RUN.
   ------------------------------------------------------------------------------------
   Plak dit als <script> onderaan de dashboard index.html (na bl-dashboard.js).
   Zet BL_WORKER = jouw worker-URL en BL_CHECK_TOKEN = de CHECK_TOKEN-secret.

   Werking (fail-safe by design — Fred ziet altijd eerst wat er gebeurt):
     1. Klik "🔄 Check resultaten"  -> DRY-RUN: de worker berekent wat afgelopen is,
        maar schrijft NIETS weg. Je krijgt een voorbeeld: welke bets, W/L, stand, bron.
     2. Klopt het? Klik "✅ Vastleggen (N)" -> nu pas settelt de worker écht die N bets
        en committen we ze naar trackrecord.json. De lijst hieronder ververst meteen.
     3. Niks afgelopen / paused / fouten? Dan zie je dat en wordt er nooit iets vastgelegd.

   De knop leeft binnen #page-trackrecord en verschijnt automatisch wanneer je die tab opent.
   Alleen de bets die in de dry-run stonden worden bij bevestiging gesetteld (geen verrassingen). */
(function () {
  "use strict";
  var BL_WORKER = "https://bl-autosettle.wfsirvania.workers.dev"; // jouw worker-URL (al ingevuld)
  var RAW = "https://raw.githubusercontent.com/FredBull070/vip-dashboard/main/trackrecord.json";
  var MAX_AGE_DAYS = 60; // handmatige check kijkt verder terug dan de cron (die staat op 5)
  var TOKEN_KEY = "ba_autosettle_token"; // CHECK_TOKEN wordt lokaal in je browser bewaard, niet in de code

  // Token nooit in de code: één keer invoeren (blijft in localStorage van jouw browser staan).
  function getToken(forcePrompt) {
    var t = "";
    try { t = localStorage.getItem(TOKEN_KEY) || ""; } catch (e) {}
    if (!t || forcePrompt) {
      var v = window.prompt("Eenmalig: plak je CHECK_TOKEN (van de autosettle-worker).\nBlijft alleen in deze browser bewaard.", t || "");
      if (v == null) return t;         // geannuleerd → houd bestaande
      t = v.trim();
      try { localStorage.setItem(TOKEN_KEY, t); } catch (e) {}
    }
    return t;
  }

  var st = { busy: false, preview: null }; // preview = laatste dry-run response

  /* ---------- styling (in-thema met het dashboard) ---------- */
  function css() {
    if (document.getElementById("blCrCSS")) return;
    var s = document.createElement("style"); s.id = "blCrCSS";
    s.textContent = [
      "#blCr{background:linear-gradient(180deg,#161a20,#12141a);border:1px solid #263042;border-radius:14px;padding:13px 16px;margin-bottom:14px}",
      "#blCr .cr-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}",
      "#blCr .cr-ttl{font-weight:700;color:#e9eaee;font-size:14px}",
      "#blCr .cr-sub{font-size:12px;color:#9aa0ab}",
      "#blCr .cr-btn{background:linear-gradient(135deg,#ff7a1a,#ff5c00);border:0;color:#fff;font-weight:800;font-size:13px;padding:10px 16px;border-radius:10px;cursor:pointer}",
      "#blCr .cr-btn[disabled]{opacity:.55;cursor:default}",
      "#blCr .cr-btn.go{background:linear-gradient(135deg,#2fbf6a,#22a457)}",
      "#blCr .cr-btn.ghost{background:transparent;border:1px solid #3a3f4a;color:#e9eaee;font-weight:700}",
      "#blCr .cr-sp{margin-left:auto}",
      "#blCr .cr-pv{margin-top:12px;display:none;flex-direction:column;gap:8px}#blCr.open .cr-pv{display:flex}",
      "#blCr .cr-note{font-size:12px;color:#c7ccd4}",
      "#blCr .cr-badge{display:inline-block;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px}",
      "#blCr .cr-badge.dry{background:rgba(240,178,41,.16);color:#f0b829}",
      "#blCr .cr-badge.paused{background:rgba(255,90,90,.16);color:#ff7a7a}",
      "#blCr .cr-list{display:flex;flex-direction:column;gap:6px;max-height:340px;overflow:auto}",
      "#blCr .cr-it{display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center;background:#0e1015;border:1px solid #1e2430;border-radius:10px;padding:8px 11px}",
      "#blCr .cr-m{color:#e9eaee;font-size:13px;font-weight:600}#blCr .cr-s{color:#9aa0ab;font-size:12px}",
      "#blCr .cr-sc{color:#aeb4be;font-size:12px;font-variant-numeric:tabular-nums}",
      "#blCr .cr-res{font-size:11px;font-weight:800;padding:3px 10px;border-radius:20px}",
      "#blCr .cr-res.w{background:rgba(53,198,107,.16);color:#35c66b}#blCr .cr-res.l{background:rgba(255,106,77,.16);color:#ff6a4d}#blCr .cr-res.v{background:rgba(138,143,154,.18);color:#aeb4be}",
      "#blCr .cr-err{font-size:12px;color:#ff7a7a;background:rgba(255,90,90,.08);border:1px solid rgba(255,90,90,.25);border-radius:9px;padding:8px 11px}",
      "#blCr .cr-empty{color:#9aa0ab;font-size:13px;padding:6px 2px}",
      "@media(max-width:640px){#blCr .cr-it{grid-template-columns:1fr auto}#blCr .cr-sc{display:none}}"
    ].join("");
    document.head.appendChild(s);
  }

  function esc(x){ return String(x==null?"":x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function resClass(r){ r=(r||"").toUpperCase(); return r==="W"?"w":(r==="L"?"l":"v"); }
  function resLabel(r){ r=(r||"").toUpperCase(); return r==="W"?"WINST":(r==="L"?"VERLIES":(r==="V"?"PUSH":r)); }

  function toast(msg, ok){
    var t=document.getElementById("blToast")||(function(){var d=document.createElement("div");d.id="blToast";
      d.style.cssText="position:fixed;bottom:22px;right:18px;z-index:99999;padding:10px 16px;border-radius:12px;font:600 13px system-ui;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.4);transition:opacity .3s";
      document.body.appendChild(d);return d;})();
    t.textContent=msg; t.style.background=ok===false?"#ed4245":(ok?"#31c46b":"#333"); t.style.opacity="1";
    clearTimeout(t._h); t._h=setTimeout(function(){t.style.opacity="0";},3800);
  }

  /* ---------- worker call ---------- */
  function callCheck(body){
    var token = getToken(false);
    if(!token) return Promise.reject(new Error("Geen CHECK_TOKEN ingesteld — klik de knop en vul 'm één keer in."));
    return fetch(BL_WORKER+"/check",{method:"POST",
      headers:{"content-type":"application/json","x-check-token":token},
      body:JSON.stringify(body||{})}).then(function(r){
        if(r.status===401){ getToken(true); throw new Error("Token onjuist — opnieuw ingevoerd, probeer nog eens"); }
        if(!r.ok) throw new Error("worker "+r.status); return r.json(); });
  }

  /* ---------- optimistic local update + master refetch ---------- */
  function patchLocal(results){
    var rows; try{ rows=JSON.parse(localStorage.getItem("ba_trackrecord")||"[]"); }catch(e){ rows=[]; }
    if(!Array.isArray(rows)) return;
    var byId={}, byBet={};
    results.forEach(function(p){ if(p.id!=null) byId[String(p.id)]=p; if(p.betid!=null) byBet[String(p.betid)]=p; });
    var n=0;
    rows.forEach(function(r){
      var p=byId[String(r.id)]||byBet[String(r.betid)];
      if(p && !r.manual_lock){ r.result=p.result; r.score=p.score; r.settled_at=p.settled_at; r.settled_by="auto"; r.settle_note=p.settle_note; r.source=p.source; n++; }
    });
    if(n){ localStorage.setItem("ba_trackrecord", JSON.stringify(rows)); } // bl-dashboard tick() re-rendert bij wijziging
    return n;
  }
  function refetchMaster(){
    // Haalt de door de worker net gecommitte master op (CDN kan even lag hebben; cache-bust).
    var urls=["/trackrecord.json?t="+Date.now(), RAW+"?t="+Date.now()];
    (function tryOne(i){ if(i>=urls.length) return;
      fetch(urls[i]).then(function(r){ return r.ok?r.json():Promise.reject(0); }).then(function(master){
        if(!Array.isArray(master)||!master.length) return;
        var local=[]; try{ local=JSON.parse(localStorage.getItem("ba_trackrecord")||"[]"); }catch(e){}
        var by={}; master.forEach(function(r){ if(r&&r.betid) by[r.betid]=r; });
        local.forEach(function(r){ if(r&&r.betid&&r.manual_lock===true) by[r.betid]=r; });
        var merged=Object.keys(by).map(function(k){ return by[k]; });
        localStorage.setItem("ba_trackrecord", JSON.stringify(merged));
      }).catch(function(){ tryOne(i+1); });
    })(0);
  }

  /* ---------- render ---------- */
  function summaryLine(res){
    var bits=[];
    bits.push((res.checked||0)+" gecheckt");
    bits.push((res.would_settle||res.settled||0)+" te settelen");
    if(res.errors&&res.errors.length) bits.push(res.errors.length+" fout(en)");
    return bits.join(" · ");
  }

  function paintPreview(bar, res){
    var pv=bar.querySelector(".cr-pv"); if(!pv) return;
    var items=(res.results||[]);
    var h="";
    h+='<div class="cr-row"><span class="cr-badge dry">DRY-RUN — nog niets vastgelegd</span>'+
       (res.paused?'<span class="cr-badge paused">settling staat op PAUZE</span>':'')+
       '<span class="cr-note cr-sp">'+esc(summaryLine(res))+'</span></div>';
    if(items.length){
      h+='<div class="cr-list">'+items.map(function(p){
        return '<div class="cr-it"><div><div class="cr-m">'+esc(p.match||p.betid||p.id||"—")+'</div>'+
          '<div class="cr-s">'+esc(p.selection||p.settle_note||"")+'</div></div>'+
          '<div class="cr-sc">'+esc(p.score||"")+(p.source?' · '+esc(p.source):'')+'</div>'+
          '<div class="cr-res '+resClass(p.result)+'">'+resLabel(p.result)+'</div></div>';
      }).join("")+'</div>';
    } else {
      h+='<div class="cr-empty">Niks afgelopen om te settelen'+(res.paused?' (en settling staat op pauze).':' — probeer later opnieuw.')+'</div>';
    }
    if(res.errors&&res.errors.length){
      h+='<div class="cr-err">Overgeslagen (blijven pending): '+esc(res.errors.slice(0,6).join(" | "))+(res.errors.length>6?' …':'')+'</div>';
    }
    h+='<div class="cr-row" style="margin-top:4px">';
    if(items.length){
      h+='<button class="cr-btn go" data-act="commit">✅ Vastleggen ('+items.length+')</button>';
    }
    h+='<button class="cr-btn ghost" data-act="rerun">↻ Opnieuw checken</button>';
    h+='<button class="cr-btn ghost cr-sp" data-act="close">Sluiten</button></div>';
    pv.innerHTML=h;
    bar.classList.add("open");
  }

  function setBusy(bar, on, label){
    st.busy=on; var b=bar.querySelector('[data-act="check"]');
    if(b){ b.disabled=on; b.textContent=on?(label||"Bezig…"):"🔄 Check resultaten"; }
  }

  /* ---------- actions ---------- */
  function doDryRun(bar){
    if(st.busy) return; setBusy(bar,true,"Checken…");
    var ids=null; // volledige dry-run over alles wat pending is
    callCheck({dry:true, maxAgeDays:MAX_AGE_DAYS}).then(function(res){
      st.preview=res; paintPreview(bar,res); setBusy(bar,false);
      if(res.would_settle) toast("Voorbeeld klaar: "+res.would_settle+" te settelen — controleer & leg vast", true);
      else toast("Niks nieuws om te settelen", true);
    }).catch(function(e){ setBusy(bar,false); toast("Fout: "+e.message,false); });
  }

  function doCommit(bar){
    if(st.busy||!st.preview) return;
    var items=(st.preview.results||[]);
    var ids=items.map(function(p){ return p.betid!=null?p.betid:p.id; }).filter(function(x){ return x!=null; });
    if(!ids.length){ toast("Niets te settelen", false); return; }
    var btn=bar.querySelector('[data-act="commit"]'); if(btn){ btn.disabled=true; btn.textContent="Vastleggen…"; }
    st.busy=true;
    callCheck({ids:ids, maxAgeDays:MAX_AGE_DAYS}).then(function(res){ // dry weggelaten = ECHT settelen
      st.busy=false;
      if(res.aborted){ toast("Gepauzeerd: "+res.aborted, false); return; }
      var patched=patchLocal(res.results||[]);
      refetchMaster();
      bar.classList.remove("open"); st.preview=null;
      toast("✅ "+(res.settled||patched||ids.length)+" resultaat/resultaten vastgelegd", true);
      var sub=bar.querySelector(".cr-sub"); if(sub) sub.textContent="Laatst gecheckt: zojuist · "+(res.settled||0)+" vastgelegd";
    }).catch(function(e){ st.busy=false; toast("Fout bij vastleggen: "+e.message,false);
      if(btn){ btn.disabled=false; btn.textContent="✅ Vastleggen ("+ids.length+")"; } });
  }

  function onClick(e){
    var bar=document.getElementById("blCr"); if(!bar) return;
    var t=e.target.closest("[data-act]"); if(!t) return;
    var a=t.getAttribute("data-act");
    if(a==="check"||a==="rerun") doDryRun(bar);
    else if(a==="commit") doCommit(bar);
    else if(a==="close"){ bar.classList.remove("open"); st.preview=null; }
  }

  /* ---------- mount into #page-trackrecord ---------- */
  function bar(){
    var host=document.getElementById("page-trackrecord"); if(!host) return null;
    var b=document.getElementById("blCr");
    if(!b){
      b=document.createElement("div"); b.id="blCr";
      b.innerHTML='<div class="cr-row"><span>🔄</span><span class="cr-ttl">Check resultaten</span>'+
        '<span class="cr-sub cr-sp">Dry-run eerst — je ziet wat afgelopen is vóór je iets vastlegt</span></div>'+
        '<div class="cr-row" style="margin-top:10px"><button class="cr-btn" data-act="check">🔄 Check resultaten</button></div>'+
        '<div class="cr-pv"></div>';
      b.addEventListener("click", onClick);
    }
    // Mount ONCE at the top (above #blBooks/#blPub/#blLedger). Do NOT re-force
    // position on every tick - that fought the other top panels and caused the
    // flicker/glitch. Placed by a fixed order so it stays put after mounting.
    if(b.parentNode!==host){
      var _ord=['blCr','blBooks','blPub','blLedger'], _an=null;
      for(var _i=1;_i<_ord.length;_i++){ var _s=document.getElementById(_ord[_i]); if(_s&&_s.parentNode===host){ _an=_s; break; } }
      if(!_an) _an=document.getElementById('tr-log')||host.firstChild;
      host.insertBefore(b, _an);
    }
    return b;
  }

  function tick(){
    var p=document.getElementById("page-trackrecord");
    if(p && getComputedStyle(p).display!=="none"){ css(); bar(); }
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", function(){ setTimeout(tick,700); });
  else setTimeout(tick,700);
  setInterval(tick, 1500);

  // Handig voor de console / andere knoppen.
  window.blCheckResultsDry = function(){ var b=bar(); if(b) doDryRun(b); };
})();
