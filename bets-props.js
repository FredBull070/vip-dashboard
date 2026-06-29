/* BetLife365 daily PROP cards - written by the prop-cards-builder task, read by the dashboard.
   Same structure as DAILY_CARDS (MATCH/MARKET/SELECTION/ODDS/STAKE/RISK/ANALYSIS, grouped by
   risk: low=Core, medium=Value, high=Aggressive). Player props across every sport we offer.
   Code stays separate from the dashboard. This is the seed slate; the builder replaces it daily. */
window.DAILY_PROPS_VERSION = "2026-06-28";

window.DAILY_PROPS = `SPORT: Football
MATCH: Brazil x Japan
MARKET: Shots on target
SELECTION: Vinicius Jr 2+ shots on target
ODDS: 1.90
STAKE: 1u
RISK: low
ANALYSIS: Brazil's main creative threat against a Japan side that has to chase; high shot volume expected from the left.
===
SPORT: Football
MATCH: Germany x Paraguay
MARKET: Anytime goalscorer
SELECTION: Florian Wirtz anytime scorer
ODDS: 2.40
STAKE: 1u
RISK: medium
ANALYSIS: Germany should dominate territory; Wirtz arrives late into the box and takes set pieces.
===
SPORT: Football
MATCH: South Africa x Canada
MARKET: Player shots
SELECTION: Jonathan David 3+ shots
ODDS: 2.10
STAKE: 0.75u
RISK: medium
ANALYSIS: Canada's focal point up front against a defensive South Africa; volume play on the striker.
===
SPORT: Tennis
MATCH: Eastbourne ATP Final
MARKET: Player aces
SELECTION: Ugo Humbert 8+ aces
ODDS: 2.00
STAKE: 0.75u
RISK: medium
ANALYSIS: Big lefty serve on grass in a best-of-three final; ace count projects high.
===
SPORT: Football
MATCH: Netherlands x Morocco
MARKET: Player to be carded
SELECTION: Sofyan Amrabat to be carded
ODDS: 3.20
STAKE: 0.25u
RISK: high
ANALYSIS: Combative midfielder likely chasing the game in a tight knockout tie; card risk elevated.`;

window.EMBEDDED_PROPS = { date: "2026-06-28" };

/* Filled by the evening-settlement task once a prop is confirmed by verified player data.
   Append-only, dedupe by betid "prop|DD-MM-YYYY|<Match>|<Selection>". The dashboard merges
   these into the Track Record. No result is ever written without verified player-level data. */
window.DAILY_PROPS_SETTLED = [];

/* ---------------------------------------------------------------------------
   Universal webhook-field loader (deployed via this file so it is independent
   of the dashboard's own init). The dashboard's on-load loader did not populate
   the DAILY PROP CARDS field from localStorage, so after a device sync the
   ba_hook_PROPS value lived in storage but its input stayed blank. This fills
   EVERY hook_<CAT> field from its ba_hook_<CAT> value, but only when the field
   is currently empty, so it never clobbers anything the operator is editing.
   Runs after load (so it wins over the partial init loader) and again after any
   navigation click (e.g. opening Settings) and right after a "Sync now" pull. */
