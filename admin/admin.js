/* Dumo admin dashboard prototype — in-memory sample data, hash routing.
   Routes: #/login #/overview #/reports #/reports/:id #/videos #/users #/users/:handle #/settings */
(function(){
  'use strict';
  var $ = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); };
  var money = function(n){ return 'R' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var short = function(n){ return n >= 1e6 ? (n/1e6).toFixed(1).replace(/\.0$/,'') + 'M' : n >= 1000 ? (n/1000).toFixed(1).replace(/\.0$/,'') + 'K' : String(n); };
  var int = function(n){ return n.toLocaleString('en-US'); };
  var mmss = function(s){ s = Math.max(0, Math.round(s)); return Math.floor(s/60) + ':' + String(s % 60).padStart(2, '0'); };
  var NOW = Date.now(), MIN = 60000;
  var ago = function(t){ var m = Math.round((Date.now() - t) / MIN); if (m < 1) return 'just now'; if (m < 60) return m + ' min ago'; var h = Math.round(m / 60); if (h < 24) return h + ' h ago'; return Math.round(h / 24) + ' d ago'; };
  var clock = function(t){ var d = new Date(t); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); };

  // ---------------- sample data ----------------
  var settings = { rpm: 3.50, giftShare: 70, coin: 0.10, minWatch: 3, excludeOwn: true, repeatWindow: 30, guidelines: 'v1.0', guidelinesDate: '1 Oct 2026' };

  var users = [
    { h:'thandi.moves', name:'Thandi Mokoena', role:'creator', age:'18+', status:'active', joined:'14 Sep 2026', place:'Soweto, Gauteng', lang:'isiZulu · English', followers:84200, strikes:0, col:'#2BB3A3', gifts:569.10, subs:144.00, phone:'+27 72 *** 1180' },
    { h:'kasi.kitchen', name:'Kagiso Dlamini', role:'creator', age:'18+', status:'active', joined:'14 Sep 2026', place:'Soweto, Gauteng', lang:'English', followers:31800, strikes:1, col:'#E4572E', gifts:212.40, subs:58.00, phone:'+27 83 *** 0921' },
    { h:'capetown.lens', name:'Pieter van Wyk', role:'creator', age:'18+', status:'active', joined:'15 Sep 2026', place:'Cape Town, Western Cape', lang:'Afrikaans · English', followers:12300, strikes:0, col:'#5B7BD6', gifts:88.20, subs:0, phone:'+27 61 *** 4410' },
    { h:'sipho.comedy', name:'Sipho Ndlovu', role:'creator', age:'18+', status:'active', joined:'16 Sep 2026', place:'Pretoria, Gauteng', lang:'Sesotho · English', followers:126500, strikes:0, col:'#B07CE8', gifts:1043.00, subs:261.00, phone:'+27 79 *** 3302' },
    { h:'lerato.beats', name:'Lerato Mokoena', role:'creator', age:'18+', status:'active', joined:'18 Sep 2026', place:'Bloemfontein, Free State', lang:'Sesotho · English', followers:22700, strikes:0, col:'#D9A21B', gifts:176.40, subs:29.00, phone:'+27 71 *** 7765' },
    { h:'durban.eats', name:'Ayanda Naidoo', role:'creator', age:'18+', status:'active', joined:'19 Sep 2026', place:'Durban, KwaZulu-Natal', lang:'English · isiZulu', followers:41100, strikes:0, col:'#1E7F72', gifts:302.75, subs:87.00, phone:'+27 82 *** 1090' },
    { h:'zola.styles', name:'Zola Mthembu', role:'creator', age:'13–17', status:'active', joined:'22 Sep 2026', place:'Durban, KwaZulu-Natal', lang:'isiZulu', followers:5400, strikes:0, col:'#C2477A', gifts:0, subs:0, phone:'+27 66 *** 2218' },
    { h:'xhosa.vibes', name:'Anele Qwabe', role:'creator', age:'18+', status:'suspended', joined:'20 Sep 2026', place:'Gqeberha, Eastern Cape', lang:'isiXhosa', followers:9800, strikes:2, col:'#8C6A3F', gifts:64.40, subs:0, phone:'+27 73 *** 5521', suspendedUntil:'16 Oct 2026' },
    { h:'bongani.fit', name:'Bongani Zulu', role:'creator', age:'18+', status:'active', joined:'25 Sep 2026', place:'Pietermaritzburg, KwaZulu-Natal', lang:'isiZulu · English', followers:7600, strikes:0, col:'#3D8BC9', gifts:41.30, subs:0, phone:'+27 64 *** 8810' },
    { h:'naledi.reads', name:'Naledi Khumalo', role:'viewer', age:'18+', status:'active', joined:'2 Oct 2026', place:'Johannesburg, Gauteng', lang:'English', followers:120, strikes:0, col:'#6E5BB0', gifts:0, subs:0, phone:'+27 60 *** 4471' },
    { h:'mpho_fan99', name:'Mpho Sithole', role:'viewer', age:'13–17', status:'active', joined:'4 Oct 2026', place:'Polokwane, Limpopo', lang:'Sepedi · English', followers:34, strikes:0, col:'#A0522D', gifts:0, subs:0, phone:'+27 76 *** 0034' },
    { h:'spamking.deals', name:'Easy Money SA', role:'viewer', age:'18+', status:'active', joined:'Today', place:'Unknown', lang:'English', followers:2, strikes:0, col:'#555', gifts:0, subs:0, phone:'+27 68 *** 9999' }
  ];
  var byHandle = function(h){ return users.filter(function(u){ return u.h === h; })[0]; };

  var videos = [
    { id:'V-2201', h:'thandi.moves', cap:'Teaching my gogo the new amapiano step. She killed it! #DumoChallenge', lang:'isiZulu', status:'live', views:212400, likes:48200, reports:1, posted:NOW - 3*24*60*MIN, col:'#3A2A1A', dur:'0:24' },
    { id:'V-2203', h:'kasi.kitchen', cap:'R50 kota challenge: how much can you get in Soweto? #Kasi', lang:'English', status:'live', views:98100, likes:12900, reports:0, posted:NOW - 2*24*60*MIN, col:'#1F3A2E', dur:'0:41' },
    { id:'V-2204', h:'capetown.lens', cap:'Sunrise over Lion\'s Head in 30 seconds #CapeTown', lang:'Afrikaans', status:'live', views:45300, likes:8300, reports:0, posted:NOW - 2*24*60*MIN, col:'#1C2A3F', dur:'0:30' },
    { id:'V-2205', h:'sipho.comedy', cap:'When your mom asks who finished the airtime #Mzansi', lang:'Sesotho', status:'live', views:1204000, likes:91400, reports:0, posted:NOW - 30*60*MIN, col:'#3B1F33', dur:'0:18' },
    { id:'V-2206', h:'lerato.beats', cap:'Made this beat on a R300 keyboard #Amapiano #DumoChallenge', lang:'English', status:'live', views:76200, likes:9100, reports:0, posted:NOW - 26*60*MIN, col:'#3A3014', dur:'0:52' },
    { id:'V-2207', h:'durban.eats', cap:'Best bunny chow in Durban? Ranking 5 spots #DurbanEats', lang:'English', status:'live', views:131900, likes:17600, reports:0, posted:NOW - 20*60*MIN, col:'#14332E', dur:'0:59' },
    { id:'V-2208', h:'sipho.comedy', cap:'Taxi rank etiquette, a documentary #Mzansi', lang:'English', status:'live', views:640500, likes:58800, reports:0, posted:NOW - 9*60*MIN, col:'#2E1830', dur:'0:33' },
    { id:'V-2209', h:'bongani.fit', cap:'5-minute stoep workout, no gym needed', lang:'isiZulu', status:'live', views:18400, likes:2200, reports:1, posted:NOW - 6*60*MIN, col:'#18283A', dur:'0:45' },
    { id:'V-2210', h:'thandi.moves', cap:'Part 2: my gogo does the Tshwala Bam step', lang:'isiZulu', status:'processing', views:0, likes:0, reports:0, posted:NOW - 4*MIN, col:'#3A2A1A', dur:'0:27' },
    { id:'V-2211', h:'xhosa.vibes', cap:'Umngqungqo in the township #isiXhosa', lang:'isiXhosa', status:'removed', views:22100, likes:1900, reports:3, posted:NOW - 4*24*60*MIN, col:'#33281A', dur:'0:38' },
    { id:'V-2212', h:'zola.styles', cap:'Get ready with me for school 💄 follow for more', lang:'isiZulu', status:'live', views:8700, likes:940, reports:1, posted:NOW - 5*60*MIN, col:'#3A1C2A', dur:'0:22' },
    { id:'V-2213', h:'durban.eats', cap:'Chip roll vs gatsby, who wins? #DurbanEats', lang:'English', status:'live', views:54300, likes:7300, reports:0, posted:NOW - 3*60*MIN, col:'#14332E', dur:'0:40' },
    { id:'V-2214', h:'xhosa.vibes', cap:'Wait for the end 😳 #fight', lang:'isiXhosa', status:'live', views:15900, likes:610, reports:2, posted:NOW - 2*60*MIN, col:'#2A1A14', dur:'0:15' },
    { id:'V-2215', h:'kasi.kitchen', cap:'Mogodu Monday, a love story #Kasi', lang:'English', status:'live', views:12800, likes:1400, reports:0, posted:NOW - 80*MIN, col:'#1F3A2E', dur:'0:48' },
    { id:'V-2216', h:'spamking.deals', cap:'MAKE R5000 A DAY 💰💰 WhatsApp me now, link in bio', lang:'English', status:'live', views:310, likes:4, reports:4, posted:NOW - 40*MIN, col:'#262626', dur:'0:12' },
    { id:'V-2217', h:'lerato.beats', cap:'Late night session, Sesotho lyrics this time', lang:'Sesotho', status:'processing', views:0, likes:0, reports:0, posted:NOW - 2*MIN, col:'#3A3014', dur:'0:57' }
  ];
  var byVideo = function(id){ return videos.filter(function(v){ return v.id === id; })[0]; };

  var REASONS = { nudity:'Nudity or sexual content', violence:'Violence or dangerous acts', hate:'Hate speech', harassment:'Harassment or bullying', spam:'Spam or scam', minor:'Minor safety', copyright:'Copyright', other:'Other' };
  var PRIORITY = { minor:'high', violence:'high', nudity:'high', hate:'medium', harassment:'medium', spam:'low', copyright:'low', other:'low' };

  var reports = [
    { id:'R-1042', type:'video', target:'V-2214', reason:'violence', reporter:'naledi.reads', note:'This looks like a real fight outside a school. One of the kids is on the ground and people are laughing.', created:NOW - 4*MIN, status:'open' },
    { id:'R-1043', type:'video', target:'V-2216', reason:'spam', reporter:'thandi.moves', note:'Same WhatsApp number is posted under all my videos too. It is a scam.', created:NOW - 9*MIN, status:'open' },
    { id:'R-1041', type:'video', target:'V-2212', reason:'minor', reporter:'mpho_fan99', note:'She is in my grade, she is 14. School uniform and the school name are showing.', created:NOW - 17*MIN, status:'open' },
    { id:'R-1040', type:'comment', target:'V-2201', comment:{ by:'xhosa.vibes', text:'Nobody wants to see your old gogo dance, delete this rubbish' }, reason:'harassment', reporter:'thandi.moves', note:'He keeps commenting on every video.', created:NOW - 35*MIN, status:'open' },
    { id:'R-1039', type:'user', target:'spamking.deals', reason:'spam', reporter:'kasi.kitchen', note:'Account was made today and only posts scam links.', created:NOW - 52*MIN, status:'open' },
    { id:'R-1038', type:'video', target:'V-2209', reason:'copyright', reporter:'lerato.beats', note:'The background song is my beat from my video V-2206, no credit given.', created:NOW - 3*60*MIN, status:'open' },
    { id:'R-1037', type:'video', target:'V-2214', reason:'other', reporter:'bongani.fit', note:'Not okay for kids to see.', created:NOW - 70*MIN, status:'open' },
    { id:'R-1036', type:'video', target:'V-2211', reason:'hate', reporter:'capetown.lens', note:'Slurs in the caption audio at 0:20.', created:NOW - 26*60*MIN, status:'actioned', action:'Video removed', secs:41, by:'BP Mhlanga', closed:NOW - 26*60*MIN + 41000 },
    { id:'R-1035', type:'video', target:'V-2205', reason:'other', reporter:'mpho_fan99', note:'Not funny', created:NOW - 30*60*MIN, status:'dismissed', action:'Dismissed — no rule broken', secs:22, by:'Nomsa Dube', closed:NOW - 30*60*MIN + 22000 },
    { id:'R-1034', type:'user', target:'xhosa.vibes', reason:'harassment', reporter:'durban.eats', note:'Sending insults in comments to many creators.', created:NOW - 2*24*60*MIN, status:'actioned', action:'Account suspended 7 days', secs:55, by:'Nomsa Dube', closed:NOW - 2*24*60*MIN + 55000 },
    { id:'R-1033', type:'comment', target:'V-2203', comment:{ by:'spamking.deals', text:'Earn R5000 daily, WhatsApp 068 *** 9999' }, reason:'spam', reporter:'kasi.kitchen', note:'', created:NOW - 3*24*60*MIN, status:'actioned', action:'Comment removed', secs:18, by:'BP Mhlanga', closed:NOW - 3*24*60*MIN + 18000 }
  ];
  reports.forEach(function(r){ r.priority = PRIORITY[r.reason]; });
  var byReport = function(id){ return reports.filter(function(r){ return r.id === id; })[0]; };

  var audit = [
    { ts:NOW - 26*60*MIN + 41000, who:'BP Mhlanga', text:'Removed video V-2211 (@xhosa.vibes) — Hate speech', ref:['R-1036','V-2211','xhosa.vibes'] },
    { ts:NOW - 30*60*MIN + 22000, who:'Nomsa Dube', text:'Dismissed report R-1035 — no rule broken', ref:['R-1035','V-2205','sipho.comedy'] },
    { ts:NOW - 2*24*60*MIN + 55000, who:'Nomsa Dube', text:'Suspended @xhosa.vibes for 7 days — Harassment', ref:['R-1034','xhosa.vibes'] },
    { ts:NOW - 3*24*60*MIN + 18000, who:'BP Mhlanga', text:'Removed comment by @spamking.deals on V-2203 — Spam', ref:['R-1033','V-2203','spamking.deals'] },
    { ts:NOW - 6*24*60*MIN, who:'BP Mhlanga', text:'Set rand per 1,000 qualified views to R3.50', ref:['settings'] }
  ];
  function log(text, ref){ audit.unshift({ ts: Date.now(), who: 'BP Mhlanga', text: text, ref: ref || [] }); }

  var uploads = [6, 9, 7, 12, 10, 14, 8, 11, 15, 13, 18, 16, 21]; // previous 13 days; today computed

  // ---------------- derived ----------------
  function vidsOf(h){ return videos.filter(function(v){ return v.h === h && v.status !== 'deleted'; }); }
  function wallet(u){
    if (u.role !== 'creator' || u.age !== '18+' || u.status === 'deleted') return { views: 0, gifts: 0, subs: 0, total: 0, q: 0 };
    var q = vidsOf(u.h).reduce(function(s, v){ return s + v.views; }, 0);
    var views = q / 1000 * settings.rpm, gifts = u.gifts * settings.giftShare / 100, subs = u.subs;
    return { views: views, gifts: gifts, subs: subs, total: views + gifts + subs, q: q };
  }
  function isToday(t){ return new Date(t).toDateString() === new Date().toDateString(); }
  function openReports(){ return reports.filter(function(r){ return r.status === 'open'; }); }
  function avgSecs(){ var c = reports.filter(function(r){ return r.secs != null; }); return c.length ? c.reduce(function(s, r){ return s + r.secs; }, 0) / c.length : 0; }
  function targetUser(r){ return r.type === 'user' ? byHandle(r.target) : r.type === 'comment' ? byHandle(r.comment.by) : byHandle((byVideo(r.target) || {}).h); }
  function targetLabel(r){
    if (r.type === 'user') return '@' + r.target;
    if (r.type === 'comment') return 'Comment by @' + r.comment.by + ' on ' + r.target;
    var v = byVideo(r.target); return r.target + ' · @' + v.h;
  }
  function av(u, cls){ var ini = u.name.split(' ').map(function(p){ return p[0]; }).join('').slice(0, 2).toUpperCase(); return '<span class="av' + (cls ? ' ' + cls : '') + '" style="background:' + u.col + '" aria-hidden="true">' + esc(ini) + '</span>'; }
  function st(s, label){ return '<span class="st ' + s + '">' + esc(label || (s.charAt(0).toUpperCase() + s.slice(1))) + '</span>'; }

  // ---------------- shell ----------------
  var ICONS = {
    overview:'<path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z"/>',
    reports:'<path d="M4 22V4M4 4h13l-2 4 2 4H4"/>',
    videos:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M10 9l5 3-5 3z"/>',
    users:'<circle cx="9" cy="8" r="4"/><path d="M2 21c1-4 4-6 7-6s6 2 7 6M16 4a4 4 0 0 1 0 8M22 21c-.5-3-2-5-4-6"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'
  };
  var NAV = [['overview','Overview'],['reports','Reports'],['videos','Videos'],['users','Users'],['settings','Settings']];
  function drawNav(section){
    $('#nav').innerHTML = NAV.map(function(n){
      var c = n[0] === 'reports' ? '<span class="count" aria-label="' + openReports().length + ' open">' + openReports().length + '</span>' : '';
      return '<a href="#/' + n[0] + '"' + (section === n[0] ? ' aria-current="page"' : '') + '><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[n[0]] + '</svg>' + n[1] + c + '</a>';
    }).join('');
  }
  $('#menuBtn').onclick = function(){ var s = $('#side'); var o = !s.classList.contains('open'); s.classList.toggle('open', o); this.setAttribute('aria-expanded', o); };

  // ---------------- modal / toast / tooltip ----------------
  var lastFocus = null;
  function modal(o){
    closeModal(); lastFocus = document.activeElement;
    var s = document.createElement('div'); s.className = 'scrim'; s.id = 'scrim';
    s.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle"><h2 id="mTitle">' + esc(o.title) + '</h2>' + (o.text ? '<p>' + o.text + '</p>' : '') + (o.body || '') +
      '<p class="err" id="mErr" style="color:var(--danger);font-weight:600" hidden></p>' +
      '<div class="row"><button class="btn" data-m="cancel">Cancel</button><button class="btn ' + (o.danger ? 'danger' : 'primary') + '" data-m="ok">' + esc(o.ok || 'Confirm') + '</button></div></div>';
    document.body.appendChild(s);
    s.addEventListener('mousedown', function(e){ if (e.target === s) closeModal(); });
    $('[data-m=cancel]', s).onclick = closeModal;
    $('[data-m=ok]', s).onclick = function(){
      var err = o.onOk ? o.onOk(s) : null;
      if (typeof err === 'string'){ var e = $('#mErr', s); e.textContent = err; e.hidden = false; return; }
      closeModal();
    };
    s.addEventListener('keydown', function(e){
      if (e.key === 'Escape'){ e.stopPropagation(); closeModal(); }
      if (e.key === 'Tab'){ var f = $$('button,input,select,textarea', s).filter(function(x){ return !x.disabled; }); var a = f[0], z = f[f.length-1];
        if (e.shiftKey && document.activeElement === a){ e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z){ e.preventDefault(); a.focus(); } }
    });
    (($('input,select,textarea', s)) || $('[data-m=ok]', s)).focus();
  }
  function closeModal(){ var s = $('#scrim'); if (s){ s.remove(); if (lastFocus && lastFocus.focus) lastFocus.focus(); } }
  var toastT;
  function toast(m){ var t = $('.toast') || document.body.appendChild(Object.assign(document.createElement('div'), { className: 'toast' })); t.setAttribute('role', 'status'); t.textContent = m; clearTimeout(toastT); toastT = setTimeout(function(){ t.remove(); }, 3600); }
  var tip = null;
  function showTip(e, text){ if (!tip){ tip = document.createElement('div'); tip.className = 'tip'; document.body.appendChild(tip); } tip.textContent = text; var r = e.target.getBoundingClientRect(); tip.style.left = Math.min(innerWidth - 160, r.left + r.width/2 - 50) + 'px'; tip.style.top = (r.top - 36) + 'px'; }
  function hideTip(){ if (tip){ tip.remove(); tip = null; } }

  // ---------------- router ----------------
  var route = 'overview', human = 'Overview', ticker = null;
  var ui = { rStatus:'open', rType:'all', rReason:'all', vq:'', vStatus:'all', vView:'grid', uq:'', uRole:'all', uStatus:'all', calcViews:10000, calcGifts:50 };
  var opened = {}; // report id -> time detail was first opened (for time-to-action)

  function navigate(key){ var k = String(key || '').replace(/^#?\/?/, ''); if (location.hash !== '#/' + k) location.hash = '#/' + k; else render(); }
  window.dumoReviewContext = function(){ return { key: '#/' + route, label: 'Admin › ' + human }; };
  window.dumoReviewGoto = navigate;

  function render(){
    clearInterval(ticker); hideTip();
    route = (location.hash.replace(/^#\/?/, '') || 'overview');
    var parts = route.split('/'); var sec = parts[0], id = parts[1] ? decodeURIComponent(parts[1]) : null;
    var main = $('#main');
    $('#shell').classList.toggle('bare', sec === 'login');
    $('#side').classList.remove('open'); $('#menuBtn').setAttribute('aria-expanded', 'false');
    var views = { login: vLogin, overview: vOverview, reports: id ? vReport : vReports, videos: vVideos, users: id ? vUser : vUsers, settings: vSettings };
    if (!views[sec]){ route = 'overview'; sec = 'overview'; }
    if (sec === 'login') main.innerHTML = '';
    var out = views[sec](id);
    human = out.title;
    main.innerHTML = out.html;
    drawNav(sec);
    document.title = out.title + ' · Dumo Admin';
    if (out.after) out.after(main);
    document.dispatchEvent(new Event('dumo:screen'));
  }
  addEventListener('hashchange', function(){ render(); scrollTo(0, 0); $('#main').focus({ preventScroll: true }); });
  $('#logout').addEventListener('click', function(e){ e.preventDefault(); navigate('login'); });

  function head(title, sub, right, crumb){
    return (crumb ? '<div class="crumb">' + crumb + '</div>' : '') + '<div class="ph"><div><h1>' + title + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + (right || '') + '</div>';
  }

  // ---------------- views ----------------
  function vLogin(){
    var step = 1;
    return { title: 'Log in', html:
      '<div class="login" data-review-anchor="admin-login"><form class="card" id="loginForm" novalidate>' +
      '<img src="../assets/dumo-logo-light.png" alt="dumo — The Fame" style="display:block">' +
      '<div><h1 style="font-size:26px">Admin log in</h1><p style="margin:4px 0 0;color:var(--muted)">Moderation and pilot settings for Dumo.</p></div>' +
      '<div id="step1" style="display:flex;flex-direction:column;gap:14px"><label class="f">Work email<input type="email" id="lEmail" value="bp.mhlanga@dumothefame.com" autocomplete="username" required></label>' +
      '<label class="f">Password<input type="password" id="lPass" value="prototype-pass" autocomplete="current-password" required></label></div>' +
      '<div id="step2" hidden style="display:flex;flex-direction:column;gap:10px"><span class="f" style="font-size:13px;font-weight:700;color:var(--muted)">6-digit code from your authenticator app</span><div class="otp" role="group" aria-label="6-digit code">' +
      [1,2,3,4,5,6].map(function(i){ return '<input inputmode="numeric" maxlength="1" aria-label="Digit ' + i + '" value="' + '481203'[i-1] + '">'; }).join('') + '</div></div>' +
      '<button class="btn primary" type="submit" id="lBtn" style="width:100%">Continue</button>' +
      '<p class="note" style="margin:0">Admin accounts are created by Dumo The Fame only. Every log-in needs a 2-step code.</p></form></div>',
      after: function(m){
        $('#loginForm', m).addEventListener('submit', function(e){
          e.preventDefault();
          if (step === 1){ step = 2; $('#step1').hidden = true; $('#step2').hidden = false; $('#step2').style.display = 'flex'; $('#lBtn').textContent = 'Log in'; $('.otp input').focus(); document.dispatchEvent(new Event('dumo:screen')); }
          else { toast('Welcome back, BP'); navigate('overview'); }
        });
        $$('.otp input', m).forEach(function(inp, i, all){ inp.addEventListener('input', function(){ if (inp.value && all[i+1]) all[i+1].focus(); }); });
      } };
  }

  function vOverview(){
    var creators = users.filter(function(u){ return u.role === 'creator' && u.status !== 'deleted'; }).length + 62; // + pilot creators not shown in sample
    var today = videos.filter(function(v){ return isToday(v.posted) && v.status !== 'deleted'; }).length;
    var open = openReports(), avg = avgSecs();
    var liability = users.reduce(function(s, u){ return s + wallet(u).total; }, 0);
    var oldest = open.reduce(function(m, r){ return Math.min(m, r.created); }, Date.now());
    var kpi = function(l, b, s){ return '<div class="kpi"><span>' + l + '</span><b>' + b + '</b>' + (s || '') + '</div>'; };
    var attn = open.slice().sort(function(a, b){ return ({high:0,medium:1,low:2})[a.priority] - ({high:0,medium:1,low:2})[b.priority] || a.created - b.created; }).slice(0, 4).map(function(r){
      return '<li><a href="#/reports/' + r.id + '"><span class="dot" style="background:' + (r.priority === 'high' ? 'var(--danger)' : r.priority === 'medium' ? 'var(--amber)' : 'var(--muted)') + '"></span><span style="flex:1;min-width:0"><b>' + esc(REASONS[r.reason]) + '</b> · ' + esc(targetLabel(r)) + '<small>' + r.id + ' · reported ' + ago(r.created) + ' · ' + r.priority + ' priority</small></span></a></li>';
    });
    var proc = videos.filter(function(v){ return v.status === 'processing'; });
    proc.forEach(function(v){ attn.push('<li><a href="#/videos"><span class="dot" style="background:var(--info)"></span><span><b>Processing</b> · ' + v.id + ' by @' + v.h + '<small>Uploaded ' + ago(v.posted) + ' · adaptive stream + Data Saver stream being made</small></span></a></li>'); });
    var teen = users.filter(function(u){ return u.role === 'creator' && u.age === '13–17' && u.status === 'active'; });
    teen.forEach(function(u){ attn.push('<li><a href="#/users/' + u.h + '"><span class="dot" style="background:var(--info)"></span><span><b>Under-18 creator</b> · @' + u.h + '<small>Can post, cannot earn. Earnings switch is locked until 18.</small></span></a></li>'); });

    return { title: 'Overview', html:
      head('Good morning, BP', 'Pilot health for ' + new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' }) + '.', '<span class="chip amber">Pilot · test money</span>') +
      '<div class="kpis">' +
        kpi('Pilot creators', creators + '<span style="font-size:16px;color:var(--muted)"> / 100</span>', '<div class="meter" role="img" aria-label="' + creators + ' of 100"><i style="width:' + creators + '%"></i></div>') +
        kpi('Daily active users', '1,284', '<small><span class="good">▲ 8%</span> vs last week</small>') +
        kpi('Videos posted today', today, '<small>' + proc.length + ' still processing</small>') +
        kpi('Open reports', open.length, '<small>Oldest: ' + (open.length ? ago(oldest) : '—') + '</small>') +
        kpi('Avg time to action', mmss(avg), '<small>Target under 1:00 · <span class="' + (avg <= 60 ? 'good' : 'bad') + '">' + (avg <= 60 ? 'on target' : 'over target') + '</span></small>') +
        kpi('Test-money owed', money(liability), '<small>Across creator wallets · not real money</small>') +
      '</div>' +
      '<div class="grid2"><section class="card"><h2>Uploads per day</h2><p class="sub">Videos posted in the last 14 days</p><div class="chart" id="chart"></div></section>' +
      '<section class="card"><h2>Needs attention</h2><p class="sub">Highest priority first</p><ul class="attn">' + (attn.join('') || '<li class="empty">All clear.</li>') + '</ul></section></div>',
      after: function(){ drawChart(today); } };
  }

  function drawChart(today){
    var data = uploads.concat([today]);
    var days = data.map(function(_, i){ var d = new Date(); d.setDate(d.getDate() - (data.length - 1 - i)); return d; });
    var W = 640, H = 240, L = 30, B = 26, T = 18, max = Math.ceil(Math.max.apply(null, data) / 5) * 5;
    var bw = (W - L) / data.length, gap = 6;
    var y = function(v){ return T + (H - T - B) * (1 - v / max); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Bar chart of videos posted per day for the last 14 days. Today: ' + today + '.">';
    for (var g = 0; g <= max; g += max / 5) s += '<line class="grid" x1="' + L + '" x2="' + W + '" y1="' + y(g) + '" y2="' + y(g) + '"/><text class="axis" x="' + (L - 6) + '" y="' + (y(g) + 4) + '" text-anchor="end">' + g + '</text>';
    var peak = data.indexOf(Math.max.apply(null, data));
    data.forEach(function(v, i){
      var x = L + i * bw + gap / 2, w = bw - gap, top = y(v), h = Math.max(0, y(0) - top), r = Math.min(4, w / 2, h);
      var lbl = days[i].toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' }) + ': ' + v + ' videos';
      s += '<rect class="hit" x="' + (L + i * bw) + '" y="' + T + '" width="' + bw + '" height="' + (H - T - B) + '" fill="transparent" tabindex="0" aria-label="' + lbl + '" data-tip="' + lbl + '"/>';
      s += '<path class="bar' + (i === data.length - 1 ? ' today' : '') + '" d="M' + x + ',' + y(0) + 'V' + (top + r) + 'q0,-' + r + ' ' + r + ',-' + r + 'h' + (w - 2*r) + 'q' + r + ',0 ' + r + ',' + r + 'V' + y(0) + 'z" pointer-events="none"/>';
      if (i === data.length - 1 || i === peak) s += '<text class="lbl" x="' + (x + w/2) + '" y="' + (top - 6) + '" text-anchor="middle">' + v + '</text>';
      if (i % 2 === 1 || i === data.length - 1) s += '<text class="axis" x="' + (x + w/2) + '" y="' + (H - 6) + '" text-anchor="middle">' + (i === data.length - 1 ? 'Today' : days[i].getDate()) + '</text>';
    });
    s += '<line x1="' + L + '" x2="' + W + '" y1="' + y(0) + '" y2="' + y(0) + '" stroke="var(--muted)" stroke-width="1"/></svg>';
    s += '<details class="tbl"><summary>Show as table</summary><div class="table-wrap" style="margin-top:8px"><table><thead><tr><th>Day</th><th class="num">Videos</th></tr></thead><tbody>' +
      data.map(function(v, i){ return '<tr><td>' + days[i].toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' }) + '</td><td class="num">' + v + '</td></tr>'; }).join('') + '</tbody></table></div></details>';
    var c = $('#chart'); c.innerHTML = s;
    $$('.hit', c).forEach(function(h){ ['mouseenter','focus'].forEach(function(ev){ h.addEventListener(ev, function(e){ showTip(e, h.dataset.tip); }); }); ['mouseleave','blur'].forEach(function(ev){ h.addEventListener(ev, hideTip); }); });
  }

  function vReports(){
    var counts = { open:0, actioned:0, dismissed:0 }; reports.forEach(function(r){ counts[r.status]++; });
    var list = reports.filter(function(r){ return r.status === ui.rStatus && (ui.rType === 'all' || r.type === ui.rType) && (ui.rReason === 'all' || r.reason === ui.rReason); });
    list.sort(function(a, b){ return ui.rStatus === 'open' ? (({high:0,medium:1,low:2})[a.priority] - ({high:0,medium:1,low:2})[b.priority] || a.created - b.created) : b.created - a.created; });
    var rows = list.map(function(r){
      var u = targetUser(r);
      return '<tr data-go="reports/' + r.id + '" tabindex="0"><td><b>' + r.id + '</b></td><td>' + st(r.status === 'open' ? r.priority : r.status, r.status === 'open' ? r.priority.charAt(0).toUpperCase() + r.priority.slice(1) : null) + '</td><td>' + esc(REASONS[r.reason]) + '</td><td style="text-transform:capitalize">' + r.type + '</td>' +
        '<td class="wrap"><span class="handle">' + (u ? av(u) : '') + '<span>' + esc(targetLabel(r)) + '</span></span></td><td>@' + esc(r.reporter) + '</td><td>' + (r.status === 'open' ? ago(r.created) : esc(r.action) + ' · ' + mmss(r.secs)) + '</td></tr>';
    }).join('');
    var opt = function(v, l, cur){ return '<option value="' + v + '"' + (cur === v ? ' selected' : '') + '>' + l + '</option>'; };
    return { title: 'Reports', html:
      head('Reports', 'Every report from the app lands here. Target: action within 1 minute of opening.') +
      '<div class="toolbar"><div class="seg" role="group" aria-label="Status">' + ['open','actioned','dismissed'].map(function(s){ return '<button data-s="' + s + '" aria-pressed="' + (ui.rStatus === s) + '">' + s.charAt(0).toUpperCase() + s.slice(1) + '<span class="n">' + counts[s] + '</span></button>'; }).join('') + '</div>' +
      '<label class="sr" style="display:contents"><span style="position:absolute;left:-9999px">Type</span><select id="rType">' + opt('all','All types',ui.rType) + opt('video','Videos',ui.rType) + opt('user','Users',ui.rType) + opt('comment','Comments',ui.rType) + '</select></label>' +
      '<label style="display:contents"><span style="position:absolute;left:-9999px">Reason</span><select id="rReason">' + opt('all','All reasons',ui.rReason) + Object.keys(REASONS).map(function(k){ return opt(k, REASONS[k], ui.rReason); }).join('') + '</select></label></div>' +
      (list.length ? '<div class="table-wrap"><table class="t"><thead><tr><th>ID</th><th>' + (ui.rStatus === 'open' ? 'Priority' : 'Status') + '</th><th>Reason</th><th>Type</th><th>Reported content</th><th>Reported by</th><th>' + (ui.rStatus === 'open' ? 'Waiting' : 'Outcome · time') + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
        : '<div class="card empty"><b style="font-size:18px;color:var(--fg)">Nothing here</b><br>' + (ui.rStatus === 'open' ? 'No open reports match these filters. Nice work.' : 'No reports match these filters.') + '</div>'),
      after: function(m){
        $$('.seg button', m).forEach(function(b){ b.onclick = function(){ ui.rStatus = b.dataset.s; render(); }; });
        $('#rType', m).onchange = function(){ ui.rType = this.value; render(); };
        $('#rReason', m).onchange = function(){ ui.rReason = this.value; render(); };
        rowLinks(m);
      } };
  }
  function rowLinks(m){ $$('tr[data-go]', m).forEach(function(tr){ tr.onclick = function(e){ if (e.target.closest('button,a')) return; navigate(tr.dataset.go); }; tr.onkeydown = function(e){ if (e.key === 'Enter') navigate(tr.dataset.go); }; }); }

  function videoBox(v, extra){
    var gone = v.status === 'removed' || v.status === 'deleted';
    return '<div class="video9' + (gone ? ' gone' : '') + '" style="background:linear-gradient(160deg,' + v.col + ',#0B0906)">' + (gone ? '<span class="removed-tag">' + (v.status === 'deleted' ? 'Deleted' : 'Removed') + '</span>' : '') +
      '<span class="ph9">' + (v.status === 'processing' ? 'Processing…' : '[Video preview] ' + v.dur) + '</span><span class="shade"></span>' + (extra || '<b>@' + esc(v.h) + '</b><p>' + esc(v.cap) + '</p>') + '</div>';
  }

  function vReport(id){
    var r = byReport(id);
    if (!r) return { title: 'Report not found', html: head('Report not found', '', '', '<a href="#/reports">← Reports</a>') };
    if (r.status === 'open' && !opened[r.id]) opened[r.id] = Date.now();
    var u = targetUser(r), v = r.type !== 'user' ? byVideo(r.target) : null, rep = byHandle(r.reporter);
    var prior = reports.filter(function(x){ var tu = targetUser(x); return x.id !== r.id && tu && u && tu.h === u.h && x.status === 'actioned'; }).length;
    var preview;
    if (r.type === 'video') preview = videoBox(v);
    else if (r.type === 'comment') preview = videoBox(v, '<div style="position:relative;background:rgba(0,0,0,.6);border-radius:12px;padding:10px;border:2px solid var(--amber)"><b style="font-size:12px">@' + esc(r.comment.by) + '</b><p style="margin:2px 0 0;font-size:13px">' + esc(r.comment.text) + '</p></div>');
    else preview = '<div class="card" style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px">' + av(u, 'lg') + '<b>' + esc(u.name) + '</b><span style="color:var(--muted);font-size:13px">@' + u.h + ' · joined ' + esc(u.joined) + '</span><span style="font-size:13px">' + vidsOf(u.h).length + ' videos · ' + int(u.followers) + ' followers</span></div>';
    var isOpen = r.status === 'open';
    var actions = isOpen ? '<div class="actions">' +
        (r.type === 'video' ? '<button class="btn danger" data-act="remove">Remove video</button>' : '') +
        (r.type === 'comment' ? '<button class="btn danger" data-act="remove">Remove comment</button>' : '') +
        '<button class="btn" data-act="warn">Warn @' + esc(u.h) + '</button>' +
        '<button class="btn ghost-danger" data-act="suspend"' + (u.status === 'suspended' ? ' disabled' : '') + '>' + (u.status === 'suspended' ? 'Already suspended' : 'Suspend account') + '</button>' +
        '<button class="btn" data-act="dismiss">Dismiss — no rule broken</button></div>' +
        '<div class="timer" id="timer" aria-live="off"><span style="flex:1">Open on your screen for</span><b id="tval">0:00</b></div>'
      : '<div class="result' + (r.secs > 60 ? ' over' : '') + '">' + esc(r.action) + ' by ' + esc(r.by) + '<br><span style="font-weight:500">Actioned in ' + mmss(r.secs) + (r.secs <= 60 ? ' — within the 1-minute target' : ' — over the 1-minute target') + '</span></div>';
    var related = audit.filter(function(a){ return a.ref.indexOf(r.id) > -1 || (v && a.ref.indexOf(v.id) > -1) || (u && a.ref.indexOf(u.h) > -1); });
    return { title: 'Report ' + r.id, html:
      head(esc(REASONS[r.reason]) + ' · ' + r.id, 'Reported ' + ago(r.created) + ' (' + clock(r.created) + ') · ' + r.type + ' report', st(isOpen ? r.priority : r.status, isOpen ? r.priority.charAt(0).toUpperCase() + r.priority.slice(1) + ' priority' : null), '<a href="#/reports">← Reports</a>') +
      '<div class="detail"><div>' + preview + '</div>' +
      '<div style="display:flex;flex-direction:column;gap:16px;min-width:0">' +
        '<section class="card"><h2>What was reported</h2><p class="sub">Reported by <a href="#/users/' + r.reporter + '">@' + esc(r.reporter) + '</a> · ' + esc(rep ? rep.name : '') + '</p>' +
        (r.note ? '<div class="note">“' + esc(r.note) + '”</div>' : '<p class="sub">No note added.</p>') +
        (v ? '<dl class="kv" style="margin-top:14px"><dt>Video</dt><dd>' + v.id + ' · ' + v.dur + ' · ' + esc(v.lang) + '</dd><dt>Caption</dt><dd>' + esc(v.cap) + '</dd><dt>Status</dt><dd>' + st(v.status) + '</dd><dt>Reach</dt><dd>' + int(v.views) + ' qualified views · ' + int(v.likes) + ' likes</dd><dt>All reports</dt><dd>' + reports.filter(function(x){ return x.target === v.id; }).length + ' on this video</dd></dl>' : '') + '</section>' +
        '<section class="card"><h2>Creator</h2><div class="handle" style="margin:8px 0 12px">' + av(u) + '<a href="#/users/' + u.h + '">@' + esc(u.h) + '</a> ' + st(u.status) + '</div>' +
        '<dl class="kv"><dt>Name</dt><dd>' + esc(u.name) + '</dd><dt>Location</dt><dd>' + esc(u.place) + '</dd><dt>Age band</dt><dd>' + u.age + (u.age === '13–17' ? ' · cannot earn' : '') + '</dd><dt>Strikes</dt><dd>' + u.strikes + ' warning' + (u.strikes === 1 ? '' : 's') + ' · ' + prior + ' prior action' + (prior === 1 ? '' : 's') + '</dd><dt>Joined</dt><dd>' + esc(u.joined) + '</dd></dl></section>' +
      '</div>' +
      '<div class="col3" style="display:flex;flex-direction:column;gap:12px"><section class="card" style="display:flex;flex-direction:column;gap:12px"><h2>Action</h2>' + actions + '</section>' +
      '<section class="card"><h2>Audit log</h2><p class="sub">Everything done to this content or account</p><ul class="log">' +
        (related.map(function(a){ return '<li><time>' + clock(a.ts) + '</time><span><b>' + esc(a.who) + '</b> · ' + esc(a.text) + '</span></li>'; }).join('') || '<li><span class="sub">No actions yet.</span></li>') + '</ul></section></div></div>',
      after: function(m){
        if (isOpen){
          var tick = function(){ var s = (Date.now() - opened[r.id]) / 1000; var t = $('#tval'); if (!t) return; t.textContent = mmss(s); $('#timer').classList.toggle('over', s > 60); };
          tick(); ticker = setInterval(tick, 1000);
          $$('[data-act]', m).forEach(function(b){ b.onclick = function(){ act(r, b.dataset.act); }; });
        }
      } };
  }

  function closeReport(r, action){
    var secs = Math.round((Date.now() - (opened[r.id] || Date.now())) / 1000);
    var sameTarget = reports.filter(function(x){ return x.status === 'open' && x.target === r.target && x.type === r.type; });
    sameTarget.forEach(function(x){ x.status = action.indexOf('Dismissed') === 0 ? 'dismissed' : 'actioned'; x.action = action; x.secs = x === r ? secs : secs; x.by = 'BP Mhlanga'; x.closed = Date.now(); });
    var extra = sameTarget.length > 1 ? ' (+' + (sameTarget.length - 1) + ' duplicate report' + (sameTarget.length > 2 ? 's' : '') + ' closed)' : '';
    toast(action + extra + ' · Actioned in ' + mmss(secs) + (secs <= 60 ? ' — within the 1-minute target' : ' — over the 1-minute target'));
    render();
  }
  function act(r, a){
    var u = targetUser(r), v = byVideo(r.target);
    var reasonSel = '<label class="f">Rule broken<select id="mReason">' + Object.keys(REASONS).map(function(k){ return '<option value="' + k + '"' + (k === r.reason ? ' selected' : '') + '>' + REASONS[k] + '</option>'; }).join('') + '</select></label>';
    if (a === 'remove'){
      var what = r.type === 'comment' ? 'comment' : 'video';
      modal({ title: 'Remove this ' + what + '?', text: (r.type === 'comment' ? 'The comment by @' + esc(r.comment.by) : esc(v.id) + ' by @' + esc(v.h)) + ' disappears from Dumo straight away. The creator is told which rule it broke and can appeal.', body: reasonSel, ok: 'Remove ' + what, danger: true, onOk: function(s){
        var why = REASONS[$('#mReason', s).value];
        if (r.type === 'video'){ v.status = 'removed'; log('Removed video ' + v.id + ' (@' + v.h + ') — ' + why, [r.id, v.id, v.h]); }
        else log('Removed comment by @' + r.comment.by + ' on ' + r.target + ' — ' + why, [r.id, r.target, r.comment.by]);
        closeReport(r, what === 'video' ? 'Video removed' : 'Comment removed');
      } });
    }
    if (a === 'warn'){
      modal({ title: 'Warn @' + u.h + '?', text: 'They get an in-app notice. 3 warnings in 90 days means an automatic 7-day suspension.', body: reasonSel + '<label class="f">Message to creator (optional)<textarea id="mMsg" placeholder="e.g. Please don\'t post fights, even as a joke."></textarea></label>', ok: 'Send warning', onOk: function(s){
        u.strikes++; log('Warned @' + u.h + ' — ' + REASONS[$('#mReason', s).value] + ($('#mMsg', s).value.trim() ? ': “' + $('#mMsg', s).value.trim() + '”' : ''), [r.id, u.h, r.target]);
        closeReport(r, 'Creator warned');
      } });
    }
    if (a === 'suspend') suspendModal(u, function(label){ log('Suspended @' + u.h + ' ' + label, [r.id, u.h]); closeReport(r, 'Account suspended ' + label); }, reasonSel);
    if (a === 'dismiss'){
      modal({ title: 'Dismiss this report?', text: 'The content stays up. @' + esc(r.reporter) + ' is told it was reviewed and does not break the community guidelines.', ok: 'Dismiss report', onOk: function(){
        log('Dismissed report ' + r.id + ' — no rule broken', [r.id, r.target]); closeReport(r, 'Dismissed — no rule broken');
      } });
    }
  }
  function suspendModal(u, done, reasonSel){
    modal({ title: 'Suspend @' + u.h + '?', text: 'They are logged out, cannot post, comment or earn, and their videos are hidden until the suspension ends.',
      body: '<fieldset style="border:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px"><legend class="f" style="font-size:13px;font-weight:700;color:var(--muted);margin-bottom:6px">How long</legend><div class="radio-row">' +
        [['24h','24 hours'],['7d','7 days'],['perm','Permanent']].map(function(o, i){ return '<label><input type="radio" name="dur" value="' + o[0] + '"' + (i === 1 ? ' checked' : '') + '>' + o[1] + '</label>'; }).join('') + '</div></fieldset>' +
        (reasonSel || '<label class="f">Reason<select id="mReason">' + Object.keys(REASONS).map(function(k){ return '<option value="' + k + '">' + REASONS[k] + '</option>'; }).join('') + '</select></label>'),
      ok: 'Suspend account', danger: true, onOk: function(s){
        var d = $('input[name=dur]:checked', s).value; var label = { '24h':'for 24 hours', '7d':'for 7 days', 'perm':'permanently' }[d];
        u.status = 'suspended'; u.suspendedUntil = d === 'perm' ? 'Permanent' : (function(){ var t = new Date(); t.setDate(t.getDate() + (d === '24h' ? 1 : 7)); return t.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }); })();
        done(label + ' — ' + REASONS[$('#mReason', s).value]);
      } });
  }

  function vVideos(){
    var q = ui.vq.trim().toLowerCase().replace(/^@/, '');
    var list = videos.filter(function(v){ return v.status !== 'deleted' && (ui.vStatus === 'all' || v.status === ui.vStatus) && (!q || v.h.indexOf(q) > -1 || v.cap.toLowerCase().indexOf(q) > -1 || v.id.toLowerCase().indexOf(q) > -1); });
    list.sort(function(a, b){ return b.posted - a.posted; });
    var cnt = function(s){ return videos.filter(function(v){ return v.status !== 'deleted' && (s === 'all' || v.status === s); }).length; };
    var btn = function(v){ return v.status === 'removed' ? '<button class="btn sm" data-restore="' + v.id + '">Restore</button>' : v.status === 'live' ? '<button class="btn sm ghost-danger" data-remove="' + v.id + '">Remove</button>' : '<span class="sub" style="font-size:12px;color:var(--muted)">Making streams…</span>'; };
    var body;
    if (!list.length) body = '<div class="card empty"><b style="font-size:18px;color:var(--fg)">No videos found</b><br>Try a handle like @sipho.comedy or a hashtag like #Mzansi.</div>';
    else if (ui.vView === 'grid') body = '<div class="vgrid">' + list.map(function(v){
      return '<article class="vcard">' + videoBox(v, '<b>@' + esc(v.h) + '</b>') + '<div class="body"><div style="display:flex;justify-content:space-between;gap:6px;align-items:center"><b>' + v.id + '</b>' + st(v.status) + '</div><span style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + esc(v.cap) + '</span>' +
        '<div class="stats"><span><b>' + short(v.views) + '</b> views</span><span><b>' + short(v.likes) + '</b> likes</span><span' + (v.reports ? ' style="color:var(--danger)"' : '') + '><b style="color:inherit">' + v.reports + '</b> reports</span></div><div style="display:flex;gap:6px;align-items:center;justify-content:space-between"><span style="font-size:12px;color:var(--muted)">' + ago(v.posted) + '</span>' + btn(v) + '</div></div></article>';
    }).join('') + '</div>';
    else body = '<div class="table-wrap"><table class="t"><thead><tr><th>Video</th><th>Creator</th><th>Caption</th><th>Status</th><th class="num">Qualified views</th><th class="num">Likes</th><th class="num">Reports</th><th>Posted</th><th></th></tr></thead><tbody>' + list.map(function(v){
      return '<tr data-go="users/' + v.h + '" tabindex="0"><td><b>' + v.id + '</b></td><td>@' + esc(v.h) + '</td><td class="wrap">' + esc(v.cap) + '</td><td>' + st(v.status) + '</td><td class="num">' + int(v.views) + '</td><td class="num">' + int(v.likes) + '</td><td class="num">' + v.reports + '</td><td>' + ago(v.posted) + '</td><td>' + btn(v) + '</td></tr>';
    }).join('') + '</tbody></table></div>';
    return { title: 'Videos', html:
      head('Videos', 'All videos in the pilot. Removed videos are hidden from the app but kept for appeals for 30 days.') +
      '<div class="toolbar"><input type="search" id="vq" placeholder="Search by @handle, caption, #hashtag or ID" aria-label="Search videos" value="' + esc(ui.vq) + '">' +
      '<div class="seg" role="group" aria-label="Status">' + [['all','All'],['live','Live'],['processing','Processing'],['removed','Removed']].map(function(s){ return '<button data-s="' + s[0] + '" aria-pressed="' + (ui.vStatus === s[0]) + '">' + s[1] + '<span class="n">' + cnt(s[0]) + '</span></button>'; }).join('') + '</div>' +
      '<div class="seg" role="group" aria-label="Layout" style="margin-left:auto"><button data-view="grid" aria-pressed="' + (ui.vView === 'grid') + '">Grid</button><button data-view="table" aria-pressed="' + (ui.vView === 'table') + '">Table</button></div></div>' + body,
      after: function(m){
        var inp = $('#vq', m); inp.oninput = function(){ ui.vq = inp.value; var pos = inp.selectionStart; render(); var n = $('#vq'); n.focus(); n.setSelectionRange(pos, pos); };
        $$('[data-s]', m).forEach(function(b){ b.onclick = function(){ ui.vStatus = b.dataset.s; render(); }; });
        $$('[data-view]', m).forEach(function(b){ b.onclick = function(){ ui.vView = b.dataset.view; render(); }; });
        $$('[data-remove]', m).forEach(function(b){ b.onclick = function(e){ e.stopPropagation(); var v = byVideo(b.dataset.remove);
          modal({ title: 'Remove ' + v.id + '?', text: 'By @' + esc(v.h) + ': “' + esc(v.cap) + '”. It disappears from Dumo straight away.', body: '<label class="f">Rule broken<select id="mReason">' + Object.keys(REASONS).map(function(k){ return '<option value="' + k + '">' + REASONS[k] + '</option>'; }).join('') + '</select></label>', ok: 'Remove video', danger: true, onOk: function(s){
            v.status = 'removed'; log('Removed video ' + v.id + ' (@' + v.h + ') — ' + REASONS[$('#mReason', s).value], [v.id, v.h]);
            reports.forEach(function(r){ if (r.status === 'open' && r.target === v.id && r.type === 'video'){ r.status = 'actioned'; r.action = 'Video removed'; r.secs = 30; r.by = 'BP Mhlanga'; } });
            toast(v.id + ' removed'); render(); } }); }; });
        $$('[data-restore]', m).forEach(function(b){ b.onclick = function(e){ e.stopPropagation(); var v = byVideo(b.dataset.restore);
          modal({ title: 'Restore ' + v.id + '?', text: 'It goes back into feeds and search. Use this when an appeal is upheld.', ok: 'Restore video', onOk: function(){ v.status = 'live'; log('Restored video ' + v.id + ' (@' + v.h + ')', [v.id, v.h]); toast(v.id + ' restored'); render(); } }); }; });
        rowLinks(m);
      } };
  }

  function vUsers(){
    var q = ui.uq.trim().toLowerCase().replace(/^@/, '');
    var list = users.filter(function(u){ return (ui.uRole === 'all' || u.role === ui.uRole) && (ui.uStatus === 'all' || u.status === ui.uStatus) && (!q || u.h.indexOf(q) > -1 || u.name.toLowerCase().indexOf(q) > -1 || u.place.toLowerCase().indexOf(q) > -1); });
    var opt = function(v, l, cur){ return '<option value="' + v + '"' + (cur === v ? ' selected' : '') + '>' + l + '</option>'; };
    return { title: 'Users', html:
      head('Users', users.length + ' accounts in this sample · pilot target 100 creators.') +
      '<div class="toolbar"><input type="search" id="uq" placeholder="Search by name, @handle or town" aria-label="Search users" value="' + esc(ui.uq) + '">' +
      '<label style="display:contents"><span style="position:absolute;left:-9999px">Role</span><select id="uRole">' + opt('all','All roles',ui.uRole) + opt('creator','Creators',ui.uRole) + opt('viewer','Viewers',ui.uRole) + '</select></label>' +
      '<div class="seg" role="group" aria-label="Status">' + [['all','All'],['active','Active'],['suspended','Suspended'],['deleted','Deleted']].map(function(s){ return '<button data-s="' + s[0] + '" aria-pressed="' + (ui.uStatus === s[0]) + '">' + s[1] + '</button>'; }).join('') + '</div></div>' +
      (list.length ? '<div class="table-wrap"><table class="t"><thead><tr><th>User</th><th>Role</th><th>Age band</th><th>Status</th><th>Location</th><th class="num">Followers</th><th class="num">Videos</th><th>Joined</th></tr></thead><tbody>' + list.map(function(u){
        return '<tr data-go="users/' + u.h + '" tabindex="0"><td><span class="handle">' + av(u) + '<span>' + esc(u.name) + '<br><span style="font-weight:500;color:var(--muted);font-size:13px">@' + esc(u.h) + '</span></span></span></td><td style="text-transform:capitalize">' + u.role + '</td><td>' + u.age + (u.age === '13–17' ? ' <span class="chip" style="font-size:11px">can\'t earn</span>' : '') + '</td><td>' + st(u.status) + '</td><td>' + esc(u.place) + '</td><td class="num">' + int(u.followers) + '</td><td class="num">' + vidsOf(u.h).length + '</td><td>' + esc(u.joined) + '</td></tr>';
      }).join('') + '</tbody></table></div>' : '<div class="card empty"><b style="font-size:18px;color:var(--fg)">No users found</b><br>Try another name or clear the filters.</div>'),
      after: function(m){
        var inp = $('#uq', m); inp.oninput = function(){ ui.uq = inp.value; var pos = inp.selectionStart; render(); var n = $('#uq'); n.focus(); n.setSelectionRange(pos, pos); };
        $('#uRole', m).onchange = function(){ ui.uRole = this.value; render(); };
        $$('[data-s]', m).forEach(function(b){ b.onclick = function(){ ui.uStatus = b.dataset.s; render(); }; });
        rowLinks(m);
      } };
  }

  function vUser(h){
    var u = byHandle(h);
    if (!u) return { title: 'User not found', html: head('User not found', '', '', '<a href="#/users">← Users</a>') };
    var vs = vidsOf(u.h), w = wallet(u);
    var against = reports.filter(function(r){ var t = targetUser(r); return t && t.h === u.h; });
    var deleted = u.status === 'deleted';
    var walletCard = u.role !== 'creator' ? '<p class="sub">Viewers don\'t have a creator wallet. Test coins only.</p>'
      : u.age !== '18+' ? '<div class="note">Under 18 — this creator can post but cannot earn. The earnings switch unlocks automatically on their 18th birthday.</div>'
      : '<dl class="kv"><dt>Views</dt><dd>' + money(w.views) + ' <span class="help">(' + int(w.q) + ' qualified × ' + money(settings.rpm) + '/1,000)</span></dd><dt>Gifts</dt><dd>' + money(w.gifts) + ' <span class="help">(' + settings.giftShare + '% of ' + money(u.gifts) + ')</span></dd><dt>Subscribers</dt><dd>' + money(w.subs) + '</dd><dt style="font-weight:700;color:var(--fg)">Balance</dt><dd style="font:800 20px var(--display)">' + money(w.total) + '</dd></dl><p class="help" style="margin:10px 0 0">Test money only. Cash-out is switched off for the pilot.</p>';
    return { title: 'User @' + u.h, html:
      '<div class="crumb"><a href="#/users">← Users</a></div>' +
      '<div class="card" style="margin-bottom:16px"><div class="profile-head">' + av(u, 'lg') + '<div style="flex:1;min-width:220px"><h1>' + esc(deleted ? 'Deleted account' : u.name) + '</h1><div style="color:var(--muted)">@' + esc(u.h) + ' · ' + esc(u.place) + ' · ' + esc(u.lang) + '</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">' + st(u.status, u.status === 'suspended' ? 'Suspended until ' + u.suspendedUntil : null) + '<span class="chip" style="text-transform:capitalize">' + u.role + '</span><span class="chip">' + u.age + '</span>' + (u.joined.indexOf('Sep') > -1 && u.role === 'creator' ? '<span class="chip amber">Founding Creator</span>' : '') + '</div>' +
      '<div class="statrow"><div><b>' + short(u.followers) + '</b><span>Followers</span></div><div><b>' + vs.length + '</b><span>Videos</span></div><div><b>' + short(vs.reduce(function(s, v){ return s + v.views; }, 0)) + '</b><span>Qualified views</span></div><div><b>' + u.strikes + '</b><span>Warnings</span></div></div></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' + (deleted ? '' : (u.status === 'suspended' ? '<button class="btn" id="unsus">Lift suspension</button>' : '<button class="btn ghost-danger" id="sus">Suspend</button>') + '<button class="btn danger" id="del">Delete account (POPIA request)</button>') + '</div></div></div>' +
      '<div class="grid2"><section class="card"><h2>Videos</h2><p class="sub">' + (deleted ? 'All videos were deleted with the account.' : vs.length + ' video' + (vs.length === 1 ? '' : 's')) + '</p>' + (vs.length ? '<div class="vgrid" style="grid-template-columns:repeat(auto-fill,minmax(130px,1fr))">' + vs.map(function(v){ return '<div>' + videoBox(v, '<b>' + short(v.views) + '</b>') + '<div style="font-size:12px;margin-top:4px;display:flex;justify-content:space-between"><span>' + v.id + '</span>' + st(v.status) + '</div></div>'; }).join('') + '</div>' : '') + '</section>' +
      '<div style="display:flex;flex-direction:column;gap:16px;min-width:0"><section class="card"><h2>Wallet</h2><p class="sub">This month · <b style="color:var(--accent)">test money</b></p>' + walletCard + '</section>' +
      '<section class="card"><h2>Reports against</h2><p class="sub">' + against.length + ' total</p><ul class="attn">' + (against.map(function(r){ return '<li><a href="#/reports/' + r.id + '"><span class="dot" style="background:' + (r.status === 'open' ? 'var(--amber)' : 'var(--muted)') + '"></span><span style="flex:1"><b>' + esc(REASONS[r.reason]) + '</b> · ' + r.id + '<small>' + (r.status === 'open' ? 'Open · ' + ago(r.created) : esc(r.action)) + '</small></span></a></li>'; }).join('') || '<li class="sub" style="padding:8px 0">No reports.</li>') + '</ul></section>' +
      '<section class="card"><h2>Account</h2><dl class="kv"><dt>Phone</dt><dd>' + esc(deleted ? 'Erased' : u.phone) + '</dd><dt>Joined</dt><dd>' + esc(u.joined) + '</dd><dt>Log-in</dt><dd>Cellphone + SMS code</dd></dl></section></div></div>',
      after: function(){
        var s = $('#sus'); if (s) s.onclick = function(){ suspendModal(u, function(label){ log('Suspended @' + u.h + ' ' + label, [u.h]); toast('@' + u.h + ' suspended'); render(); }); };
        var un = $('#unsus'); if (un) un.onclick = function(){ modal({ title: 'Lift suspension for @' + u.h + '?', text: 'They can log in, post and earn again straight away.', ok: 'Lift suspension', onOk: function(){ u.status = 'active'; delete u.suspendedUntil; log('Lifted suspension for @' + u.h, [u.h]); toast('Suspension lifted'); render(); } }); };
        var d = $('#del'); if (d) d.onclick = function(){
          modal({ title: 'Delete @' + u.h + ' for good?', text: 'Their profile, ' + vs.length + ' video' + (vs.length === 1 ? '' : 's') + ', comments and phone number are erased from the app within 24 hours. Moderation records are kept without personal details. This cannot be undone.',
            body: '<label class="f">Type <b style="color:var(--fg)">' + esc(u.h) + '</b> to confirm<input type="text" id="mConfirm" autocomplete="off"></label>', ok: 'Delete account', danger: true,
            onOk: function(s){ if ($('#mConfirm', s).value.trim().replace(/^@/, '') !== u.h) return 'The handle does not match.'; u.status = 'deleted'; videos.forEach(function(v){ if (v.h === u.h) v.status = 'deleted'; }); reports.forEach(function(r){ var t = targetUser(r); if (r.status === 'open' && t && t.h === u.h){ r.status = 'actioned'; r.action = 'Account deleted'; r.secs = 45; r.by = 'BP Mhlanga'; } }); log('Deleted account @' + u.h + ' and ' + vs.length + ' videos (POPIA request)', [u.h]); toast('@' + u.h + ' and their videos are gone from the app'); render(); } });
        };
      } };
  }

  function vSettings(){
    var c = function(){ var v = ui.calcViews / 1000 * settings.rpm, g = ui.calcGifts * settings.giftShare / 100; return { v: v, g: g, t: v + g }; };
    var gifts = [['Protea', 20], ['Vuvuzela', 100], ['Gold crown', 500]];
    return { title: 'Settings', html:
      head('Settings', 'Monetisation rules and admin access for the pilot.') +
      '<div class="notice" role="note"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F2A93B" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg><div><b>Test money only — no real payments can be made in this pilot.</b><p>Wallet amounts are for testing the earnings rules. Cash-out (PayShap) and buying coins arrive in a later phase.</p></div></div>' +
      '<div class="grid2"><form class="card" id="setForm" novalidate style="display:flex;flex-direction:column;gap:18px"><div><h2>Monetisation</h2><p class="sub" style="margin:0">Changes apply to new views and gifts from the moment you save.</p></div>' +
        '<div class="form-grid">' +
          '<label class="f">Rand per 1,000 qualified views<span class="affix"><span>R</span><input type="number" id="sRpm" min="0" step="0.05" value="' + settings.rpm.toFixed(2) + '"></span><span class="help">Paid to creators aged 18+ only</span></label>' +
          '<label class="f">Creator share of each gift<span class="affix"><input type="number" id="sShare" min="0" max="100" step="1" value="' + settings.giftShare + '"><span>%</span></span><span class="help">Dumo keeps ' + (100 - settings.giftShare) + '%</span></label>' +
          '<label class="f">Value of 1 test coin<span class="affix"><span>R</span><input type="number" id="sCoin" min="0.01" step="0.01" value="' + settings.coin.toFixed(2) + '"></span><span class="help">' + gifts.map(function(g){ return g[0] + ' ' + g[1] + ' coins = ' + money(g[1] * settings.coin); }).join(' · ') + '</span></label>' +
        '</div>' +
        '<fieldset style="border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin:0;display:flex;flex-direction:column;gap:12px"><legend style="font-weight:700;padding:0 6px">What counts as a qualified view</legend>' +
          '<div class="form-grid"><label class="f">Minimum watch time<span class="affix"><input type="number" id="sMin" min="1" max="60" value="' + settings.minWatch + '"><span>seconds</span></span></label>' +
          '<label class="f">Repeat views from the same person<span class="affix"><span>count once per</span><input type="number" id="sRep" min="1" max="1440" value="' + settings.repeatWindow + '"><span>min</span></span></label></div>' +
          '<label class="check"><input type="checkbox" id="sOwn"' + (settings.excludeOwn ? ' checked' : '') + '>Don\'t count a creator watching their own videos</label>' +
        '</fieldset>' +
        '<div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn" id="sReset">Undo changes</button><button type="submit" class="btn primary">Save settings</button></div></form>' +
      '<div style="display:flex;flex-direction:column;gap:16px;min-width:0"><section class="card"><h2>Preview</h2><p class="sub">What a creator would earn with these settings</p><div class="calc">' +
        '<div class="form-grid" style="grid-template-columns:1fr 1fr;gap:10px"><label class="f">Qualified views<input type="number" id="cV" min="0" step="100" value="' + ui.calcViews + '"></label><label class="f">Gifts received (R)<input type="number" id="cG" min="0" step="1" value="' + ui.calcGifts + '"></label></div>' +
        '<div class="row"><span>Views</span><span id="oV"></span></div><div class="row"><span>Gifts (creator share)</span><span id="oG"></span></div><div class="row total"><span>Creator earns</span><b id="oT"></b></div></div></section>' +
      '<section class="card"><h2>Admins &amp; roles</h2><p class="sub">Only the Owner can change money settings or add admins.</p><div class="table-wrap"><table><thead><tr><th>Name</th><th>Role</th><th>2-step</th></tr></thead><tbody>' +
        '<tr><td>BP Mhlanga</td><td>' + st('active', 'Owner') + '</td><td>On</td></tr><tr><td>Nomsa Dube</td><td><span class="chip">Moderator</span></td><td>On</td></tr><tr><td>Dev team</td><td><span class="chip">Developer · read-only</span></td><td>On</td></tr></tbody></table></div>' +
        '<button class="btn" id="addAdmin" style="margin-top:12px">Invite admin</button></section>' +
      '<section class="card"><h2>Community guidelines</h2><p class="sub">Shown at sign-up; users must accept each new version.</p><dl class="kv"><dt>Current</dt><dd>' + settings.guidelines + ' · published ' + settings.guidelinesDate + '</dd><dt>Age rules</dt><dd>13+ to use · 18+ to earn</dd></dl><button class="btn" id="pubG" style="margin-top:12px">Publish new version</button></section></div></div>',
      after: function(m){
        var out = function(){ var r = c(); $('#oV').textContent = money(r.v); $('#oG').textContent = money(r.g); $('#oT').textContent = money(r.t); };
        var live = function(){ var rp = parseFloat($('#sRpm').value), sh = parseFloat($('#sShare').value); if (rp >= 0) settingsDraft.rpm = rp; if (sh >= 0 && sh <= 100) settingsDraft.giftShare = sh; var r = { v: ui.calcViews / 1000 * settingsDraft.rpm, g: ui.calcGifts * settingsDraft.giftShare / 100 }; $('#oV').textContent = money(r.v); $('#oG').textContent = money(r.g); $('#oT').textContent = money(r.v + r.g); };
        var settingsDraft = { rpm: settings.rpm, giftShare: settings.giftShare };
        out();
        ['#sRpm','#sShare'].forEach(function(s){ $(s, m).addEventListener('input', live); });
        $('#cV', m).oninput = function(){ ui.calcViews = Math.max(0, +this.value || 0); live(); };
        $('#cG', m).oninput = function(){ ui.calcGifts = Math.max(0, +this.value || 0); live(); };
        $('#sReset', m).onclick = function(){ render(); toast('Changes undone'); };
        $('#setForm', m).addEventListener('submit', function(e){
          e.preventDefault();
          var rp = parseFloat($('#sRpm').value), sh = parseFloat($('#sShare').value), co = parseFloat($('#sCoin').value), mn = parseInt($('#sMin').value, 10), rep = parseInt($('#sRep').value, 10);
          if (!(rp >= 0) || !(sh >= 0 && sh <= 100) || !(co > 0) || !(mn >= 1) || !(rep >= 1)){ toast('Check the values — all must be positive, share 0–100%.'); return; }
          var changes = [];
          if (rp !== settings.rpm) changes.push('rand per 1,000 views ' + money(settings.rpm) + ' → ' + money(rp));
          if (sh !== settings.giftShare) changes.push('gift share ' + settings.giftShare + '% → ' + sh + '%');
          if (co !== settings.coin) changes.push('coin value ' + money(settings.coin) + ' → ' + money(co));
          if (mn !== settings.minWatch) changes.push('min watch ' + settings.minWatch + 's → ' + mn + 's');
          if (rep !== settings.repeatWindow) changes.push('repeat window ' + settings.repeatWindow + ' → ' + rep + ' min');
          if ($('#sOwn').checked !== settings.excludeOwn) changes.push(($('#sOwn').checked ? 'excluding' : 'counting') + ' own views');
          if (!changes.length){ toast('Nothing changed'); return; }
          modal({ title: 'Save monetisation settings?', text: 'This changes how test earnings are calculated for every creator from now on:<br><br>• ' + changes.map(esc).join('<br>• '), ok: 'Save', onOk: function(){
            settings.rpm = rp; settings.giftShare = sh; settings.coin = co; settings.minWatch = mn; settings.repeatWindow = rep; settings.excludeOwn = $('#sOwn').checked;
            log('Changed ' + changes.join('; '), ['settings']); toast('Settings saved'); render(); } });
        });
        $('#addAdmin', m).onclick = function(){ modal({ title: 'Invite an admin', body: '<label class="f">Work email<input type="email" id="mEmail" placeholder="name@dumothefame.com"></label><label class="f">Role<select><option>Moderator</option><option>Developer · read-only</option></select></label>', ok: 'Send invite', onOk: function(s){ var v = $('#mEmail', s).value.trim(); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return 'Enter a valid email address.'; toast('Invite sent to ' + v); } }); };
        $('#pubG', m).onclick = function(){ modal({ title: 'Publish guidelines v1.1?', text: 'Everyone will be asked to read and accept the new version the next time they open Dumo.', ok: 'Publish', onOk: function(){ settings.guidelines = 'v1.1'; settings.guidelinesDate = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }); log('Published community guidelines v1.1', ['settings']); toast('Guidelines v1.1 published'); render(); } }); };
      } };
  }

  render();
})();
