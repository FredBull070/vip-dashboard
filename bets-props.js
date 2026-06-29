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
    if(diff<=0){ return '⏳ In progress'; }
    if(diff>18*3600000){ return '⏱ '+dayLabel(epoch)+' '+clock(epoch); }
    var mins=Math.floor(diff/60000), h=Math.floor(mins/60), m=mins%60;
    var rel = h>0 ? ('begint over '+h+'u '+m+'m') : ('begint over '+m+'m');
    return '⏱ '+rel+' · '+clock(epoch);
  }
  function setBadge(host, txt){
    var b=badgeEl(host); b.textContent=txt;
    var live=txt.indexOf('In progress')>=0;
    b.style.background = live ? 'rgba(46,209,122,.16)' : 'rgba(255,138,61,.14)';
    b.style.color = live ? '#46d17a' : '#ffb27a';
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
      setBadge(host, txt);
    });
    // Single cards & props: .rcard -> badge in .rc-top (header holds the match)
    [].slice.call(document.querySelectorAll('.rcard')).forEach(function(card){
      var host=card.querySelector('.rc-top') || card;
      var r=earliestFor(card.textContent||'', ev);
      var b=host.querySelector('.bl-cd');
      if(r===undefined){ if(b) b.remove(); return; }
      var txt = r===null ? '⏱ tijd t.b.d.' : label(r);
      setBadge(host, txt);
    });
  }
  function start(){ paint(); setInterval(paint, 30000); document.addEventListener('click', function(){ setTimeout(paint, 350); }, true); }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', function(){ setTimeout(start, 600); }); }
  else { setTimeout(start, 600); }
})();

/* ---------------------------------------------------------------------------
   Daily-list lifecycle. A list belongs in the DAILY tabs only while it is still
   active (today or upcoming). The moment its day is in the past it is finished,
   so it is hidden from the daily tabs - it lives on in the Archive (the
   dashboard already keeps a dated archive). Active lists always stay. This is
   what stops an old slate (e.g. football that never got replaced) from lingering
   among today's lists. Dating: parleys carry DD-MM-YYYY in their title; single
   cards/props are dated via the *_EVENTS arrays, or, when a slate has no event
   data, via that slate's own version date. */