(function(){
  function loadAllHooks(){
    try{
      for(var i=0;i<localStorage.length;i++){
        var k=localStorage.key(i);
        if(k && k.indexOf('ba_hook_')===0){
          var el=document.getElementById('hook_'+k.slice(8));
          if(el){ var v=localStorage.getItem(k); if(v!==null && v!=='' && !el.value) el.value=v; }
        }
      }
    }catch(e){}
  }
  window._loadAllHooks=loadAllHooks;
  function start(){
    var runs=0;
    var iv=setInterval(function(){ loadAllHooks(); if(++runs>15) clearInterval(iv); }, 1000);
    document.addEventListener('click', function(){ setTimeout(loadAllHooks, 300); }, true);
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', start); }
  else { start(); }
})();

/* ---------------------------------------------------------------------------
   Webhook links are masked (password style) by default so they are never
   readable over-the-shoulder or on a shared screen. A "Show links" button in
   Settings > Channels reveals them, but only after the operator enters the
   sync / security password (verified the same way as device sync:
   sha('bl365-sync-pw-v3:'+pw) === ba_sync_skey). Revealed links auto-hide
   again after 2 minutes and on any page reload. Masking never affects Save or
   Test - those read the real value regardless. */
(function(){
  var SKEY_PREFIX='bl365-sync-pw-v3:';
  var revealed=false, hideTimer=null;
  function hookInputs(){ return [].slice.call(document.querySelectorAll('input[id^="hook_"]')); }
  function injectCss(){
    if(document.getElementById('hookMaskCss')) return;
    var st=document.createElement('style'); st.id='hookMaskCss';
    /* hide the native password-reveal eye (Edge/IE) so it cannot bypass the gate */
    st.textContent='input[id^="hook_"]::-ms-reveal{display:none!important;}';
    document.head.appendChild(st);
  }
  function applyMask(){ hookInputs().forEach(function(el){ var want=revealed?'text':'password'; if(el.type!==want) el.type=want; }); }
  function expected(){ return localStorage.getItem('ba_sync_skey')||''; }
  function verify(pw){ return Promise.resolve(sha(SKEY_PREFIX+pw)).then(function(h){ var e=expected(); return !!e && (''+h).toLowerCase()===e.toLowerCase(); }); }

  function overlay(onok){
    if(document.getElementById('hookRevealOverlay')) return;
    var hasPw=!!expected();
    var bg=document.createElement('div'); bg.id='hookRevealOverlay';
    bg.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.62);z-index:99999;display:flex;align-items:center;justify-content:center;';
    var box=document.createElement('div');
    box.style.cssText='background:#15171c;border:1px solid #2a2d36;border-radius:14px;padding:22px;width:330px;max-width:90vw;box-shadow:0 24px 60px rgba(0,0,0,.55);color:#e7e9ee;font-family:inherit;';
    if(!hasPw){
      box.innerHTML='<div style="font-weight:700;font-size:16px;margin-bottom:8px;">No sync password set</div>'+
        '<div style="font-size:13px;color:#9aa0ac;margin-bottom:16px;line-height:1.5;">Set up your sync / security password first (it is the same one that unlocks device sync). Then you can reveal the links.</div>'+
        '<div style="display:flex;justify-content:flex-end;"><button data-x="c" style="padding:8px 14px;border-radius:8px;border:0;background:#ff8a3d;color:#1a1206;font-weight:700;cursor:pointer;">OK</button></div>';
      bg.appendChild(box); document.body.appendChild(bg);
      box.querySelector('[data-x="c"]').onclick=function(){ try{document.body.removeChild(bg);}catch(e){} };
      return;
    }
    box.innerHTML='<div style="font-weight:700;font-size:16px;margin-bottom:6px;">Show webhook links</div>'+
      '<div style="font-size:13px;color:#9aa0ac;margin-bottom:14px;">Enter your sync / security password to reveal the channel links.</div>'+
      '<input type="password" autocomplete="off" autocapitalize="off" spellcheck="false" style="width:100%;box-sizing:border-box;padding:10px 12px;border-radius:9px;border:1px solid #2a2d36;background:#0e1014;color:#fff;font-size:14px;" placeholder="Sync password">'+
      '<div class="hrErr" style="color:#ff6b6b;font-size:12px;margin-top:8px;min-height:14px;"></div>'+
      '<div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end;">'+
      '<button data-x="c" style="padding:8px 14px;border-radius:8px;border:1px solid #2a2d36;background:transparent;color:#cfd3da;cursor:pointer;">Cancel</button>'+
      '<button data-x="o" style="padding:8px 14px;border-radius:8px;border:0;background:#ff8a3d;color:#1a1206;font-weight:700;cursor:pointer;">Show</button></div>';
    bg.appendChild(box); document.body.appendChild(bg);
    var inp=box.querySelector('input'), err=box.querySelector('.hrErr');
    setTimeout(function(){ try{inp.focus();}catch(e){} },30);
    function close(){ try{ document.body.removeChild(bg); }catch(e){} }
    function submit(){ var pw=inp.value||''; if(!pw){ return; } verify(pw).then(function(ok){ if(ok){ close(); onok(); } else { err.textContent='Wrong password.'; inp.value=''; inp.focus(); } }); }
    box.querySelector('[data-x="c"]').onclick=close;
    box.querySelector('[data-x="o"]').onclick=submit;
    inp.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); submit(); } else if(e.key==='Escape'){ close(); } });
    bg.addEventListener('mousedown', function(e){ if(e.target===bg) close(); });
  }

  function setLabel(b){ b.textContent=revealed?'Hide links':'Show links'; }
  function reveal(b){ revealed=true; applyMask(); setLabel(b); clearTimeout(hideTimer); hideTimer=setTimeout(function(){ revealed=false; applyMask(); setLabel(b); }, 120000); }
  function ensureBtn(){
    var box=document.getElementById('set-channels'); if(!box) return;
    var b=document.getElementById('hookRevealBtn');
    if(!b){
      var wrap=document.createElement('div'); wrap.style.cssText='margin:0 0 12px;display:flex;align-items:center;gap:10px;';
      b=document.createElement('button'); b.id='hookRevealBtn'; b.type='button';
      b.style.cssText='padding:8px 14px;border-radius:8px;border:1px solid #2a2d36;background:#1b1e25;color:#ffb27a;font-weight:600;cursor:pointer;font-size:13px;';
      var note=document.createElement('span'); note.style.cssText='font-size:12px;color:#7d828c;'; note.textContent='Links are hidden for your security.';
      setLabel(b);
      b.onclick=function(){ if(revealed){ revealed=false; applyMask(); setLabel(b); clearTimeout(hideTimer); } else { overlay(function(){ reveal(b); }); } };
      wrap.appendChild(b); wrap.appendChild(note);
      box.insertBefore(wrap, box.firstChild);
    }
    setLabel(b);
  }
  function tick(){ injectCss(); ensureBtn(); applyMask(); }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', function(){ setTimeout(tick,400); }); }
  else { setTimeout(tick,400); }
  var n=0, iv=setInterval(function(){ tick(); if(++n>25) clearInterval(iv); }, 1000);
  document.addEventListener('click', function(){ setTimeout(tick,250); }, true);
})();

