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