(function(){
  function todayKey(){ try{ var p={}; new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Amsterdam',day:'2-digit',month:'2-digit',year:'numeric'}).formatToParts(new Date()).forEach(function(x){p[x.type]=x.value;}); return p.year+'-'+p.month+'-'+p.day; }catch(e){ return ''; } }
  function dmyKey(s){ var m=(''+s).match(/(\d{2})-(\d{2})-(\d{4})/); return m ? (m[3]+'-'+m[2]+'-'+m[1]) : ''; }
  function keyForDate(d){ try{ var p={}; new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Amsterdam',day:'2-digit',month:'2-digit',year:'numeric'}).formatToParts(d).forEach(function(x){p[x.type]=x.value;}); return p.year+'-'+p.month+'-'+p.day; }catch(e){ return ''; } }
  function yesterdayKey(){ return keyForDate(new Date(Date.now()-86400000)); }
  function norm(s){ return (''+s).toLowerCase().replace(/\s+/g,' ').trim(); }
  function latestEventDate(text){
    var t=norm(text), best='';
    ['FOOTBALL_EVENTS','TENNIS_EVENTS','NBA_EVENTS','NFL_EVENTS','NHL_EVENTS'].forEach(function(k){
      var a=window[k]; if(!Array.isArray(a)) return;
      a.forEach(function(e){ if(e&&e.match&&e.date&&t.indexOf(norm(e.match))>=0){ if(e.date>best) best=e.date; } });
    });
    return best;
  }
  function settledSets(){
    var P={}, C=[];
    [window.DAILY_SETTLED, window.EMBEDDED_SETTLED, window.DAILY_PROPS_SETTLED].forEach(function(a){
      if(!Array.isArray(a)) return;
      a.forEach(function(x){ if(!x||!x.result) return; if(x.kind==='parley' && x.selection){ P[norm(x.selection)]=1; } else if(x.match && x.selection){ C.push(norm(x.match)+'~'+norm(x.selection)); } });
    });
    return {P:P, C:C};
  }
  function hideCard(el){ if(el && el.style.display!=='none'){ el.style.display='none'; el.setAttribute('data-bl-finished','1'); } }
  function showCard(el){ if(el && el.getAttribute('data-bl-finished')==='1'){ el.style.display=''; el.removeAttribute('data-bl-finished'); } }
  function sweep(){
    // Operator dashboard: never auto-hide bets. Always show every card in the
    // current slate so nothing silently disappears. The daily build replaces the
    // slate each day, and the Archive tab holds the history. (Parleys are still
    // kept off the singles page by hideParleys, which is separate from this.)
    [].slice.call(document.querySelectorAll('.rcard')).forEach(showCard);
    [].slice.call(document.querySelectorAll('.msg-card')).forEach(showCard);
  }
  function start(){ sweep(); setInterval(sweep, 4000); document.addEventListener('click', function(){ setTimeout(sweep, 300); }, true); }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', function(){ setTimeout(start, 700); }); }
  else { setTimeout(start, 700); }
})();

/* ---------------------------------------------------------------------------
   Daily Cards / Prop Cards share-chunking: when one risk category spills over
   into a second Discord message, the category header (e.g. BALANCED POSITIONS)
   must NOT be repeated at the top of the continuation message - it should only
   appear once, where the category starts. We wrap the chunk builders and strip
   a leading category header from any chunk when that same category was already
   active at the end of the previous chunk, and keep one blank line so the
   continuation message stays visually separated. */
(function(){
  function catKey(line){ var m=(''+line).match(/([A-Za-z]+)\s+POSITIONS/); return m ? m[1].toUpperCase() : null; }
  function dedupe(chunks){
    if(!Array.isArray(chunks)) return chunks;
    var active=null;
    for(var i=0;i<chunks.length;i++){
      var ch=chunks[i]; if(typeof ch!=='string') continue;
      var lines=ch.split('\n');
      if(i>0){
        var idx=0; while(idx<lines.length && lines[idx].trim()==='') idx++;
        if(idx<lines.length && /POSITIONS/.test(lines[idx])){
          var cat=catKey(lines[idx]);
          if(cat && cat===active){ lines.splice(idx,1); if(idx<lines.length && lines[idx].trim()==='') lines.splice(idx,1); ch=lines.join('\n'); }
        }
        ch=ch.replace(/^\n+/,''); // start the continuation message at its content; no extra leading blank
      }
      chunks[i]=ch;
      var heads=ch.match(/[^\n]*POSITIONS[^\n]*/g);
      if(heads && heads.length){ var k=catKey(heads[heads.length-1]); if(k) active=k; }
    }
    return chunks;
  }
  function rename(chunks){
    if(!Array.isArray(chunks)) return chunks;
    return chunks.map(function(ch){
      if(typeof ch!=='string') return ch;
      var out=ch.split('\n').map(function(l){
        if(l.indexOf('→')>=0){
          return l.replace(/Conservative/g,'Safe').replace(/\bBalanced\b/g,'Value').replace(/Aggressive/g,'Jackpot')
                  .replace(/focus on Core Positions/gi,'lowest risk positions')
                  .replace(/mix Core \+ Value Positions/gi,'moderate risk positions')
                  .replace(/include Opportunity Positions/gi,'high risk positions');
        }
        return l.replace(/CORE POSITIONS/gi,'SAFE BUILDER CARDS').replace(/BALANCED POSITIONS/gi,'VALUE BUILDER CARDS').replace(/(AGGRESSIVE|OPPORTUNITY) POSITIONS/gi,'JACKPOT BUILDER CARDS');
      }).join('\n');
      var TL=out.split('\n');
      while(TL.length && /^[\s⠀]*$/.test(TL[TL.length-1])) TL.pop();
      TL.push('⠀');
      return TL.join('\n');
    });
  }
  function wrap(name){
    var orig=window[name];
    if(typeof orig==='function' && !orig.__dedup){
      var w=function(){ return rename(dedupe(orig.apply(this, arguments))); };
      w.__dedup=true; try{ w.toString=function(){ return orig.toString(); }; }catch(e){}
      window[name]=w;
    }
    return !!(window[name] && window[name].__dedup);
  }
  function go(){ var a=wrap('buildCardsChunks'); var b=wrap('buildPropChunks'); return a&&b; }
  if(!go()){ var c=0, t=setInterval(function(){ if(go()||++c>30) clearInterval(t); }, 500); }
})();

/* ---------------------------------------------------------------------------
   Odds alignment on the single Daily Cards / Prop Cards rows. The per-card
   status badge (In progress / start time) is added into the card header flex
   row; without this the odds drifted to the middle. This clusters the odds,
   caret and status badge neatly on the right by letting the match-info column
   take the remaining space. */
(function(){
  function inject(){
    if(document.getElementById('blOddsFix')) return true;
    if(!document.head) return false;
    var st=document.createElement('style'); st.id='blOddsFix';
    st.textContent='.rcard .rc-top{display:flex !important;align-items:center;gap:10px;} .rcard .rc-top > *:first-child{margin-right:auto !important;} .rcard .rc-top .bl-cd{order:1 !important;} .rcard .rc-top .rc-odds{order:2 !important;}';
    document.head.appendChild(st); return true;
  }
  if(!inject()){ var c=0, t=setInterval(function(){ if(inject()||++c>30) clearInterval(t); }, 200); }
})();

/* ---------------------------------------------------------------------------
   Rename the risk categories in the Daily Cards / Prop Cards UI from
   Low/Medium/High (and "LOW RISK" headers) to Safe / Value / Jackpot, so the
   dashboard filter + section headers match the Safe/Value/Jackpot taxonomy.
   Display-only relabel scoped to those two pages; underlying values untouched. */
(function(){
  // Section headers live as text nodes "🟢 Low risk" inside #page-betcards/#page-propcards;
  // filter pills are BUTTON.subtab text nodes "🟢 Low" inside #subbar. Relabel both, display only.
  function relabelIn(root){
    if(!root) return;
    var w=document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, nodes=[];
    while(n=w.nextNode()) nodes.push(n);
    for(var i=0;i<nodes.length;i++){
      var tn=nodes[i], t=tn.nodeValue; if(!t || !t.trim()) continue;
      if(tn.parentNode && tn.parentNode.tagName==='OPTION') continue;
      if(/low risk/i.test(t)){ tn.nodeValue=t.replace(/low risk/ig,'Safe'); }
      else if(/medium risk/i.test(t)){ tn.nodeValue=t.replace(/medium risk/ig,'Value'); }
      else if(/high risk/i.test(t)){ tn.nodeValue=t.replace(/high risk/ig,'Jackpot'); }
      else { var core=t.replace(/[^A-Za-z]/g,'');
        if(core==='Low'){ tn.nodeValue=t.replace('Low','Safe'); }
        else if(core==='Medium'){ tn.nodeValue=t.replace('Medium','Value'); }
        else if(core==='High'){ tn.nodeValue=t.replace('High','Jackpot'); }
      }
    }
  }
  // Hard guarantee: a parley must NEVER appear in the single Daily Cards / Prop
  // Cards lists. A parley card's match field joins legs with ' + ', or its text
  // mentions a Builder/Lucky Shot Parley/Accumulator. Hide any such row.
  function hideParleys(){
    ['page-betcards','page-propcards'].forEach(function(pid){
      var root=document.getElementById(pid); if(!root) return;
      [].slice.call(root.querySelectorAll('.rcard')).forEach(function(c){
        var lab=c.querySelector('label, b, strong, .rc-top *');
        var matchTxt=lab?(lab.textContent||''):'';
        var full=(c.textContent||'');
        if(/ \+ /.test(matchTxt) || /builder parley|lucky shot|accumulator/i.test(full)){ c.style.display='none'; }
      });
    });
  }
  function go(){ relabelIn(document.getElementById('page-betcards')); relabelIn(document.getElementById('page-propcards')); relabelIn(document.getElementById('subbar')); hideParleys(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(go,800);}); else setTimeout(go,800);
  setInterval(go, 1500);
  document.addEventListener('click', function(){ setTimeout(go,200); }, true);
})();

/* ---------------------------------------------------------------------------
   TRACK RECORD MASTER LOADER.
   trackrecord.json in the repo is the single machine-master for the track
   record. On every load (every device) we fetch it and seed ba_trackrecord,
   so the dashboard always shows the master, settled state. Rows the user has
   manually locked (manual_lock=true) locally win over the master and are kept,
   so a hand-correction is never clobbered by a redeploy. */
(function(){
  // Same-origin Pages copy first (fresh on every deploy, no CDN lag), raw as fallback.
  var URLS=['/trackrecord.json','https://raw.githubusercontent.com/FredBull070/vip-dashboard/main/trackrecord.json'];
  function tryFetch(i){ if(i>=URLS.length) return Promise.resolve(null);
    return fetch(URLS[i]+'?t='+Date.now()).then(function(r){ return r.ok?r.json():tryFetch(i+1); }).catch(function(){ return tryFetch(i+1); }); }
  function load(){
    tryFetch(0).then(function(master){
      if(!Array.isArray(master) || !master.length) return;
      var local=[]; try{ local=JSON.parse(localStorage.getItem('ba_trackrecord')||'[]'); }catch(e){}
      var by={};
      master.forEach(function(r){ if(r && r.betid) by[r.betid]=r; });
      // manual-locked local rows override the master (never clobber a hand-correction)
      local.forEach(function(r){ if(r && r.betid && r.manual_lock===true) by[r.betid]=r; });
      var merged=Object.keys(by).map(function(k){ return by[k]; });
      var prev=localStorage.getItem('ba_trackrecord');
      var next=JSON.stringify(merged);
      if(next!==prev){
        localStorage.setItem('ba_trackrecord', next);
        // the dashboard computes its stats once at init, so a one-time reload makes the
        // freshly-seeded master render correctly. Guarded so it never loops.
        if(!sessionStorage.getItem('__tr_seeded')){ sessionStorage.setItem('__tr_seeded','1'); location.reload(); return; }
      }
    }).catch(function(){});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', load); else load();
})();

/* ---------------------------------------------------------------------------
   NEEDS-REVIEW SAFETY NET.
   When the settlement bot cannot settle a bet (sources disagree, result
   unclear, postponed) it leaves the row Pending and sets needs_review. These
   are surfaced inside the dashboard's NATIVE notification bell (not a banner):
   one notification per flagged bet, which disappears automatically once the
   bet is graded (needs_review clears). Nothing ever stays wrong silently. */
(function(){
  function reviewItems(){
    var tr=[]; try{ tr=JSON.parse(localStorage.getItem('ba_trackrecord')||'[]'); }catch(e){}
    return tr.filter(function(r){ return r && r.needs_review; }).map(function(r){
      var why=(r.needs_review && r.needs_review!==true) ? (''+r.needs_review) : 'needs a manual check';
      return { key:'review|'+(r.betid||r.match||''), kind:'review',
               title:'Review: '+(r.match||r.selection||'bet'), sub:why, text:why,
               read:false, seen:Date.now(), readAt:0 };
    });
  }
  function patch(){
    if(window.__blReviewPatched || typeof window.buildNotifs!=='function') return false;
    window.__blReviewPatched=true;
    try{ if(Array.isArray(window.NOTIF_TYPES) && !window.NOTIF_TYPES.some(function(t){return t[0]==='review';}))
      window.NOTIF_TYPES.push(['review','Track record review','Bets the settle-bot could not grade from two verified sources — need a manual check.']); }catch(e){}
    var orig=window.buildNotifs;
    window.buildNotifs=function(){
      var items=[]; try{ items=orig.apply(this,arguments)||[]; }catch(e){ items=[]; }
      try{ if(window.__blFeaturedChanged && window.__blFeaturedSugg){ var fs=window.__blFeaturedSugg; items.push({key:'featpub|'+fs.type+'|'+fs.period, kind:'review', title:'Sterkere slice beschikbaar: '+(fs.label||fs.type), sub:'+'+fs.roi+'% over '+fs.bets+' bets — open Track Record om te publiceren', read:false, seen:Date.now(), readAt:0}); } }catch(e){}
      try{ if(window.notifTypeOn && !window.notifTypeOn('review')) return items; }catch(e){}
      try{ reviewItems().forEach(function(it){ items.push(it); }); }catch(e){}
      return items;
    };
    var ex=document.getElementById('blReviewBar'); if(ex) ex.remove();
    try{ if(typeof window.renderNotifs==='function') window.renderNotifs(); }catch(e){}
    return true;
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ setTimeout(patch,800); }); else setTimeout(patch,800);
  var n=0, iv=setInterval(function(){ if(window.__blReviewPatched || ++n>30){ clearInterval(iv); } else patch(); }, 500);
})();

/* ---------------------------------------------------------------------------
   LEDGER — a clean, plain-language Track Record anyone can read & filter.
   Replaces the dense #tr-log panel with: summary in plain words, filters
   (sport / period / outcome / type+risk), and a per-bet list with a 2-state
   status (Open vs verified Done) where each row expands to show the final
   score + source (proof) and what the bet meant. Reads ba_trackrecord. */
(function(){
  var DEC={W:1,L:1,V:1,Push:1};
  var st={tab:'card',sport:'all',period:'all',outcome:'all',tier:'all',q:''};
  // A Lucky-Shot leg is a very-high-risk single that was never shared as a loose
  // Daily Card (it only exists inside the Lucky Shot parley). It must NOT count as
  // a standalone bet. Loose Daily Cards are the Safe/Value/Jackpot singles.
  function isLuckyLeg(r){ return r && r.kind!=='parley' && !r.prop && (r.risk||'').toLowerCase()==='very high'; }
  function typeTab(r){ return r.kind==='parley'?'parley':(r.prop?'prop':'card'); }
  function num(x){var n=parseFloat(x);return isNaN(n)?0:n;}
  function load(){ try{return JSON.parse(localStorage.getItem('ba_trackrecord')||'[]');}catch(e){return [];} }
  function kindOf(r){ return r.prop?'prop':(r.kind==='parley'?'parley':'card'); }
  function tierOf(r){ var s=(r.selection||'').toLowerCase();
    if(/lucky/.test(s))return 'lucky'; if(/jackpot/.test(s))return 'jackpot'; if(/value/.test(s))return 'value'; if(/safe/.test(s))return 'safe';
    var rk=(r.risk||'').toLowerCase(); if(rk==='low')return 'safe'; if(rk==='medium')return 'value'; if(rk==='high'||rk==='very high')return 'jackpot'; return ''; }
  function ep(d){ var p=(d||'').split('-'); return p.length===3? new Date(+p[2],+p[1]-1,+p[0]).getTime():0; }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function clean(s){ return String(s||'').replace(/\*\*/g,'').replace(/[\u{1F300}-\u{1FAFF}]/gu,'').trim(); }

  function compute(rows){
    var staked=0,profit=0,w=0,l=0,open=0;
    rows.forEach(function(r){
      if(!DEC[r.result]){ open++; return; }
      if(r.result==='V'||r.result==='Push') return;
      var s=num(r.stake),o=num(r.odds); staked+=s;
      if(r.result==='W'){profit+=s*(o-1);w++;} else if(r.result==='L'){profit-=s;l++;}
    });
    var n=w+l;
    return {profit:profit,roi:staked?100*profit/staked:0,wr:n?100*w/n:0,w:w,l:l,open:open,staked:staked};
  }
  function inPeriod(r){
    if(st.period==='all') return true;
    var span={today:1,week:7,month:31,quarter:92,year:366}[st.period];
    if(!span) return true;
    var t=ep(r.date), now=Date.now(), day=864e5;
    return t>=now-span*day && t<=now+day;
  }
  function pass(r){
    if(st.sport!=='all' && (r.sport||'').toLowerCase()!==st.sport) return false;
    if(st.outcome!=='all'){
      if(st.outcome==='open' && DEC[r.result]) return false;
      if(st.outcome==='won' && r.result!=='W') return false;
      if(st.outcome==='lost' && r.result!=='L') return false;
      if(st.outcome==='void' && !(r.result==='V'||r.result==='Push')) return false;
    }
    if(st.tier!=='all' && tierOf(r)!==st.tier) return false;
    if(st.q){ var hay=((r.match||'')+' '+(r.selection||'')).toLowerCase(); if(hay.indexOf(st.q.toLowerCase())<0) return false; }
    return true;
  }
  function fmtU(u){ return (u>=0?'+':'')+u.toFixed(2)+'u'; }
  function statusPill(r){
    if(DEC[r.result]) return '<span class="bl-st done">✅ Settled</span>';
    if(r.needs_review) return '<span class="bl-st rev">⚠ Under review</span>';
    return '<span class="bl-st open">⏳ Open</span>';
  }
  function resPill(r){
    var m={W:['Won','w'],L:['Lost','l'],V:['Void','v'],Push:['Push','v'],P:['—','p']};
    var x=m[r.result]||m.P; return '<span class="bl-res '+x[1]+'">'+x[0]+'</span>';
  }
  var TIERNAME={safe:'🟢 Safe',value:'🟡 Value',jackpot:'🔴 Jackpot',lucky:'👑 Lucky'};
  var TIEREXPL={safe:'lowest risk',value:'medium risk',jackpot:'high risk / high payout',lucky:'long shot, tiny stake'};
  // Kick-off time: use the time stored on the row if present, else look it up from
  // today's live *_EVENTS arrays by match name. Returns {t:'HH:MM', epoch} or null.
  function evNorm(s){ return (''+s).toLowerCase().replace(/\s+/g,' ').trim(); }
  function amsEpoch(dateStr,timeStr){
    var tm=(''+timeStr).match(/(\d{1,2}):(\d{2})/); if(!tm) return null;
    var dp=(''+dateStr).split('-'); if(dp.length<3) return null;
    var y=+dp[0],mo=+dp[1],d=+dp[2]; if(!y||!mo||!d) return null;
    var guess=Date.UTC(y,mo-1,d,+tm[1],+tm[2],0);
    try{ var f=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Amsterdam',hour12:false,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});
      var p={}; f.formatToParts(new Date(guess)).forEach(function(x){p[x.type]=x.value;});
      var asUTC=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second); return guess-(asUTC-guess);
    }catch(e){ return guess-2*3600000; }
  }
  function matchTime(r){
    if(r.time){ return {t:(''+r.time).match(/\d{1,2}:\d{2}/)?(''+r.time).match(/\d{1,2}:\d{2}/)[0]:r.time, epoch:amsEpoch(r.date,r.time)}; }
    var arrs=['FOOTBALL_EVENTS','TENNIS_EVENTS','NBA_EVENTS','NFL_EVENTS','NHL_EVENTS'];
    var tgt=evNorm(r.match), best=null, bt='';
    for(var ai=0;ai<arrs.length;ai++){ var a=window[arrs[ai]]; if(!Array.isArray(a)) continue;
      for(var i=0;i<a.length;i++){ var e=a[i]; if(e&&e.match&&e.time&&tgt&&tgt.indexOf(evNorm(e.match))>=0){ var ep3=amsEpoch(e.date,e.time); if(ep3!=null&&(best==null||ep3<best)){best=ep3;bt=(''+e.time).match(/\d{1,2}:\d{2}/)?(''+e.time).match(/\d{1,2}:\d{2}/)[0]:e.time;} } }
    }
    return best!=null? {t:bt,epoch:best} : null;
  }
  function timeChip(r){
    var mt=matchTime(r);
    if(!mt || !mt.t) return DEC[r.result]? '' : '';
    if(!DEC[r.result] && mt.epoch!=null && (mt.epoch-Date.now())<=0)
      return '<span class="bl-time live">🔴 In progress</span>';
    return '<span class="bl-time">🕒 '+esc(mt.t)+'</span>';
  }

  function typeBadge(r){
    var t=tierOf(r);
    var lbl=t?TIERNAME[t]:(r.prop?'Prop':'Single');
    var cls=t||(r.prop?'prop':'na');
    return '<span class="bl-ty '+cls+'">'+lbl+'</span>';
  }
  function rowHTML(r){
    var tier=tierOf(r), legs=(r.kind==='parley' && r.match)? r.match.split(' + '):null;
    var ev=r.evidence||{};
    var legHTML='';
    if(r.legs && r.legs.length){
      legHTML='<div class="bl-drow"><b>Legs — what hit, what missed:</b><div class="bl-legs">'+r.legs.map(function(L){
        var cls=L.result==='W'?'ok':(L.result==='L'?'no':'pend');
        var ic=L.result==='W'?'✓':(L.result==='L'?'✗':'•');
        return '<div class="bl-leg '+cls+'"><span class="lg-ic">'+ic+'</span><span class="lg-m">'+esc(L.match)+'</span><span class="lg-s">'+esc(clean(L.selection))+'</span></div>';
      }).join('')+'</div></div>';
    } else if(legs){
      legHTML='<div class="bl-drow"><b>Matches:</b> '+esc(legs.join('  •  '))+'</div>';
    }
    var details='<div class="bl-det">'+
      '<div class="bl-drow"><b>What is this?</b> '+(r.kind==='parley'?'A parley (accumulator): several picks combined, all must land.':(r.prop?'A player prop bet.':'A single pick (card).'))+'</div>'+
      (tier?'<div class="bl-drow"><b>Risk:</b> '+TIERNAME[tier]+' — '+TIEREXPL[tier]+'</div>':'')+
      '<div class="bl-drow"><b>Our pick:</b> '+esc(clean(r.selection))+' @ '+esc(r.odds)+' · '+esc(r.stake)+'u stake</div>'+
      legHTML+
      (DEC[r.result]? '<div class="bl-drow ok"><b>Result (verified):</b> '+esc(ev.score||r.result)+(ev.sources?' · source: '+esc([].concat(ev.sources).join(', ')):'')+'</div>'
                    : '<div class="bl-drow"><b>Status:</b> '+(r.needs_review? 'under review — '+esc(r.needs_review):'match not (verified) finished yet')+'</div>')+
      '</div>';
    return '<div class="bl-bet" data-id="'+esc(r.betid)+'">'+
      '<div class="bl-head">'+
        '<div class="bl-when"><span class="bl-date">'+esc(r.date)+'</span>'+timeChip(r)+'<span class="bl-sport">'+esc(r.sport||'')+'</span></div>'+
        '<div class="bl-mid"><div class="bl-match">'+esc(r.match)+'</div><div class="bl-pick">'+esc(clean(r.selection))+'</div></div>'+
        '<div class="bl-status">'+statusPill(r)+'</div>'+
        '<div class="bl-type">'+typeBadge(r)+'</div>'+
        '<div class="bl-stake">'+esc(r.stake)+'u<span class="bl-cap">units</span></div>'+
        '<div class="bl-odds">'+esc(r.odds)+'<span class="bl-cap">odds</span></div>'+
        '<div class="bl-result">'+resPill(r)+'</div>'+
        '<div class="bl-caret">▾</div>'+
      '</div>'+details+'</div>';
  }

  function fmtSigned(u){ return (u>=0?'+':'')+(Math.round(u*10)/10).toFixed(1)+'u'; }
  var MND=['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
  function fmtDate(e){ var d=new Date(e); return d.getDate()+' '+MND[d.getMonth()]; }
  function heroChartSVG(pts){
    var W=600,H=190,pad=6;
    if(pts.length<2) return '<svg class="bl-hsvg" viewBox="0 0 600 190"><text x="12" y="98" fill="#6f7682" font-size="13">De grafiek vult zich zodra er meer resultaten zijn.</text></svg>';
    var mn=Math.min.apply(null,pts),mx=Math.max.apply(null,pts),rng=(mx-mn)||1;
    function X(i){return pad+(W-2*pad)*i/(pts.length-1);}
    function Y(v){return pad+(H-2*pad)*(1-(v-mn)/rng);}
    var d=pts.map(function(v,i){return (i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1);}).join(' ');
    var area=d+' L'+X(pts.length-1).toFixed(1)+' '+(H-pad)+' L'+X(0).toFixed(1)+' '+(H-pad)+' Z';
    return '<svg class="bl-hsvg" viewBox="0 0 600 190" preserveAspectRatio="none">'+
      '<defs><linearGradient id="blGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(240,120,42,.40)"/><stop offset="1" stop-color="rgba(240,120,42,0)"/></linearGradient></defs>'+
      '<path d="'+area+'" fill="url(#blGrad)"/>'+
      '<path d="'+d+'" fill="none" stroke="#f0782a" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>'+
      '<circle cx="'+X(pts.length-1).toFixed(1)+'" cy="'+Y(pts[pts.length-1]).toFixed(1)+'" r="4" fill="#f0782a"/></svg>';
  }
  function buildHTML(rows){
    var base=rows.filter(function(r){return r.public!==false && !isLuckyLeg(r);});
    var tabRows=base.filter(function(r){ return st.tab==='all'?true:typeTab(r)===st.tab; }).filter(inPeriod);
    var f=tabRows.filter(pass); f.sort(function(a,b){ var da=ep(a.date),db=ep(b.date); return db-da||(b.id||0)-(a.id||0); });
    var s=compute(tabRows);
    var dec=tabRows.filter(function(r){return r.result==='W'||r.result==='L';});
    var settled=tabRows.filter(function(r){return DEC[r.result];}).length;
    var avg=dec.length? dec.reduce(function(a,r){return a+num(r.odds);},0)/dec.length : 0;
    var ser=dec.slice().sort(function(a,b){var da=ep(a.date),db=ep(b.date);return da-db||(a.id||0)-(b.id||0);});
    var cum=0,peak=0,maxdd=0,pts=[],dts=[];
    ser.forEach(function(r){ cum+= r.result==='W'? num(r.stake)*(num(r.odds)-1):-num(r.stake); peak=Math.max(peak,cum); maxdd=Math.min(maxdd,cum-peak); pts.push(cum); dts.push(ep(r.date)); });
    var sp={}; ser.forEach(function(r){ var k=r.sport||'?'; sp[k]=(sp[k]||0)+(r.result==='W'?num(r.stake)*(num(r.odds)-1):-num(r.stake)); });
    var sportArr=Object.keys(sp).map(function(k){return [k,sp[k]];}).sort(function(a,b){return b[1]-a[1];});
    var maxAbs=sportArr.reduce(function(m,x){return Math.max(m,Math.abs(x[1]));},1);
    var recent=tabRows.filter(function(r){return DEC[r.result];}).slice().sort(function(a,b){var da=ep(a.date),db=ep(b.date);return db-da||(b.id||0)-(a.id||0);}).slice(0,6);
    var dsall=tabRows.map(function(r){return ep(r.date);}).filter(Boolean).sort(function(a,b){return a-b;});
    var per=dsall.length?(fmtDate(dsall[0])+' – '+fmtDate(dsall[dsall.length-1])):'Alle tijd';
    var pc=s.profit>=0?'pos':'neg', rc=s.roi>=0?'pos':'neg';
    var labs=''; if(dts.length){ var seen={}; labs=[0,.25,.5,.75,1].map(function(t){var k=fmtDate(dts[Math.round(t*(dts.length-1))]); if(seen[k])return '<span></span>'; seen[k]=1; return '<span>'+k+'</span>';}).join(''); }
    var pg=function(r){ return r.result==='W'? num(r.stake)*(num(r.odds)-1):(r.result==='L'?-num(r.stake):0); };
    var opts=function(arr,cur){ return arr.map(function(o){return '<option value="'+o[0]+'"'+(o[0]===cur?' selected':'')+'>'+o[1]+'</option>';}).join(''); };

    var cCard=base.filter(function(r){return typeTab(r)==='card';}).length;
    var cPar=base.filter(function(r){return typeTab(r)==='parley';}).length;
    var cProp=base.filter(function(r){return typeTab(r)==='prop';}).length;
    var tb=function(k,lbl,n){ return '<button class="bl-tab'+(st.tab===k?' on':'')+'" data-tab="'+k+'">'+lbl+' <span class="bl-tn">'+n+'</span></button>'; };
    var tabs='<div class="bl-tabs">'+tb('card','Daily Betting Cards',cCard)+tb('parley','Parleys',cPar)+tb('prop','Daily Prop Cards',cProp)+tb('all','All',base.length)+'</div>';
    var sub=st.tab==='card'?'single picks':(st.tab==='parley'?'parleys':(st.tab==='prop'?'prop cards':'all bets'));

    var TF=[['all','All'],['today','Daily'],['week','Weekly'],['month','Monthly'],['quarter','Quarterly'],['year','Yearly']];
    var tfChips='<span class="bl-tfs">'+TF.map(function(o){return '<button class="bl-tf'+(st.period===o[0]?' on':'')+'" data-tf="'+o[0]+'">'+o[1]+'</button>';}).join('')+'</span>';
    var hero='<div class="bl-hero"><div class="bl-hrow"><span class="bl-brand"><span class="bl-dot"></span> BetLife365 · Track record</span>'+tfChips+'<span class="bl-per">'+esc(per)+'</span></div>'+
      '<div class="bl-hgrid"><div class="bl-hleft">'+
        '<div class="bl-big '+pc+'">'+fmtSigned(s.profit)+'</div><div class="bl-bigsub">Net profit · '+sub+' · tracked in units</div>'+
        '<div class="bl-h4">'+
          '<div><div class="hv '+rc+'">'+(s.roi>=0?'+':'')+s.roi.toFixed(1)+'%</div><div class="hk">ROI</div></div>'+
          '<div><div class="hv">'+s.wr.toFixed(0)+'%</div><div class="hk">Strike rate</div></div>'+
          '<div><div class="hv">'+avg.toFixed(2)+'</div><div class="hk">Avg odds</div></div>'+
          '<div><div class="hv">'+settled+'</div><div class="hk">Bets settled</div></div>'+
        '</div></div>'+
        '<div class="bl-hright">'+heroChartSVG(pts)+'<div class="bl-xlabels">'+labs+'</div><div class="bl-cap">Cumulative units. Up and down periods, all logged, nothing removed.</div></div>'+
      '</div></div>';

    var cell=function(v,k,cls){return '<div class="bl-cell"><div class="cv '+(cls||'')+'">'+v+'</div><div class="ck">'+k+'</div></div>';};
    var strip='<div class="bl-strip">'+
      cell(fmtSigned(s.profit),'Net profit',pc)+cell((s.roi>=0?'+':'')+s.roi.toFixed(1)+'%','ROI',rc)+
      cell(s.wr.toFixed(0)+'%','Strike rate')+cell(String(settled),'Bets settled')+
      cell(avg.toFixed(2),'Avg odds')+cell(maxdd.toFixed(1)+'u','Max drawdown','neg')+'</div>';

    var bars=sportArr.length? sportArr.map(function(x){var w=Math.max(4,Math.round(Math.abs(x[1])/maxAbs*100));var pos=x[1]>=0;return '<div class="bl-bar"><span class="bn">'+esc(x[0])+'</span><span class="bt"><span class="bf '+(pos?'':'negf')+'" style="width:'+w+'%"></span></span><span class="bv '+(pos?'pos':'neg')+'">'+fmtSigned(x[1])+'</span></div>';}).join('') : '<div class="bl-empty">No settled bets yet.</div>';
    var rec=recent.length? recent.map(function(r){var g=pg(r);var cls=r.result==='W'?'w':(r.result==='L'?'l':'v');return '<div class="bl-rr"><span class="rm">'+esc(r.match)+'</span><span class="rg '+cls+'">'+r.result+'</span><span class="rv '+(g>=0?'pos':'neg')+'">'+fmtSigned(g)+'</span></div>';}).join('') : '<div class="bl-empty">No results yet.</div>';
    var panels='<div class="bl-two"><div class="bl-panel"><div class="bl-ph">Profit by sport</div>'+bars+'</div><div class="bl-panel"><div class="bl-ph">Recent results</div>'+rec+'</div></div>';

    var filters='<div class="bl-filters">'+
      '<input id="blq" class="bl-inp" type="text" placeholder="🔎 search team or player" value="'+esc(st.q)+'">'+
      '<select class="bl-sel" data-k="sport">'+opts([['all','All sports'],['football','Football'],['tennis','Tennis'],['nba','NBA'],['nfl','NFL'],['nhl','NHL']],st.sport)+'</select>'+
      '<select class="bl-sel" data-k="outcome">'+opts([['all','All outcomes'],['won','Won'],['lost','Lost'],['open','Open'],['void','Void']],st.outcome)+'</select>'+
      '<select class="bl-sel" data-k="tier">'+opts([['all','All risk'],['safe','🟢 Safe'],['value','🟡 Value'],['jackpot','🔴 Jackpot']],st.tier)+'</select>'+
      '<button class="bl-reset" data-k="reset">Reset</button></div>';

    return '<div class="bl-ledger">'+tabs+hero+strip+panels+
      '<div class="bl-fwrap">'+filters+'<div class="bl-count">'+f.length+' of '+tabRows.length+' '+sub+'</div>'+
      '<div class="bl-list">'+(f.length? f.map(rowHTML).join(''):'<div class="bl-empty">No bets match these filters.</div>')+'</div></div></div>';
  }

  function injectCSS(){
    if(document.getElementById('blLedgerCSS')) return;
    var s=document.createElement('style'); s.id='blLedgerCSS';
    s.textContent=[
      '.bl-ledger{font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#e9eaee}',
      '.bl-ledger .pos{color:#35c66b}.bl-ledger .neg{color:#ff6a4d}',
      '.bl-tabs{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}',
      '.bl-tab{background:#121317;border:1px solid #232631;color:#c7ccd4;border-radius:10px;padding:9px 15px;font-size:13px;font-weight:600;cursor:pointer}',
      '.bl-tab.on{background:#f0782a;border-color:#f0782a;color:#1a1206}',
      '.bl-tab .bl-tn{opacity:.7;font-weight:600;margin-left:3px}.bl-tab.on .bl-tn{opacity:.85}',
      '.bl-hero{background:#121317;border:1px solid #232631;border-radius:18px;padding:18px 20px;margin-bottom:14px}',
      '.bl-hrow{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px}',
      '.bl-brand{font-weight:600;font-size:14px;margin-right:auto}.bl-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#f0782a;margin-right:7px;vertical-align:middle}',
      '.bl-per{color:#7d828d;font-size:12px}',
      '.bl-tfs{display:inline-flex;gap:3px;background:#0e0f13;border:1px solid #232631;border-radius:9px;padding:3px}',
      '.bl-tf{background:transparent;border:0;color:#9aa0ab;font-size:12px;font-weight:600;padding:5px 10px;border-radius:7px;cursor:pointer}',
      '.bl-tf.on{background:#f0782a;color:#1a1206}',
      '.bl-hgrid{display:grid;grid-template-columns:minmax(210px,1fr) 1.45fr;gap:26px;align-items:center}',
      '.bl-big{font-size:46px;font-weight:800;line-height:1;color:#f0782a;letter-spacing:-1px}.bl-big.neg{color:#ff6a4d}',
      '.bl-bigsub{color:#9aa0ab;font-size:13px;margin:9px 0 20px}',
      '.bl-h4{display:grid;grid-template-columns:1fr 1fr;gap:16px 22px}',
      '.bl-h4 .hv{font-size:19px;font-weight:700}.bl-h4 .hk{color:#7d828d;font-size:12px;margin-top:1px}',
      '.bl-hright .bl-hsvg{width:100%;height:188px;display:block}',
      '.bl-xlabels{display:flex;justify-content:space-between;color:#6f7682;font-size:11px;margin-top:5px}',
      '.bl-cap{color:#7d828d;font-size:12px;margin-top:11px;max-width:430px}',
      '.bl-strip{display:grid;grid-template-columns:repeat(6,1fr);background:#121317;border:1px solid #232631;border-radius:14px;margin-bottom:14px;overflow:hidden}',
      '.bl-cell{padding:14px 16px;border-left:1px solid #1e212a}.bl-cell:first-child{border-left:0}',
      '.bl-cell .cv{font-size:20px;font-weight:700}.bl-cell .ck{color:#7d828d;font-size:11px;margin-top:2px}',
      '.bl-two{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}',
      '.bl-panel{background:#121317;border:1px solid #232631;border-radius:14px;padding:14px 16px}',
      '.bl-ph{color:#7d828d;font-size:11px;text-transform:uppercase;letter-spacing:.7px;margin-bottom:12px}',
      '.bl-bar{display:grid;grid-template-columns:74px 1fr 56px;align-items:center;gap:10px;margin-bottom:11px}',
      '.bl-bar .bn{font-size:13px}.bl-bar .bt{height:8px;background:#23262e;border-radius:6px;overflow:hidden}.bl-bar .bf{display:block;height:100%;background:#f0782a;border-radius:6px}.bl-bar .bf.negf{background:#ff6a4d}.bl-bar .bv{text-align:right;font-size:13px;font-weight:600}',
      '.bl-rr{display:grid;grid-template-columns:1fr 26px 56px;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid #1c1f26}.bl-rr:last-child{border-bottom:0}',
      '.bl-rr .rm{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bl-rr .rg{font-size:11px;font-weight:800;text-align:center;border-radius:6px;padding:2px 0}.bl-rr .rg.w{background:rgba(53,198,107,.16);color:#35c66b}.bl-rr .rg.l{background:rgba(255,106,77,.16);color:#ff6a4d}.bl-rr .rg.v{background:rgba(138,143,154,.16);color:#aeb4be}.bl-rr .rv{text-align:right;font-size:13px;font-weight:700}',
      '.bl-fwrap{background:#121317;border:1px solid #232631;border-radius:14px;padding:14px 16px}',
      '.bl-filters{display:grid;grid-template-columns:2.2fr 1.1fr 1.1fr 1.1fr auto;gap:10px;margin-bottom:12px;align-items:center}',
      '.bl-inp,.bl-sel,.bl-reset{height:42px;background:#0e0f13;border:1px solid #2a2e37;color:#e9eaee;border-radius:10px;font-size:13px;outline:none;width:100%;box-sizing:border-box;transition:border-color .15s,background .15s}',
      '.bl-inp{padding:0 14px}.bl-inp::placeholder{color:#6f7682}',
      '.bl-sel{padding:0 34px 0 14px;cursor:pointer;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%237d828d\' stroke-width=\'2.5\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 13px center}',
      '.bl-inp:focus,.bl-sel:focus{border-color:#f0782a;background:#121317}.bl-sel:hover{border-color:#3a3f4a}',
      '.bl-reset{padding:0 18px;cursor:pointer;color:#f0782a;font-weight:600;background:transparent}.bl-reset:hover{background:rgba(240,120,42,.08);border-color:#f0782a}',
      '@media(max-width:760px){.bl-filters{grid-template-columns:1fr 1fr}}',
      '.bl-count{color:#7d828d;font-size:12px;margin:2px 2px 10px}',
      '.bl-bet{background:#15171c;border:1px solid #23262e;border-radius:11px;margin-bottom:8px;overflow:hidden}',
      '.bl-head{display:grid;grid-template-columns:104px 1fr 110px 96px 60px 60px 84px 20px;align-items:center;gap:12px;padding:11px 14px;cursor:pointer}',
      '.bl-when{font-size:12px;color:#9aa0ab;line-height:1.45}.bl-when .bl-date{display:block;font-weight:600;color:#c7ccd4}.bl-when .bl-sport{display:block;color:#6f7682;font-size:11px}',
      '.bl-time{display:inline-block;font-size:11px;font-weight:600;color:#9aa0ab}.bl-time.live{color:#46d17a}',
      '.bl-match{font-weight:600}.bl-pick{color:#9aa0ab;font-size:12px}',
      '.bl-status,.bl-type,.bl-result{display:flex;justify-content:center}',
      '.bl-odds,.bl-stake{font-weight:700;text-align:center;line-height:1.15}',
      '.bl-stake{color:#f0a36a}',
      '.bl-cap{display:block;font-size:9px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:#6f7682;margin-top:1px}',
      '.bl-ty{font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;white-space:nowrap}',
      '.bl-ty.safe{background:rgba(53,198,107,.14);color:#35c66b}.bl-ty.value{background:rgba(240,170,60,.16);color:#f0aa3c}.bl-ty.jackpot{background:rgba(255,90,90,.16);color:#ff7a7a}.bl-ty.lucky{background:rgba(178,120,255,.18);color:#b27aff}.bl-ty.prop{background:rgba(90,160,255,.16);color:#5aa0ff}.bl-ty.na{background:rgba(138,143,154,.14);color:#9aa0ab}',
      '.bl-legs{margin-top:7px;display:flex;flex-direction:column;gap:5px}',
      '.bl-leg{display:grid;grid-template-columns:16px 1fr auto;align-items:center;gap:9px;background:#0e0f13;border:1px solid #1c1f26;border-radius:8px;padding:6px 11px}',
      '.bl-leg .lg-ic{font-weight:800;text-align:center}.bl-leg.ok .lg-ic{color:#35c66b}.bl-leg.no .lg-ic{color:#ff6a4d}.bl-leg.pend .lg-ic{color:#9aa0ab}',
      '.bl-leg .lg-m{font-weight:600;color:#e9eaee}.bl-leg .lg-s{color:#9aa0ab;font-size:12px;text-align:right}',
      '.bl-st{font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;white-space:nowrap}',
      '.bl-st.done{background:rgba(53,198,107,.14);color:#35c66b}.bl-st.open{background:rgba(240,120,42,.16);color:#f0a36a}.bl-st.rev{background:rgba(255,90,90,.16);color:#ff7a7a}',
      '.bl-res{font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px}',
      '.bl-res.w{background:rgba(53,198,107,.16);color:#35c66b}.bl-res.l{background:rgba(255,106,77,.16);color:#ff6a4d}.bl-res.v{background:rgba(138,143,154,.18);color:#aeb4be}.bl-res.p{background:rgba(138,143,154,.1);color:#6f7682}',
      '.bl-caret{color:#6f7682;text-align:center;transition:transform .15s}.bl-bet.open-row .bl-caret{transform:rotate(180deg)}',
      '.bl-det{display:none;padding:2px 14px 13px;border-top:1px solid #23262e;color:#c7ccd4;font-size:13px}.bl-bet.open-row .bl-det{display:block}',
      '.bl-drow{padding:7px 0;border-bottom:1px solid #1c1f26}.bl-drow:last-child{border-bottom:0}.bl-drow.ok b{color:#35c66b}.bl-drow b{color:#e9eaee}',
      '.bl-empty{color:#9aa0ab;padding:18px;text-align:center}',
      '@media(max-width:860px){.bl-hgrid{grid-template-columns:1fr}.bl-strip{grid-template-columns:repeat(3,1fr)}.bl-cell:nth-child(4){border-left:0}.bl-two{grid-template-columns:1fr}.bl-head{grid-template-columns:1fr 84px 50px 72px 20px}.bl-when,.bl-status,.bl-odds{display:none}}'
    ].join('');
    document.head.appendChild(s);
  }

  var box=null, lastSig=null;
  function render(){
    var host=document.getElementById('page-trackrecord'); if(!host) return;
    injectCSS();
    var log=document.getElementById('tr-log'); if(log) log.style.display='none';
    if(!box || !box.isConnected){
      box=document.createElement('div'); box.id='blLedger';
      host.insertBefore(box, host.firstChild);
      box.addEventListener('click', onClick);
      box.addEventListener('change', onChange);
      box.addEventListener('input', onInput);
    }
    var raw=localStorage.getItem('ba_trackrecord')||'[]'; lastSig=raw;
    var sc=box.scrollTop;
    var rows; try{rows=JSON.parse(raw);}catch(e){rows=[];}
    box.innerHTML=buildHTML(rows);
    box.scrollTop=sc;
  }
  // Lightweight update: rebuild only the result list + count, leaving the filter
  // controls and hero in place — so dropdowns and the search box never reset or
  // close. Used for the browse filters (sport / outcome / risk / search).
  function renderResults(){
    if(!box) return;
    var rows; try{rows=JSON.parse(localStorage.getItem('ba_trackrecord')||'[]');}catch(e){rows=[];}
    var base=rows.filter(function(r){return r.public!==false && !isLuckyLeg(r);});
    var tabRows=base.filter(function(r){ return st.tab==='all'?true:typeTab(r)===st.tab; }).filter(inPeriod);
    var f=tabRows.filter(pass); f.sort(function(a,b){ var da=ep(a.date),db=ep(b.date); return db-da||(b.id||0)-(a.id||0); });
    var sub=st.tab==='card'?'single picks':(st.tab==='parley'?'parleys':(st.tab==='prop'?'prop cards':'all bets'));
    var listEl=box.querySelector('.bl-list'), cntEl=box.querySelector('.bl-count');
    if(listEl) listEl.innerHTML=f.length? f.map(rowHTML).join(''):'<div class="bl-empty">No bets match these filters.</div>';
    if(cntEl) cntEl.textContent=f.length+' of '+tabRows.length+' '+sub;
  }
  function onClick(e){
    var tf=e.target.closest('.bl-tf');
    if(tf){ st.period=tf.getAttribute('data-tf'); render(); return; }
    var t=e.target.closest('.bl-tab');
    if(t){ st.tab=t.getAttribute('data-tab'); render(); return; }
    var rs=e.target.closest('.bl-reset');
    if(rs){ st={tab:st.tab,sport:'all',period:'all',outcome:'all',tier:'all',q:''}; render(); return; }
    var head=e.target.closest('.bl-head');
    if(head){ head.parentNode.classList.toggle('open-row'); }
  }
  function onChange(e){
    var sel=e.target.closest('.bl-sel'); if(!sel) return;
    var k=sel.getAttribute('data-k'); st[k]=sel.value;
    if(k==='period') render(); else renderResults();
  }
  var qt;
  function onInput(e){ if(e.target.id==='blq'){ clearTimeout(qt); st.q=e.target.value; qt=setTimeout(renderResults, 200); } }

  function tick(){
    var p=document.getElementById('page-trackrecord'), sb=document.getElementById('subbar');
    if(p && getComputedStyle(p).display!=='none'){
      if(sb) sb.style.display='none';
      if(!box || !box.isConnected){ render(); return; }
      var cur=localStorage.getItem('ba_trackrecord')||'[]';
      if(cur!==lastSig) render();
    } else if(sb && sb.style.display==='none'){ sb.style.display=''; }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ setTimeout(tick,900); }); else setTimeout(tick,900);
  setInterval(tick, 1500);
})();

/* ---------------------------------------------------------------------------
   PUBLIC HEADLINE CONTROL (operator-only).
   Fred decides which slice the PUBLIC site (betlife365.com) shows as its
   headline. The daily suggestion engine writes featured_suggestion.json; the
   currently-published config is featured.json. This bar sits on top of the
   Track Record tab: it shows what's public now, the strongest current slice,
   and lets Fred publish that or pick any type+timeline himself. Publishing
   POSTs to the Cloudflare Worker (window.BL_PUBLISH_URL) when configured; until
   then it stores the choice locally and tells him it goes live once connected. */
(function(){
  var TYPES=[['card','Daily Cards'],['prop','Daily Props'],['parley','Parleys'],['all','All']];
  var PERIODS=[['today','today'],['week','this week'],['month','this month'],['quarter','this quarter'],['year','this year'],['all','all-time']];
  function tLabel(t){ for(var i=0;i<TYPES.length;i++) if(TYPES[i][0]===t) return TYPES[i][1]; return t; }
  function pLabel(p){ for(var i=0;i<PERIODS.length;i++) if(PERIODS[i][0]===p) return PERIODS[i][1]; return p; }
  function cap(s){ return s? s.charAt(0).toUpperCase()+s.slice(1):s; }
  var st={featured:null,sugg:null,pending:null,open:false,sel:{type:'parley',period:'week'},loaded:false};
  window.BL_PUBLISH_URL='https://betlife365-publish.wfsirvania.workers.dev';
  try{ st.pending=JSON.parse(localStorage.getItem('ba_featured_pending')||'null'); }catch(e){}
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function flags(){
    window.__blFeaturedSugg=st.sugg;
    window.__blFeaturedChanged=!!(st.sugg && st.featured && (st.sugg.type!==st.featured.type || st.sugg.period!==st.featured.period));
  }
  function fetchCfg(){
    fetch('/featured.json?t='+Date.now()).then(function(r){return r.ok?r.json():null;}).then(function(j){ if(j){ st.featured=j; if(!st.loaded){ st.sel={type:j.type||'parley',period:j.period||'week'}; st.loaded=true; } flags(); paint(true); } }).catch(function(){});
    fetch('/featured_suggestion.json?t='+Date.now()).then(function(r){return r.ok?r.json():null;}).then(function(j){ if(j){ st.sugg=j; flags(); paint(true); } }).catch(function(){});
  }
  function injectCSS(){
    if(document.getElementById('blPubCSS')) return;
    var s=document.createElement('style'); s.id='blPubCSS';
    s.textContent=[
      '#blPub{background:linear-gradient(180deg,#1b1410,#15171c);border:1px solid #3a2a1c;border-radius:14px;padding:13px 16px;margin-bottom:14px}',
      '.blpub-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}',
      '.blpub-lbl{font-size:12px;color:#9aa0ab}.blpub-cur{font-weight:700;color:#e9eaee}.blpub-sugg{color:#f0a36a;font-weight:600}',
      '.blpub-btn{background:#f0782a;border:0;color:#1a1206;font-weight:700;font-size:12px;padding:8px 14px;border-radius:9px;cursor:pointer}',
      '.blpub-btn.ghost{background:transparent;border:1px solid #3a3f4a;color:#e9eaee}',
      '.blpub-sp{margin-left:auto}',
      '.blpub-pick{margin-top:11px;display:none;gap:10px;flex-wrap:wrap;align-items:center}#blPub.open .blpub-pick{display:flex}',
      '.blpub-sel{height:38px;background:#0e0f13;border:1px solid #2a2e37;color:#e9eaee;border-radius:9px;padding:0 12px;font-size:13px}',
      '.blpub-note{font-size:11px;color:#6f7682;margin-top:9px}.blpub-ok{color:#35c66b}'
    ].join('');
    document.head.appendChild(s);
  }
  function curLabel(){ var f=st.pending||st.featured; return f? (f.label||(tLabel(f.type)+' · '+pLabel(f.period))):'—'; }
  function html(){
    var f=st.featured, s=st.sugg, pend=st.pending, cur=curLabel();
    var curRoi=(pend&&pend.roi!=null)?pend.roi:(f&&f.roi!=null?f.roi:null);
    var changed=st.sugg && st.featured && (st.sugg.type!==st.featured.type || st.sugg.period!==st.featured.period);
    var h='<div class="blpub-row"><span>🌐</span><span class="blpub-lbl">Publiek op de site:</span> <span class="blpub-cur">'+esc(cur)+(curRoi!=null?' · '+(curRoi>=0?'+':'')+curRoi+'% ROI':'')+'</span>';
    if(changed){
      h+='<span class="blpub-lbl">— sterkste nu:</span> <span class="blpub-sugg">'+esc(s.label||(tLabel(s.type)+' · '+pLabel(s.period)))+' · +'+s.roi+'% over '+s.bets+' bets</span>'+
         '<button class="blpub-btn blpub-sp" data-pub="sugg">Publiceer suggestie</button><button class="blpub-btn ghost" data-toggle="1">Zelf kiezen ▾</button>';
    } else {
      h+='<button class="blpub-btn ghost blpub-sp" data-toggle="1">Zelf kiezen ▾</button>';
    }
    h+='</div><div class="blpub-pick">'+
      '<select class="blpub-sel" data-k="type">'+TYPES.map(function(o){return '<option value="'+o[0]+'"'+(st.sel.type===o[0]?' selected':'')+'>'+o[1]+'</option>';}).join('')+'</select>'+
      '<select class="blpub-sel" data-k="period">'+PERIODS.map(function(o){return '<option value="'+o[0]+'"'+(st.sel.period===o[0]?' selected':'')+'>'+cap(o[1])+'</option>';}).join('')+'</select>'+
      '<button class="blpub-btn" data-pub="pick">Publiceer deze keuze</button></div>';
    var note=window.BL_PUBLISH_URL ? 'Goedkeuren = direct live op betlife365.com.'
      : (pend? '<span class="blpub-ok">Keuze opgeslagen ✓</span> — gaat live zodra de publisher (Cloudflare Worker) is gekoppeld.'
             : 'De landing toont de laatst goedgekeurde slice; het eerlijke totaal staat er altijd naast.');
    return h+'<div class="blpub-note">'+note+'</div>';
  }
  function ensure(){
    var host=document.getElementById('page-trackrecord'); if(!host) return null;
    var bar=document.getElementById('blPub');
    if(!bar){ bar=document.createElement('div'); bar.id='blPub'; bar.addEventListener('click',onClick); bar.addEventListener('change',onChange); }
    var led=document.getElementById('blLedger');
    if(led){ if(bar.nextSibling!==led || bar.parentNode!==host) host.insertBefore(bar,led); }
    else if(bar.parentNode!==host){ host.insertBefore(bar,host.firstChild); }
    return bar;
  }
  function paint(force){
    if(!st.featured && !st.sugg) return;
    injectCSS(); var bar=ensure(); if(!bar) return;
    var sig=JSON.stringify([st.featured,st.sugg,st.pending,st.open]);
    if(!force && bar.__sig===sig) return; bar.__sig=sig;
    bar.innerHTML=html();
    if(st.open) bar.classList.add('open'); else bar.classList.remove('open');
  }
  function publish(cfg){
    cfg.approved_by='fred'; cfg.updated_at=new Date().toISOString();
    if(window.BL_PUBLISH_URL){
      fetch(window.BL_PUBLISH_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(cfg)})
        .then(function(r){ if(r.ok){ st.featured=cfg; st.pending=null; localStorage.removeItem('ba_featured_pending'); flags(); toast('Live op de site ✓'); } else { toast('Publiceren mislukt ('+r.status+')'); } paint(true); })
        .catch(function(){ toast('Publiceren mislukt — netwerk'); });
    } else {
      st.pending=cfg; localStorage.setItem('ba_featured_pending',JSON.stringify(cfg)); toast('Keuze opgeslagen ✓'); paint(true);
    }
  }
  function onClick(e){
    var tg=e.target.closest('[data-toggle]'); if(tg){ st.open=!st.open; paint(true); return; }
    var pb=e.target.closest('[data-pub]'); if(!pb) return;
    if(pb.getAttribute('data-pub')==='sugg' && st.sugg){ publish({type:st.sugg.type,period:st.sugg.period,label:st.sugg.label,roi:st.sugg.roi,bets:st.sugg.bets}); }
    else { publish({type:st.sel.type,period:st.sel.period,label:tLabel(st.sel.type)+' · '+pLabel(st.sel.period)}); }
  }
  function onChange(e){ var sel=e.target.closest('.blpub-sel'); if(sel) st.sel[sel.getAttribute('data-k')]=sel.value; }
  function toast(m){ try{ if(typeof window.showToast==='function'){ window.showToast(m); return; } }catch(e){} var t=document.createElement('div'); t.textContent=m; t.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#15171c;border:1px solid #2a2e37;color:#e9eaee;padding:10px 16px;border-radius:10px;z-index:99999;font:600 13px system-ui'; document.body.appendChild(t); setTimeout(function(){t.remove();},2600); }
  fetchCfg(); setInterval(fetchCfg,60000); setInterval(function(){ paint(false); },1500);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ setTimeout(function(){paint(true);},1000); }); else setTimeout(function(){paint(true);},1000);
})();