/* ---------------------------------------------------------------------------
   Single-source-of-truth for the daily slate. The daily bets (messages, the
   editor snapshot and the day archive) must ALWAYS come from the server
   bets-*.js files, which the daily build updates and which every device loads
   fresh on each visit (the dashboard already auto-adopts the server version on
   load). They must NOT travel through device-sync, otherwise one device's old
   snapshot could be pushed to the cloud and pulled onto another device, making
   them disagree. So we strip the slate keys out of whatever device-sync stores.
   Settings, webhooks and the track record still sync normally. */
(function(){
  var SLATE=['ba_messages','ba_msg_version','ba_archive'];
  function patch(){
    if(typeof window._syncCollect==='function' && !window._syncCollect.__slateStripped){
      var orig=window._syncCollect;
      var wrapped=function(){ var o=orig.apply(this,arguments)||{}; SLATE.forEach(function(k){ try{ delete o[k]; }catch(e){} }); return o; };
      wrapped.__slateStripped=true;
      window._syncCollect=wrapped;
      return true;
    }
    return !!(window._syncCollect && window._syncCollect.__slateStripped);
  }
  if(!patch()){ var c=0, t=setInterval(function(){ if(patch()||++c>20) clearInterval(t); }, 500); }
})();

/* ---------------------------------------------------------------------------
   Start-time / countdown badges (operator-only, dashboard). For every parley,
   card and prop on the dashboard we show when its FIRST match starts and how
   long until then. Times come from the per-sport *_EVENTS arrays (match/date/
   time in NL time). This only paints badges in the dashboard DOM; it never
   touches the data that gets sent to Discord, so shared messages are unchanged. */
