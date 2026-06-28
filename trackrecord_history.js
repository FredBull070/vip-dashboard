/* BetLife365 - historical track record, backfilled 1:1 from the Discord posts
   (channels: daily-betting-cards + daily-parley-tips). Every position logged as
   Pending; it settles automatically once the verified sources have a real result.
   Stable schema, read-only history. Nothing deleted, nothing cherry-picked. */
window.TRACK_HISTORY = {
  imported_at: "2026-06-28",
  source: "Discord: BetLife365 #daily-betting-cards + #daily-parley-tips",
  note: "All Pending: official source (ESPN WK schedule) shows these fixtures as not-yet-played at import time.",
  parleys: [
    {id:"#5 Value 25-06",  date:"2026-06-25", sport:"Football", tier:"Value",   stake:0.75, odds:1.90, result:"Pending", legs:[
      {match:"Japan x Sweden", selection:"Over 2.5 goals"}]},
    {id:"#6 Jackpot 25-06", date:"2026-06-25", sport:"Football", tier:"Jackpot", stake:0.25, odds:6.00, result:"Pending", legs:[
      {match:"Paraguay x Australia", selection:"Over 2.5 goals"},
      {match:"Turkiye x United States", selection:"Draw"}]},
    {id:"#7 Safe 26-06",    date:"2026-06-26", sport:"Football", tier:"Safe",    stake:2.0,  odds:2.04, result:"Pending", legs:[
      {match:"Norway x France", selection:"France to win"},
      {match:"New Zealand x Belgium", selection:"Belgium to win"}]},
    {id:"#8 Value 26-06",   date:"2026-06-26", sport:"Football", tier:"Value",   stake:0.75, odds:3.14, result:"Pending", legs:[
      {match:"Uruguay x Spain", selection:"Spain to win"},
      {match:"Egypt x Iran", selection:"Over 2.5 goals"}]},
    {id:"#9 Jackpot 26-06", date:"2026-06-26", sport:"Football", tier:"Jackpot", stake:0.25, odds:8.00, result:"Pending", legs:[
      {match:"Norway x France", selection:"Over 2.5 goals"},
      {match:"Uruguay x Spain", selection:"Over 2.5 goals"},
      {match:"Cape Verde x Saudi Arabia", selection:"Saudi Arabia to win"}]},
    {id:"#10 Safe 27-06",   date:"2026-06-27", sport:"Football", tier:"Safe",    stake:2.0,  odds:2.13, result:"Pending", legs:[
      {match:"Panama x England", selection:"England to win"},
      {match:"Croatia x Ghana", selection:"Croatia to win"}]},
    {id:"#11 Value 27-06",  date:"2026-06-27", sport:"Football", tier:"Value",   stake:0.75, odds:4.41, result:"Pending", legs:[
      {match:"Colombia x Portugal", selection:"Portugal to win"},
      {match:"Algeria x Austria", selection:"Austria to win"}]},
    {id:"#12 Jackpot 27-06",date:"2026-06-27", sport:"Football", tier:"Jackpot", stake:0.25, odds:7.36, result:"Pending", legs:[
      {match:"DR Congo x Uzbekistan", selection:"DR Congo to win"},
      {match:"Jordan x Argentina", selection:"Argentina -3.5 (Asian handicap)"}]},
    {id:"#13 Safe 28-06",   date:"2026-06-28", sport:"Football", tier:"Safe",    stake:2.0,  odds:2.19, result:"Pending", legs:[
      {match:"Germany x Paraguay", selection:"Germany to win"},
      {match:"Brazil x Japan", selection:"Brazil to win"}]},
    {id:"#14 Value 28-06",  date:"2026-06-28", sport:"Football", tier:"Value",   stake:0.75, odds:3.40, result:"Pending", legs:[
      {match:"Netherlands x Morocco", selection:"Netherlands to win"},
      {match:"South Africa x Canada", selection:"Canada to win"}]},
    {id:"#15 Jackpot 28-06",date:"2026-06-28", sport:"Football", tier:"Jackpot", stake:0.25, odds:7.51, result:"Pending", legs:[
      {match:"Brazil x Japan", selection:"Over 2.5 goals"},
      {match:"Netherlands x Morocco", selection:"Both teams to score"},
      {match:"South Africa x Canada", selection:"Over 2.5 goals"},
      {match:"Germany x Paraguay", selection:"Over 1.5 goals"}]}
  ],
  cards: [
    // 27-06-2026
    {date:"2026-06-27", sport:"Football", tier:"Core",        stake:2.0,  odds:1.25, result:"Pending", match:"Panama x England",        market:"Match result", selection:"England to win"},
    {date:"2026-06-27", sport:"Football", tier:"Core",        stake:2.0,  odds:1.70, result:"Pending", match:"Croatia x Ghana",         market:"Match result", selection:"Croatia to win"},
    {date:"2026-06-27", sport:"Football", tier:"Core",        stake:1.5,  odds:1.25, result:"Pending", match:"Jordan x Argentina",      market:"Match result", selection:"Argentina to win"},
    {date:"2026-06-27", sport:"Tennis",   tier:"Core",        stake:2.0,  odds:1.30, result:"Pending", match:"Madison Keys x Tatjana Maria", market:"Match winner", selection:"Madison Keys (Eastbourne WTA Final)"},
    {date:"2026-06-27", sport:"Tennis",   tier:"Core",        stake:2.0,  odds:1.65, result:"Pending", match:"Naomi Osaka x Karolina Muchova", market:"Match winner", selection:"Naomi Osaka (Bad Homburg WTA Final)"},
    {date:"2026-06-27", sport:"Football", tier:"Value",       stake:1.0,  odds:2.05, result:"Pending", match:"Colombia x Portugal",     market:"Match result", selection:"Portugal to win"},
    {date:"2026-06-27", sport:"Football", tier:"Value",       stake:1.0,  odds:2.15, result:"Pending", match:"Algeria x Austria",       market:"Match result", selection:"Austria to win"},
    {date:"2026-06-27", sport:"Football", tier:"Value",       stake:1.0,  odds:1.70, result:"Pending", match:"Panama x England",        market:"Total goals", selection:"Over 2.5 goals"},
    {date:"2026-06-27", sport:"Football", tier:"Value",       stake:0.75, odds:2.00, result:"Pending", match:"Colombia x Portugal",     market:"Total goals", selection:"Over 2.5 goals"},
    {date:"2026-06-27", sport:"Tennis",   tier:"Value",       stake:0.75, odds:1.95, result:"Pending", match:"Ugo Humbert x Zizou Bergs", market:"Games handicap", selection:"Ugo Humbert -2.5 games (Eastbourne ATP Final)"},
    {date:"2026-06-27", sport:"Tennis",   tier:"Value",       stake:0.75, odds:1.57, result:"Pending", match:"Alejandro Davidovich Fokina x Ethan Quinn", market:"Match winner", selection:"Alejandro Davidovich Fokina (Mallorca ATP Final)"},
    {date:"2026-06-27", sport:"Football", tier:"Opportunity", stake:0.75, odds:2.30, result:"Pending", match:"DR Congo x Uzbekistan",   market:"Match result", selection:"DR Congo to win"},
    // 28-06-2026
    {date:"2026-06-28", sport:"Football", tier:"Core",        stake:1.0,  odds:1.36, result:"Pending", match:"Germany x Paraguay",      market:"Match result", selection:"Germany to win"},
    {date:"2026-06-28", sport:"Football", tier:"Core",        stake:1.0,  odds:1.69, result:"Pending", match:"Brazil x Japan",          market:"Match result", selection:"Brazil to win"},
    {date:"2026-06-28", sport:"Tennis",   tier:"Core",        stake:2.0,  odds:1.30, result:"Pending", match:"Madison Keys x Tatjana Maria", market:"Match winner", selection:"Madison Keys (Eastbourne WTA Final)", note:"also posted 27-06, verify not duplicate"},
    {date:"2026-06-28", sport:"Tennis",   tier:"Core",        stake:2.0,  odds:1.65, result:"Pending", match:"Naomi Osaka x Karolina Muchova", market:"Match winner", selection:"Naomi Osaka (Bad Homburg WTA Final)", note:"also posted 27-06, verify not duplicate"},
    {date:"2026-06-28", sport:"Football", tier:"Value",       stake:1.0,  odds:1.71, result:"Pending", match:"South Africa x Canada",   market:"Match result", selection:"Canada to win"},
    {date:"2026-06-28", sport:"Football", tier:"Value",       stake:0.75, odds:2.10, result:"Pending", match:"Netherlands x Morocco",   market:"Match result", selection:"Netherlands to win"},
    {date:"2026-06-28", sport:"Football", tier:"Value",       stake:0.5,  odds:1.85, result:"Pending", match:"Brazil x Japan",          market:"Total goals", selection:"Over 2.5 goals"},
    {date:"2026-06-28", sport:"Football", tier:"Value",       stake:0.75, odds:1.55, result:"Pending", match:"Germany x Paraguay",      market:"Asian handicap", selection:"Germany -1"},
    {date:"2026-06-28", sport:"Football", tier:"Value",       stake:0.5,  odds:1.95, result:"Pending", match:"South Africa x Canada",   market:"Total goals", selection:"Over 2.5 goals"},
    {date:"2026-06-28", sport:"Tennis",   tier:"Value",       stake:0.75, odds:1.95, result:"Pending", match:"Ugo Humbert x Zizou Bergs", market:"Games handicap", selection:"Ugo Humbert -2.5 games (Eastbourne ATP Final)", note:"also posted 27-06, verify not duplicate"},
    {date:"2026-06-28", sport:"Tennis",   tier:"Value",       stake:0.75, odds:1.57, result:"Pending", match:"Alejandro Davidovich Fokina x Ethan Quinn", market:"Match winner", selection:"Alejandro Davidovich Fokina (Mallorca ATP Final)", note:"also posted 27-06, verify not duplicate"},
    {date:"2026-06-28", sport:"Football", tier:"Opportunity", stake:0.25, odds:2.52, result:"Pending", match:"Netherlands x Morocco",   market:"To qualify", selection:"Morocco to qualify"}
  ]
};
