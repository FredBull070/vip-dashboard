/* BetLife365 daily PROP cards - written by the prop-cards-builder task, read by the dashboard.
Same structure as DAILY_CARDS (MATCH/MARKET/SELECTION/ODDS/STAKE/RISK/ANALYSIS, grouped by
risk: low=Core, medium=Value, high=Aggressive). Player props across every sport we offer.
Code stays separate from the dashboard. This is the seed slate; the builder replaces it daily. */
window.DAILY_PROPS_VERSION = "2026-06-29";

window.DAILY_PROPS = `SPORT: Tennis
MATCH: Wimbledon - Sinner x Kecmanovic
MARKET: Set handicap
SELECTION: Jannik Sinner -1.5 sets (best-of-5)
ODDS: 1.55*
STAKE: 1u
RISK: low
ANALYSIS: Titelverdediger opent op Centre Court tegen een speler buiten de top-40; op gras is het serviceverschil groot, dus 3-0/3-1 is realistisch en de lijn oogt aan de lage kant.
===
SPORT: Tennis
MATCH: Wimbledon - Sabalenka x Kostovic
MARKET: Set handicap
SELECTION: Aryna Sabalenka -1.5 sets (2-0)
ODDS: 1.45*
STAKE: 1u
RISK: low
ANALYSIS: Topreekshoofd tegen een veel lager geklasseerde debutante; Sabalenka's power op gras maakt een glad 2-0 het basisscenario.
===
SPORT: Football
MATCH: Brazil x Japan
MARKET: Shots on target
SELECTION: Vinicius Jr 1+ schoten op doel
ODDS: 1.50*
STAKE: 1u
RISK: low
ANALYSIS: Vaste basisklant en Brazilie's grootste dreiging vanaf links; Japan moet jagen, dus minstens een schot op doel is een betrouwbare floor.
===
SPORT: Tennis
MATCH: Wimbledon - Djokovic x Wu Yibing
MARKET: Set handicap
SELECTION: Novak Djokovic -1.5 sets (best-of-5)
ODDS: 1.70*
STAKE: 1u
RISK: low
ANALYSIS: Zevenvoudig kampioen op zijn favoriete ondergrond tegen een speler die nauwelijks gras speelt; een set verlies is mogelijk maar -1.5 dekt het waarschijnlijke 3-0/3-1.
===
SPORT: Football
MATCH: Brazil x Japan
MARKET: Shots on target
SELECTION: Raphinha 1+ schoten op doel
ODDS: 1.55*
STAKE: 1u
RISK: low
ANALYSIS: Vaste basisspeler die de hoekschoppen en vrije trappen neemt en veel afstandsschoten lost; tegen een terugzakkend Japan is volume gegarandeerd.
===
SPORT: Football
MATCH: Brazil x Japan
MARKET: Anytime goalscorer
SELECTION: Vinicius Jr scoort
ODDS: 2.40*
STAKE: 0.75u
RISK: medium
ANALYSIS: Brazilie domineert balbezit en Vinicius scoorde al in de groepsfase; tegen een open Japans blok biedt deze prijs waarde voor de gevaarlijkste man op het veld.
===
SPORT: Football
MATCH: Germany x Paraguay
MARKET: Shots on target
SELECTION: Florian Wirtz 1+ schoten op doel
ODDS: 1.80*
STAKE: 0.75u
RISK: medium
ANALYSIS: Duitsland krijgt het overwicht tegen een verdedigend Paraguay; Wirtz komt laat de zestien in en lost veel pogingen, lijn lijkt te hoog geprijsd.
===
SPORT: Football
MATCH: Netherlands x Morocco
MARKET: Shots on target
SELECTION: Cody Gakpo 1+ schoten op doel
ODDS: 1.85*
STAKE: 0.75u
RISK: medium
ANALYSIS: Gakpo is Oranje's vaste linksbuiten en eerste afwerker; ook in een gesloten knock-out levert hij doorgaans minstens een schot op doel, prijs oogt genereus.
===
SPORT: Tennis
MATCH: Wimbledon - Sinner x Kecmanovic
MARKET: Player aces
SELECTION: Jannik Sinner 9+ aces
ODDS: 1.90*
STAKE: 0.75u
RISK: medium
ANALYSIS: Op gras loopt Sinner's eerste opslag flink op; over een best-of-5 tegen een returner van gemiddeld niveau is 9+ aces een eerlijke tot lage lijn.
===
SPORT: Tennis
MATCH: Wimbledon - Medvedev x Cilic
MARKET: Totaal games
SELECTION: Over 35.5 games
ODDS: 1.85*
STAKE: 0.75u
RISK: medium
ANALYSIS: Twee zware opslagers op gras in een best-of-5; servicegames gaan snel mee en tiebreaks liggen op de loer, waardoor het totaal makkelijk oploopt.
===
SPORT: Football
MATCH: Netherlands x Morocco
MARKET: Anytime goalscorer
SELECTION: Achraf Hakimi scoort
ODDS: 4.50*
STAKE: 0.25u
RISK: high
ANALYSIS: Aanvallende rechtsback en aanvoerder die ver opkomt en penalty's kan nemen; in een tie waarin Marokko moet komen is dit een waardevolle longshot.
===
SPORT: Football
MATCH: Germany x Paraguay
MARKET: Anytime goalscorer
SELECTION: Florian Wirtz scoort
ODDS: 3.25*
STAKE: 0.25u
RISK: high
ANALYSIS: Met veel balbezit en late loopacties richting de tweede paal heeft Wirtz reele scoringskansen; tegen deze prijs een aantrekkelijke aggressive pick.`;

window.EMBEDDED_PROPS = { date: "2026-06-29" };

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
function norm(s){ return (''+s).toLowerCase().replace(/\s+/g,' ').replace(/ /g,' ').trim(); }
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
var today=todayKey(); if(!today) return;
var s=settledSets();
var yest=yesterdayKey();
// A list is FINISHED (-> archive, hidden from daily) only when it is settled,
// or when every one of its matches is dated before today. A list with any match
// still to play (today or upcoming) stays ACTIVE and visible.
[].slice.call(document.querySelectorAll('.msg-card')).forEach(function(card){
var titleEl=card.querySelector('.msg-title'); if(!titleEl) return;
var title=norm(titleEl.textContent||'');
var finished=false;
for(var key in s.P){ if(key && title.indexOf(key)>=0){ finished=true; break; } }
if(!finished){ var led=latestEventDate(card.textContent||''); if(led && led<today) finished=true; }
if(!finished){ var dk=dmyKey(titleEl.textContent||''); if(dk && yest && dk<yest) finished=true; }
if(finished) hideCard(card); else showCard(card);
});
[].slice.call(document.querySelectorAll('.rcard')).forEach(function(card){
var t=norm(card.textContent||'');
var finished=false;
for(var i=0;i<s.C.length;i++){ var mc=s.C[i].split('~'); if(mc[0]&&mc[1]&&t.indexOf(mc[0])>=0&&t.indexOf(mc[1])>=0){ finished=true; break; } }
if(!finished){ var led=latestEventDate(card.textContent||''); if(led && led<today) finished=true; }
if(finished) hideCard(card); else showCard(card);
});
}
function start(){ sweep(); setInterval(sweep, 4000); document.addEventListener('click', function(){ setTimeout(sweep, 300); }, true); }
if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', function(){ setTimeout(start, 700); }); }
else { setTimeout(start, 700); }
})();