(function(){
  function amsToEpoch(dateStr, timeStr){
    if(!dateStr || !timeStr) return null;
    var tm=(''+timeStr).match(/(\d{1,2}):(\d{2})/); if(!tm) return null;
    var dp=(''+dateStr).split('-'); if(dp.length<3) return null;
    var y=+dp[0], mo=+dp[1], d=+dp[2], hh=+tm[1], mi=+tm[2];
    if(!y||!mo||!d) return null;
    var guess=Date.UTC(y, mo-1, d, hh, mi, 0);
    function offset(ts){
      try{
        var f=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Amsterdam',hour12:false,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});
        var p={}; f.formatToParts(new Date(ts)).forEach(function(x){ p[x.type]=x.value; });
        var asUTC=Date.UTC(+p.year, +p.month-1, +p.day, +p.hour, +p.minute, +p.second);
        return asUTC-ts;
      }catch(e){ return 2*3600000; }
    }
    return guess - offset(guess);
  }
  function norm(s){ return (''+s).toLowerCase().replace(/\s+/g,' ').replace(/ /g,' ').trim(); }
  function events(){
    var arrs=['FOOTBALL_EVENTS','TENNIS_EVENTS','NBA_EVENTS','NFL_EVENTS','NHL_EVENTS'];
    var list=[];
    arrs.forEach(function(k){ var a=window[k]; if(Array.isArray(a)) a.forEach(function(e){ if(e&&e.match){ var ep=amsToEpoch(e.date,e.time); list.push({ m:norm(e.match), epoch:ep }); } }); });
    return list;
  }
  function clock(epoch){ try{ return new Intl.DateTimeFormat('nl-NL',{timeZone:'Europe/Amsterdam',hour:'2-digit',minute:'2-digit'}).format(new Date(epoch)); }catch(e){ return ''; } }
  function dayLabel(epoch){ try{ return new Intl.DateTimeFormat('nl-NL',{timeZone:'Europe/Amsterdam',weekday:'short',day:'2-digit',month:'2-digit'}).format(new Date(epoch)); }catch(e){ return ''; } }
  function label(epoch){
    if(epoch==null) return '';
    var diff=epoch-Date.now();
    if(diff<=0){ return diff>-3*3600000 ? ('▶ bezig · '+clock(epoch)) : ('— afgelopen'); }
    if(diff>18*3600000){ return '⏱ '+dayLabel(epoch)+' '+clock(epoch); }
    var mins=Math.floor(diff/60000), h=Math.floor(mins/60), m=mins%60;
    var rel = h>0 ? ('begint over '+h+'u '+m+'m') : ('begint over '+m+'m');
    return '⏱ '+rel+' · '+clock(epoch);
  }
  function earliestFor(text, ev){
    var t=norm(text), best=null, any=false;
    for(var i=0;i<ev.length;i++){ if(ev[i].m && t.indexOf(ev[i].m)>=0){ any=true; if(ev[i].epoch!=null && (best==null || ev[i].epoch<best)) best=ev[i].epoch; } }
    return any ? best : undefined; // undefined = no match found at all; null = match found but no time
  }
  function badgeEl(host){
    var b=host.querySelector(':scope > .bl-cd');
    if(!b){ b=document.createElement('span'); b.className='bl-cd'; b.style.cssText='display:inline-block;margin-left:8px;padding:2px 8px;border-radius:999px;background:rgba(255,138,61,.14);color:#ffb27a;font-size:11px;font-weight:600;white-space:nowrap;vertical-align:middle;'; host.appendChild(b); }
    return b;
  }
  function paint(){
    var ev=events();
    if(!ev.length) return;
    // Parleys: .msg-card -> badge in .msg-title (whole card text = all legs)
    [].slice.call(document.querySelectorAll('.msg-card')).forEach(function(card){
      var host=card.querySelector('.msg-title'); if(!host) return;
      var r=earliestFor(card.textContent||'', ev);
      var txt = r===undefined ? '' : (r===null ? '⏱ tijd t.b.d.' : label(r));
      var b=host.querySelector('.bl-cd');
      if(!txt){ if(b) b.remove(); return; }
      badgeEl(host).textContent=txt;
    });
    // Single cards & props: .rcard -> badge in .rc-top (header holds the match)
    [].slice.call(document.querySelectorAll('.rcard')).forEach(function(card){
      var host=card.querySelector('.rc-top') || card;
      var r=earliestFor(card.textContent||'', ev);
      var b=host.querySelector('.bl-cd');
      if(r===undefined){ if(b) b.remove(); return; }
      var txt = r===null ? '⏱ tijd t.b.d.' : label(r);
      badgeEl(host).textContent=txt;
    });
  }
  function start(){ paint(); setInterval(paint, 30000); document.addEventListener('click', function(){ setTimeout(paint, 350); }, true); }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', function(){ setTimeout(start, 600); }); }
  else { setTimeout(start, 600); }
})();
