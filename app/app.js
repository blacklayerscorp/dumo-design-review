/* Dumo Android pilot — clickable prototype.
   Hash routes (#/feed, #/wallet?sheet=explain …) so every screen and sheet has a link,
   the screen board can embed any of them, and review pins attach per screen.
   All data is sample data held in memory; nothing leaves the browser. */
(function(){
'use strict';
var $ = function(s, r){ return (r || document).querySelector(s); };
var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var FRAME = /[?&]frame=1/.test(location.search);
if (FRAME) document.body.classList.add('frame');
var esc = function(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); };
var money = function(n){ return 'R' + Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/ /g, ' ').replace(/ /g, ',').replace(/,(\d\d)$/, '.$1'); };
var short = function(n){ return n >= 1e6 ? (n/1e6).toFixed(1).replace(/\.0$/,'') + 'M' : n >= 1000 ? (n/1000).toFixed(1).replace(/\.0$/,'') + 'K' : String(n); };

/* ---------------- icons (24px line, 2px stroke) ---------------- */
var P = {
  home:'<path d="M3 11l9-8 9 8v10H3z"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  wallet:'<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M16 13h2M3 10h18"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/>',
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
  comment:'<path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z"/>',
  gift:'<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18"/><path d="M12 8c-2-4-6-4-6-1s6 1 6 1c0 0 6 2 6-1s-4-3-6 1z"/>',
  share:'<path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/>',
  saver:'<path d="M12 2v8"/><path d="M5 9l7 7 7-7"/><path d="M4 20h16"/>',
  back:'<path d="M15 18l-6-6 6-6"/>',
  chev:'<path d="M9 18l6-6-6-6"/>',
  up:'<path d="M6 15l6-6 6 6"/>',
  down:'<path d="M6 9l6 6 6-6"/>',
  more:'<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  flag:'<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
  block:'<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
  link:'<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
  x:'<path d="M18 6L6 18M6 6l12 12"/>',
  check:'<path d="M5 12l5 5L20 7"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/>',
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
  eye:'<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
  play:'<path d="M7 4v16l13-8z" fill="currentColor"/>',
  camera:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  flip:'<path d="M3 7h13l-3-3M21 17H8l3 3"/>',
  timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
  wifi:'<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a15 15 0 0 1 20 0"/><path d="M12 19.5h.01"/>',
  lang:'<path d="M4 5h8M8 3v2c0 4-2 7-5 9M6 9c1 2 3 4 6 5"/><path d="M13 21l4-10 4 10M14.5 17.5h5"/>',
  doc:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
  phone:'<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
  cake:'<path d="M4 21h16v-8H4zM4 16c2 1 3 1 4 0s3-1 4 0 3 1 4 0 3-1 4 0"/><path d="M12 13V9M12 6.5V6"/>',
  bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  wa:'<path d="M3 21l1.6-4.6A9 9 0 1 1 8 20z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2z"/>',
  star:'<path d="M12 2l3 7 7 .8-5.3 4.8 1.6 7.4L12 18l-6.3 4 1.6-7.4L2 9.8 9 9z"/>',
  sparkle:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
  pin:'<path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  img:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>',
  cut:'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/>',
  offline:'<path d="M2 2l20 20M8.5 16a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 4.2-2.4M19 12.5a10 10 0 0 0-2.4-1.7M2 9a15 15 0 0 1 4.5-2.8M22 9a15 15 0 0 0-10-3.9"/>'
};
function ic(n, s, extra){ s = s || 24; return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || '') + '>' + (P[n] || '') + '</svg>'; }

/* ---------------- sample data ---------------- */
var CREATORS = {
  'thandi.moves': { name:'Thandi Mokoena', ini:'TM', col:'#2BB3A3', place:'Soweto, Gauteng', langs:'isiZulu · English', founding:true, followers:84200, following:312, likes:'1.9M', views:'6.4M', bio:'Dancer from Soweto. Teaching gogo the moves every Sunday.' },
  'kasi.kitchen': { name:'Kasi Kitchen', ini:'KK', col:'#E4572E', place:'Soweto, Gauteng', langs:'English · Sesotho', founding:true, followers:41800, following:95, likes:'640K', views:'2.1M', bio:'Township food on a budget. Kota reviews every Friday.' },
  'capetown.lens': { name:'Liezl van Wyk', ini:'LV', col:'#5B7BD6', place:'Cape Town, Western Cape', langs:'Afrikaans · English', founding:false, followers:12600, following:210, likes:'98K', views:'540K', bio:'Sunrises, sea and the Mother City in 30 seconds.' },
  'sipho.comedy': { name:'Sipho Dlamini', ini:'SD', col:'#B07CE8', place:'Pretoria, Gauteng', langs:'Sesotho · English', founding:true, followers:203000, following:150, likes:'4.8M', views:'19M', bio:'Skits about family, taxis and airtime.' },
  'lerato.beats': { name:'Lerato Molefe', ini:'LM', col:'#D6457A', place:'Durban, KwaZulu-Natal', langs:'English · isiZulu', founding:false, followers:9700, following:401, likes:'77K', views:'310K', bio:'Gqom + amapiano producer. Beats daily.' },
  'durban.eats': { name:'Ayesha Pillay', ini:'AP', col:'#3FA34D', place:'Durban, KwaZulu-Natal', langs:'English', founding:false, followers:22100, following:180, likes:'260K', views:'1.1M', bio:'Bunny chows ranked. Durban curry only.' }
};
var ME_DEFAULT = { handle:'nomsa.creates', name:'Nomsa Khumalo', ini:'NK', col:'#5B3A6E', place:'Durban, KwaZulu-Natal', province:'KwaZulu-Natal', city:'Durban', langs:'isiZulu · English', founding:true, followers:12400, following:86, likes:'318K', bio:'Food, family and Durban vibes. New video every Tuesday.', phone:'082 *** 4417', dob:'14 March 2001' };
var VIDEOS = [
  { id:'v1', c:'thandi.moves', cap:'Teaching my gogo the new amapiano step. She killed it! #Mzansi #DumoChallenge', lang:'isiZulu', sub:'English subtitles', likes:48200, comments:1203, views:212000, g:['#6E4219','#2BB3A3','#F2A93B'], ago:'2h', dur:'0:24' },
  { id:'v2', c:'kasi.kitchen', cap:'R50 kota challenge: how much can you get in Soweto? #KasiEats #Mzansi', lang:'English', likes:12900, comments:388, views:98000, g:['#4A2A12','#E4572E','#F2C14E'], ago:'5h', dur:'0:41' },
  { id:'v3', c:'capetown.lens', cap:'Sunrise over Lion’s Head in 30 seconds #CapeTown #Sunrise', lang:'Afrikaans', likes:8300, comments:142, views:45000, g:['#1C2A3F','#5B7BD6','#F2A93B'], ago:'8h', dur:'0:30' },
  { id:'v4', c:'sipho.comedy', cap:'When your mom asks who finished the airtime #Comedy #DumoChallenge', lang:'Sesotho', likes:91400, comments:2780, views:1200000, g:['#3B1F33','#B07CE8','#E4572E'], ago:'1d', dur:'0:19' },
  { id:'v5', c:'lerato.beats', cap:'Gqom x amapiano in 15 seconds. Which one wins? #Amapiano #Gqom', lang:'English', likes:5100, comments:96, views:76000, g:['#2A0F1E','#D6457A','#7FE0CF'], ago:'1d', dur:'0:15' },
  { id:'v6', c:'durban.eats', cap:'Quarter mutton bunny vs half beans bunny. Durban, settle this. #BunnyChow #Durban', lang:'English', likes:17600, comments:604, views:131000, g:['#3D2A0E','#3FA34D','#F2A93B'], ago:'2d', dur:'0:52' },
  { id:'v7', c:'thandi.moves', cap:'Gogo has her own fan club now #DumoChallenge', lang:'isiZulu', likes:31800, comments:902, views:610000, g:['#20352F','#2BB3A3','#F6D365'], ago:'3d', dur:'0:33' },
  { id:'v8', c:'sipho.comedy', cap:'Taxi rank logic part 4 #Comedy #Mzansi', lang:'English', likes:66000, comments:1830, views:880000, g:['#2E1B3B','#B07CE8','#F2A93B'], ago:'4d', dur:'0:27' }
];
var MY_VIDEOS = [
  { id:'m1', c:'nomsa.creates', cap:'Durban bunny chow taste test with my brother #DumoChallenge', lang:'isiZulu', likes:21000, comments:430, views:212000, g:['#3A2A1A','#5B3A6E','#F2A93B'], ago:'3d', dur:'0:24' },
  { id:'m2', c:'nomsa.creates', cap:'Beachfront sunset jog #Durban', lang:'English', likes:6800, comments:120, views:98000, g:['#1F3A2E','#2BB3A3','#F6D365'], ago:'1w', dur:'0:18' },
  { id:'m3', c:'nomsa.creates', cap:'Making amadumbe the way gogo does #Mzansi', lang:'isiZulu', likes:92000, comments:3100, views:1200000, g:['#3B1F33','#E4572E','#F2A93B'], ago:'2w', dur:'0:46' },
  { id:'m4', c:'nomsa.creates', cap:'Market day in Warwick #Durban', lang:'English', likes:3100, comments:44, views:45000, g:['#1C2A3F','#5B7BD6','#F2A93B'], ago:'3w', dur:'0:31' },
  { id:'m5', c:'nomsa.creates', cap:'Learning Sesotho from my neighbour', lang:'Sesotho', likes:4900, comments:91, views:76000, g:['#2F2416','#3FA34D','#F2A93B'], ago:'1mo', dur:'0:22' }
];
var COMMENT_SEED = [
  { u:'lerato.beats', t:'Gogo is the real star \u{1F602}\u{1F525}', l:1204, ago:'1h' },
  { u:'sipho.comedy', t:'Yoh! the footwork \u{1F44F}\u{1F44F}', l:860, ago:'1h' },
  { u:'mpho_k', t:'Please do a tutorial, I want to learn this', l:312, ago:'45m' },
  { u:'durban.eats', t:'Haibo this is too good', l:190, ago:'30m' },
  { u:'kgomotso.r', t:'Watching from Gaborone \u{1F1E7}\u{1F1FC} we love it', l:77, ago:'12m' },
  { u:'zinhle.za', t:'Sho’t left to Soweto just for gogo', l:41, ago:'5m' }
];
var HASHTAGS = [
  { t:'DumoChallenge', v:'1.2M views', n:2140 }, { t:'Mzansi', v:'980K views', n:5320 }, { t:'Amapiano', v:'640K views', n:1780 },
  { t:'KasiEats', v:'210K views', n:412 }, { t:'BunnyChow', v:'150K views', n:240 }, { t:'Comedy', v:'2.3M views', n:3900 }, { t:'CapeTown', v:'320K views', n:880 }
];
var GIFTS = [ { n:'Protea', e:'\u{1F33A}', c:20 }, { n:'Vuvuzela', e:'\u{1F4EF}', c:100 }, { n:'Gold crown', e:'\u{1F451}', c:500 } ];
var COIN_RAND = 0.10, CREATOR_SHARE = 0.70, RATE = 3.50;
var LANGS = ['English','isiZulu','isiXhosa','Afrikaans','Sesotho','Setswana','Sepedi','Xitsonga','siSwati','Tshivenda','isiNdebele','No speech (music only)'];
var PROVINCES = ['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','North West','Northern Cape','Western Cape'];
var GALLERY = [ { d:12, g:['#4A2A12','#F2C14E'] }, { d:24, g:['#20352F','#2BB3A3'] }, { d:74, g:['#3B1F33','#B07CE8'] }, { d:45, g:['#1C2A3F','#5B7BD6'] }, { d:38, g:['#3D2A0E','#3FA34D'] }, { d:125, g:['#2A0F1E','#D6457A'] } ];

function clone(o){ return JSON.parse(JSON.stringify(o)); }
function fresh(){
  return {
    signedIn: true, flow: 'signup', me: clone(ME_DEFAULT),
    videos: clone(VIDEOS), mine: clone(MY_VIDEOS),
    following: ['thandi.moves', 'sipho.comedy'], liked: {}, blocked: ['quick.cash.za'], reported: {},
    comments: {}, saver: true, preload: 'Wi-Fi only', wifiUpload: true,
    coins: 500, balance: 1284.50, viewsR: 742.10, giftsR: 398.40, subsR: 144.00, qviews: 212030, fans: 86,
    giftsSent: [], idx: 0, tab: 'foryou', under18: false, later: false, offline: false, coach: false, paused: false,
    draft: { cap: 'Durban bunny chow taste test with my brother #DumoChallenge', lang: 'isiZulu', dur: 24, earn: true, comments: true, global: true, cross: false, subs: false },
    phone: '', dobAge: null, cashed: []
  };
}
var S = fresh();
function txs(){
  return [
    { t:'Gift · Vuvuzela', s:'from @lerato.beats · today 14:02', a:7.00 },
    { t:'Views · 18,400 qualified', s:'yesterday · ' + money(RATE) + ' per 1,000', a:64.40 },
    { t:'Gift · Gold crown', s:'from @kasi.kitchen · Tue 6 Oct', a:35.00 },
    { t:'Subscribers · 6 test subs', s:'Thu 1 Oct', a:144.00 },
    { t:'Views · 22,900 qualified', s:'Wed 30 Sep', a:80.15 }
  ];
}

/* ---------------- routing ---------------- */
function parse(h){
  h = (h == null ? location.hash : h).replace(/^#\/?/, '');
  var qi = h.indexOf('?'); var path = qi < 0 ? h : h.slice(0, qi); var qs = qi < 0 ? '' : h.slice(qi + 1);
  var q = {}; qs.split('&').forEach(function(p){ if (!p) return; var kv = p.split('='); q[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' ')); });
  var parts = path.split('/').filter(Boolean);
  return { path: path || 'feed', parts: parts.length ? parts : ['feed'], q: q };
}
function hashOf(path, q){
  var s = Object.keys(q || {}).filter(function(k){ return q[k] != null && q[k] !== ''; }).map(function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(q[k]); }).join('&');
  return '#/' + path + (s ? '?' + s : '');
}
function go(h, replace){ if (h.charAt(0) !== '#') h = '#/' + h; if (replace) { history.replaceState(null, '', h); render(); } else if (location.hash === h) render(); else location.hash = h; }
function setQ(k, v){ var r = parse(); r.q[k] = v; go(hashOf(r.path, r.q), true); }
function sheet(name){ var r = parse(); if (name) r.q.sheet = name; else delete r.q.sheet; go(hashOf(r.path, r.q), !name ? true : false); }
function closeSheet(){ var r = parse(); if (!r.q.sheet) return; delete r.q.sheet; Object.keys(r.q).forEach(function(k){ if (k.indexOf('s_') === 0) delete r.q[k]; }); go(hashOf(r.path, r.q), true); }

/* ---------------- helpers ---------------- */
function creator(h){ if (h === S.me.handle) return S.me; return CREATORS[h] || { name: h, ini: h.slice(0,2).toUpperCase(), col: '#6B5538', place: '', followers: 0, likes: '0', views: '0', langs: '' }; }
function avatar(h, size){ var c = creator(h); size = size || 40; return '<span class="av" style="width:' + size + 'px;height:' + size + 'px;background:' + c.col + ';font-size:' + Math.round(size * .34) + 'px">' + esc(c.ini) + '</span>'; }
function scene(v){ var g = v.g; return 'background:radial-gradient(120% 70% at 20% 10%,' + g[1] + '55,transparent 60%),radial-gradient(90% 60% at 90% 90%,' + g[2] + '44,transparent 60%),linear-gradient(160deg,' + g[0] + ',#0b0906)'; }
function capHTML(t){ return esc(t).replace(/#(\w+)/g, '<a href="#/tag/$1" class="ht" style="color:inherit;text-decoration:none">#$1</a>'); }
function allVideos(){ return S.mine.concat(S.videos); }
function findVideo(id){ return allVideos().filter(function(v){ return v.id === id; })[0]; }
function visible(v){ return S.blocked.indexOf(v.c) < 0 && !S.reported[v.id]; }
function isFollowing(h){ return S.following.indexOf(h) >= 0; }
function canEarn(){ return !S.under18; }
var timers = [];
function later(fn, ms){ var t = setTimeout(fn, ms); timers.push(t); return t; }
function every(fn, ms){ var t = setInterval(fn, ms); timers.push(t); return t; }
function clearTimers(){ timers.forEach(function(t){ clearTimeout(t); clearInterval(t); }); timers = []; }

var toastT;
function toast(msg, icon){
  var t = $('#toast'); if (!t){ t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role','status'); $('#phone').appendChild(t); }
  t.innerHTML = (icon ? '<span style="color:#1E7F72">' + ic(icon, 20) + '</span>' : '') + '<span>' + esc(msg) + '</span>'; t.hidden = false;
  t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
  clearTimeout(toastT); toastT = setTimeout(function(){ t.hidden = true; }, 3000);
}
function topbar(title, opts){
  opts = opts || {};
  return '<div class="hdr">' + (opts.noBack ? '' : '<button class="iconbtn" data-act="back" aria-label="Back">' + ic('back', 22) + '</button>') +
    '<h1 class="h1" style="font-size:' + (opts.size || 24) + 'px;flex:1;min-width:0">' + title + '</h1>' + (opts.right || '') + '</div>';
}

/* ---------------- screens ---------------- */
var SCREENS = {};
var TITLES = {};
function screen(path, title, opts, fn){ SCREENS[path] = { title: title, tab: opts.tab, chrome: opts.chrome !== false, fn: fn, after: opts.after }; TITLES[path] = title; }

/* ---- onboarding ---- */
screen('splash', 'Splash', { chrome: false, after: function(){ if (!FRAME) later(function(){ go('#/welcome', true); }, 1600); } }, function(){
  return '<div class="splash"><img src="../assets/dumo-icon.png" alt=""><div class="center"><div class="wordmark">dumo</div><div class="fame">THE FAME</div></div>' +
    '<p class="small" style="position:absolute;bottom:34px">Made in Mzansi</p></div>';
});
screen('welcome', 'Welcome', { chrome: false }, function(){
  var tiles = VIDEOS.slice(0, 6).map(function(v){ return '<div style="' + scene(v) + '"><span>@' + esc(v.c) + '</span></div>'; }).join('');
  return '<div class="ob" style="padding-top:44px;overflow:hidden"><div class="collage" aria-hidden="true">' + tiles + '</div>' +
    '<div style="margin-top:auto;display:flex;flex-direction:column;gap:14px;position:relative;background:linear-gradient(transparent,var(--bg) 18%);padding-top:30px;margin-left:-20px;margin-right:-20px;padding-left:20px;padding-right:20px">' +
    '<h1 class="hero">Create. Get seen.<br><em>Get paid.</em></h1><p class="sub">Short videos by South African creators. Post yours and earn from views and gifts.</p>' +
    '<button class="btn acc" data-act="start-signup">' + ic('phone', 20) + 'Sign up with your phone number</button>' +
    '<button class="btn line" data-act="start-login">I already have an account · Log in</button>' +
    '<p class="small center">By continuing you agree to Dumo’s <a class="link" href="#/doc/terms">Terms</a> and <a class="link" href="#/doc/privacy">Privacy Policy</a>.</p></div></div>';
});
screen('phone', 'Phone number', { chrome: false }, function(){
  return '<div class="ob">' + topbar(S.flow === 'login' ? 'Log in' : 'Sign up') +
    '<div><h2 class="h1" style="font-size:26px">What’s your cellphone number?</h2><p class="sub" style="margin-top:6px">We’ll SMS you a 6-digit code to ' + (S.flow === 'login' ? 'log you in' : 'confirm it’s you') + '.</p></div>' +
    '<label class="field" for="tel">Cellphone number<div class="phonein"><span class="cc"><span aria-hidden="true">\u{1F1FF}\u{1F1E6}</span> +27</span><input class="input" id="tel" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="082 123 4567" value="' + esc(S.phone) + '" maxlength="12"></div></label>' +
    '<p class="errtxt" id="telErr" hidden></p>' +
    '<div class="infobox">' + ic('shield', 20) + '<span>Your number is never shown on your profile. Standard SMS rates may apply.</span></div>' +
    '<button class="btn acc" data-act="send-code" style="margin-top:auto">Send code</button></div>';
});
screen('otp', 'SMS code', { chrome: false, after: function(){
  var n = 30; var lbl = $('#resend'); var tick = function(){ if (!lbl) return; if (n <= 0){ lbl.innerHTML = '<button class="link" data-act="resend">Resend code</button>'; return; } lbl.textContent = 'Resend code in 0:' + String(n).padStart(2, '0'); n--; };
  tick(); if (!FRAME) every(tick, 1000);
  var boxes = $$('.otp input'); if (!FRAME && boxes[0]) boxes[0].focus();
  boxes.forEach(function(b, i){
    b.addEventListener('input', function(){ b.value = b.value.replace(/\D/g, '').slice(-1); if (b.value && boxes[i+1]) boxes[i+1].focus(); checkOtp(); });
    b.addEventListener('keydown', function(e){ if (e.key === 'Backspace' && !b.value && boxes[i-1]) boxes[i-1].focus(); });
    b.addEventListener('paste', function(e){ var d = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6); if (!d) return; e.preventDefault(); boxes.forEach(function(x, j){ x.value = d[j] || ''; }); checkOtp(); });
  });
} }, function(){
  var num = S.phone || '082 123 4567';
  return '<div class="ob">' + topbar('Enter code') +
    '<div><h2 class="h1" style="font-size:26px">Enter the 6-digit code</h2><p class="sub" style="margin-top:6px">Sent to +27 ' + esc(num.replace(/^0/, '')) + ' · <button class="link" data-act="back">Wrong number?</button></p></div>' +
    '<div class="otp" id="otp" role="group" aria-label="6-digit code">' + [0,1,2,3,4,5].map(function(i){ return '<input inputmode="numeric" autocomplete="' + (i === 0 ? 'one-time-code' : 'off') + '" maxlength="1" aria-label="Digit ' + (i+1) + '">'; }).join('') + '</div>' +
    '<p class="errtxt" id="otpErr" hidden>That code is not right. You have 2 tries left.</p>' +
    '<p class="small" id="resend"></p>' +
    '<span class="demo">Prototype: any 6 digits work · 000000 shows the error</span>' +
    '<p class="small" style="margin-top:auto">Android fills the code automatically when the SMS arrives.</p></div>';
});
screen('age', 'Date of birth', { chrome: false }, function(){
  var days = '<option value="">Day</option>' + Array.from({length:31}, function(_, i){ return '<option>' + (i+1) + '</option>'; }).join('');
  var months = '<option value="">Month</option>' + ['January','February','March','April','May','June','July','August','September','October','November','December'].map(function(m, i){ return '<option value="' + i + '">' + m + '</option>'; }).join('');
  var years = '<option value="">Year</option>' + Array.from({length:90}, function(_, i){ return '<option>' + (2026 - i) + '</option>'; }).join('');
  return '<div class="ob">' + topbar('Your birthday') +
    '<div><h2 class="h1" style="font-size:26px">When is your birthday?</h2><p class="sub" style="margin-top:6px">This keeps Dumo safe for younger people. It is never shown on your profile.</p></div>' +
    '<div class="dob"><select class="select" id="dd" aria-label="Day">' + days + '</select><select class="select" id="mm" aria-label="Month">' + months + '</select><select class="select" id="yy" aria-label="Year">' + years + '</select></div>' +
    '<div id="ageMsg"></div>' +
    '<div class="rules"><div class="rule"><span class="i">' + ic('eye', 20) + '</span><span><b>13 and older</b><span>Watch, like, comment and post videos.</span></span></div>' +
    '<div class="rule"><span class="i">' + ic('wallet', 20) + '</span><span><b>18 and older</b><span>Also earn from views and gifts in your wallet.</span></span></div></div>' +
    '<button class="btn acc" data-act="age-next" id="ageNext" disabled style="margin-top:auto">Continue</button></div>';
});
screen('age-blocked', 'Under 13', { chrome: false }, function(){
  return '<div class="ob" style="justify-content:center;text-align:center;align-items:center"><div class="empty"><span class="ill">' + ic('cake', 34) + '</span><b>Dumo is for people 13 and older</b>' +
    '<span>Thanks for your interest. You can’t create an account yet. Come back when you turn 13.</span></div>' +
    '<button class="btn ghost" data-go="#/welcome" style="margin-top:auto">Close</button></div>';
});
screen('profile-setup', 'Create profile', { chrome: false }, function(){
  var me = S.me;
  return '<div class="ob">' + topbar('Your profile') +
    '<button class="avpick" data-act="photo" aria-label="Add a profile photo">' + ic('user', 44) + '<span class="cam-b">' + ic('camera', 18) + '</span></button>' +
    '<label class="field" for="pname">Name<input class="input" id="pname" value="' + esc(me.name) + '" maxlength="30" autocomplete="name"></label>' +
    '<label class="field" for="phandle">Username<div class="handle"><span style="color:var(--muted)">@</span><input id="phandle" value="' + esc(me.handle) + '" maxlength="24" autocapitalize="off" spellcheck="false"></div></label>' +
    '<p class="ok" id="hOk">' + ic('check', 16) + ' @' + esc(me.handle) + ' is available</p>' +
    '<label class="field" for="pprov">Province<select class="select" id="pprov">' + PROVINCES.map(function(p){ return '<option' + (p === me.province ? ' selected' : '') + '>' + p + '</option>'; }).join('') + '</select></label>' +
    '<p class="help">You can change all of this later in your profile.</p>' +
    '<button class="btn acc" data-act="profile-next" style="margin-top:auto">Continue</button></div>';
});
screen('guidelines', 'Community guidelines', { chrome: false }, function(r){
  var view = r.q.from === 'settings';
  var rules = [
    ['heart','Be kind','No bullying, hate speech or harassment, in any language.'],
    ['shield','Keep it safe','No nudity, violence, weapons, drugs or dangerous challenges.'],
    ['user','Protect young people','Never post or ask for sexual content involving anyone under 18.'],
    ['music','Post your own work','Only use video and music you made or have the right to use.'],
    ['flag','Report, don’t fight back','Use Report on any video or account. Our team checks every report.']
  ];
  return '<div class="ob">' + topbar('Community guidelines', { noBack: !view }) +
    (view ? '' : '<p class="sub" style="margin-top:-6px">Dumo is a place for Mzansi creators to shine. Five rules keep it that way:</p>') +
    '<div class="rules">' + rules.map(function(x){ return '<div class="rule"><span class="i">' + ic(x[0], 20) + '</span><span><b>' + x[1] + '</b><span>' + x[2] + '</span></span></div>'; }).join('') + '</div>' +
    '<p class="small">Breaking the rules can get videos removed and accounts suspended. <a class="link" href="#/doc/guidelines">Read the full guidelines</a></p>' +
    (view ? '' : '<label class="row" style="gap:12px;cursor:pointer;font-size:14px"><input type="checkbox" class="check" id="agree"> I agree to follow the community guidelines</label>' +
    '<button class="btn acc" data-act="guidelines-done" id="gdone" disabled style="margin-top:auto">Agree and start watching</button>') + '</div>';
});
screen('doc', 'Legal page', { chrome: false }, function(r){
  var k = r.parts[1] || 'terms'; var names = { terms: 'Terms of use', privacy: 'Privacy policy', guidelines: 'Full community guidelines' };
  return '<div class="ob">' + topbar(names[k] || 'Document') + '<span class="tag later" style="align-self:flex-start">Text to be supplied by Dumo The Fame</span>' +
    [1,2,3,4,5,6].map(function(i){ return '<div style="display:flex;flex-direction:column;gap:6px"><div style="height:14px;width:' + (40 + i * 7) + '%;background:var(--panel);border-radius:4px"></div><div style="height:10px;background:var(--panel);border-radius:4px"></div><div style="height:10px;background:var(--panel);border-radius:4px;width:92%"></div><div style="height:10px;background:var(--panel);border-radius:4px;width:70%"></div></div>'; }).join('') + '</div>';
});

/* ---- feed ---- */
function feedList(r){
  if (r.parts[0] === 'watch'){
    var v = findVideo(r.parts[1]); if (!v) return [];
    var list = allVideos().filter(function(x){ return x.c === v.c && visible(x); });
    var i = list.indexOf(v); return list.slice(i).concat(list.slice(0, i));
  }
  var tab = r.q.tab || 'foryou';
  var vids = allVideos().filter(visible);
  if (tab === 'following') return S.videos.filter(function(v){ return visible(v) && isFollowing(v.c); });
  if (tab === 'mzansi') return vids.slice().sort(function(a, b){ return b.views - a.views; });
  // For You: newest + most liked (simple ranking, per brief). User's own fresh posts lead.
  var fresh = S.mine.filter(function(v){ return v.fresh; });
  return fresh.concat(S.videos.filter(visible).slice().sort(function(a, b){ return (b.likes / 1000 - ago(b)) - (a.likes / 1000 - ago(a)); }));
}
function ago(v){ var m = /^(\d+)(h|d|w|mo)$/.exec(v.ago || ''); if (!m) return 0; return +m[1] * ({ h: 1, d: 24, w: 168, mo: 720 })[m[2]] / 6; }
function vidHTML(v, cls){
  return '<div class="vid ' + (cls || '') + '"><div class="scene" style="' + scene(v) + (S.saver ? ';filter:blur(1.2px) saturate(.85)' : '') + '">' +
    '<i class="blob" style="width:260px;height:260px;left:-40px;top:120px;background:' + v.g[1] + '"></i><i class="blob" style="width:200px;height:200px;right:-30px;top:360px;background:' + v.g[2] + ';animation-delay:-3s"></i></div>' +
    '<div class="ph">Creator video plays here · ' + v.dur + '<b>' + (S.saver ? 'Data Saver stream · 360p' : 'HD stream · 720p') + '</b></div></div>';
}
screen('feed', 'Home feed', { tab: 'home', after: afterFeed }, feedScreen);
screen('watch', 'Watch video', { tab: 'home', after: afterFeed }, feedScreen);
function feedScreen(r){
  var watch = r.parts[0] === 'watch', tab = r.q.tab || 'foryou';
  var list = feedList(r);
  if (!watch) S.idx = Math.min(S.idx, Math.max(0, list.length - 1)); else S.idx = 0;
  var v = list[S.idx];
  var tabs = '<div class="f-tabs" role="tablist"><button role="tab" data-tab="following" class="' + (tab === 'following' ? 'on' : '') + '">Following</button><button role="tab" data-tab="foryou" class="' + (tab === 'foryou' ? 'on' : '') + '">For You</button>' +
    (S.later ? '<button role="tab" data-tab="mzansi" class="' + (tab === 'mzansi' ? 'on' : '') + '">Mzansi</button>' : '') + '</div>';
  var top = watch
    ? '<div class="f-top"><button class="iconbtn" style="background:rgba(0,0,0,.4)" data-act="back" aria-label="Back">' + ic('back', 22) + '</button>' + saverPill() + '</div>'
    : '<div class="f-top"><span class="logo">dumo</span>' + saverPill() + '</div>' + (S.saver ? '<div class="f-note">Data Saver · about 4 MB per min</div>' : '<div class="f-note">HD · about 12 MB per min</div>') + tabs;
  var body;
  if (!v){
    body = '<div class="empty" style="position:absolute;inset:0;justify-content:center;z-index:5">' +
      (tab === 'following' ? '<span class="ill">' + ic('user', 34) + '</span><b>Follow creators to fill this tab</b><span>Videos from people you follow show up here, newest first.</span><button class="btn acc sm" data-go="#/discover" style="padding:0 18px">Find creators</button>'
                           : '<span class="ill">' + ic('play', 30) + '</span><b>No videos yet</b><span>Be the first to post.</span>') + '</div>';
  } else body = vidHTML(v, 'cur');
  var coach = (!FRAME && S.coach && !watch) ? '<div class="coach" data-act="coach-off"><div class="hand">' + ic('up', 46) + '</div><b style="font-size:20px">Swipe up for the next video</b><span class="sub">Double-tap to like. Tap to pause.</span><button class="btn acc sm" style="padding:0 22px;margin-top:8px">Got it</button></div>' : '';
  var off = S.offline ? '<div class="banner" role="status">' + ic('offline', 20) + '<span><b>You’re offline.</b> Showing videos saved on your phone. We’ll refresh when you’re back.</span></div>' : '';
  return '<div class="feed' + (S.paused ? ' paused' : '') + '" id="feed" aria-label="Video feed">' + body + '<div class="shade-t"></div><div class="shade-b"></div>' + top + off +
    (v ? '<div class="nav-v"><button data-act="prev" aria-label="Previous video">' + ic('up', 18) + '</button><button data-act="next" aria-label="Next video">' + ic('down', 18) + '</button></div><div id="overlay">' + overlayHTML(v) + '</div>' : '') + coach + '</div>';
}
function saverPill(){ return '<button class="pill' + (S.saver ? ' on' : '') + '" data-act="saver" aria-pressed="' + S.saver + '">' + ic('saver', 16) + (S.saver ? 'Data saver on' : 'Data saver off') + '</button>'; }
function overlayHTML(v){
  var c = creator(v.c), mine = v.c === S.me.handle, liked = !!S.liked[v.id];
  var fol = isFollowing(v.c);
  return '<div class="rail">' +
    '<div class="avwrap"><button data-go="' + (mine ? '#/me' : '#/creator/' + v.c) + '" aria-label="Open ' + esc(c.name) + '’s profile" style="min-height:0">' + avatar(v.c, 50).replace('class="av"', 'class="av" style="border:2px solid #fff"') + '</button>' +
    (mine ? '' : '<button class="plusf' + (fol ? ' done' : '') + '" data-act="follow" data-h="' + v.c + '" aria-label="' + (fol ? 'Following' : 'Follow') + ' @' + v.c + '">' + ic(fol ? 'check' : 'plus', 14, ' stroke-width="3"') + '</button>') + '</div>' +
    '<button data-act="like" class="' + (liked ? 'liked' : '') + '" aria-pressed="' + liked + '" aria-label="Like">' + ic('heart', 34) + '<span>' + short(v.likes + (liked ? 1 : 0)) + '</span></button>' +
    '<button data-act="sheet" data-s="comments" aria-label="Comments">' + ic('comment', 32) + '<span>' + short(v.comments + (S.comments[v.id] || []).length) + '</span></button>' +
    (mine ? '' : '<button data-act="sheet" data-s="gift" aria-label="Send a gift" style="color:var(--accent)">' + ic('gift', 32) + '<span>Gift</span></button>') +
    '<button data-act="sheet" data-s="share" aria-label="Share">' + ic('share', 30) + '<span>Share</span></button>' +
    (mine ? '<button data-act="sheet" data-s="video" aria-label="Video options">' + ic('more', 30) + '<span>More</span></button>' : '') + '</div>' +
    '<div class="meta"><div class="h"><a href="' + (mine ? '#/me' : '#/creator/' + v.c) + '" style="color:inherit;text-decoration:none">@' + esc(v.c) + '</a>' + (c.founding ? '<span class="badge">Founding Creator</span>' : '') + '</div>' +
    '<p>' + capHTML(v.cap) + '</p><span class="snd">' + ic('lang', 14) + esc(v.lang) + (v.sub ? ' · ' + esc(v.sub) : '') + ' · ' + esc(v.ago) + ' ago</span>' +
    '<span class="snd">' + ic('music', 14) + 'Original sound · ' + esc(v.c) + '</span></div>' +
    '<div class="progress"><i></i></div>';
}
var feedBusy = false;
function curVideo(){ var l = feedList(parse()); return l[S.idx]; }
function step(d){
  var r = parse(), list = feedList(r); if (!list.length || feedBusy) return;
  var ni = S.idx + d;
  if (ni < 0) return;
  if (ni >= list.length) { toast('You’re all caught up. Starting again from the top.'); ni = 0; }
  var feed = $('#feed'); if (!feed) return;
  feedBusy = true;
  var old = $('.vid.cur', feed);
  var tmp = document.createElement('div'); tmp.innerHTML = vidHTML(list[ni]); var nv = tmp.firstChild;
  nv.style.transform = 'translateY(' + (d * 100) + '%)'; nv.style.transition = 'none';
  feed.insertBefore(nv, feed.firstChild); void nv.offsetWidth;
  nv.style.transition = ''; nv.style.transform = 'translateY(0)'; nv.classList.add('cur');
  if (old){ old.classList.remove('cur'); old.style.transform = 'translateY(' + (-d * 100) + '%)'; }
  S.idx = ni; S.paused = false; feed.classList.remove('paused');
  $('#overlay').innerHTML = overlayHTML(list[ni]);
  setTimeout(function(){ if (old) old.remove(); feedBusy = false; }, 360);
}
function afterFeed(){
  var feed = $('#feed'); if (!feed) return;
  var y0 = null, moved = false, lastTap = 0, tapT;
  feed.addEventListener('pointerdown', function(e){ if (e.target.closest('button,a,.coach')) return; y0 = e.clientY; moved = false; });
  feed.addEventListener('pointermove', function(e){ if (y0 !== null && Math.abs(e.clientY - y0) > 10) moved = true; });
  feed.addEventListener('pointerup', function(e){
    if (y0 === null) return; var dy = e.clientY - y0; y0 = null;
    if (Math.abs(dy) > 50) { step(dy < 0 ? 1 : -1); return; }
    if (moved) return;
    var now = Date.now();
    if (now - lastTap < 280){ clearTimeout(tapT); lastTap = 0; doubleLike(e); return; }
    lastTap = now;
    tapT = setTimeout(function(){ S.paused = !S.paused; feed.classList.toggle('paused', S.paused); var p = $('.playicon', feed); if (p) p.remove(); if (S.paused){ var d = document.createElement('div'); d.className = 'playicon'; d.innerHTML = ic('play', 34); feed.appendChild(d); } }, 290);
  });
  var wheelLock = 0;
  feed.addEventListener('wheel', function(e){ e.preventDefault(); var t = Date.now(); if (t - wheelLock < 700 || Math.abs(e.deltaY) < 12) return; wheelLock = t; step(e.deltaY > 0 ? 1 : -1); }, { passive: false });
}
function doubleLike(e){
  var v = curVideo(); if (!v) return;
  if (!S.liked[v.id]){ S.liked[v.id] = true; $('#overlay').innerHTML = overlayHTML(v); }
  var feed = $('#feed'), r = feed.getBoundingClientRect();
  var h = document.createElement('div'); h.innerHTML = ic('heart', 96);
  h.style.cssText = 'position:absolute;z-index:8;pointer-events:none;color:#E4572E;left:' + (e.clientX - r.left - 48) + 'px;top:' + (e.clientY - r.top - 48) + 'px;transition:all .7s ease;';
  h.firstChild.style.fill = '#E4572E'; feed.appendChild(h);
  requestAnimationFrame(function(){ h.style.transform = 'translateY(-60px) scale(1.2)'; h.style.opacity = '0'; });
  setTimeout(function(){ h.remove(); }, 750);
}

/* ---- discover / search / hashtag ---- */
function thumb(v, opts){
  opts = opts || {};
  return '<button class="thumb" data-go="#/watch/' + v.id + '" aria-label="Play: ' + esc(v.cap) + '"><span class="sc" style="' + scene(v) + '"></span>' +
    (opts.cap ? '<span class="cap">' + esc(v.cap) + '</span>' : '') + '<span>' + ic('play', 12) + short(v.views) + '</span></button>';
}
screen('discover', 'Discover', { tab: 'discover' }, function(){
  var cr = Object.keys(CREATORS).filter(function(h){ return S.blocked.indexOf(h) < 0; });
  return '<div class="pad"><h1 class="h1">Discover</h1>' +
    '<button class="search" data-go="#/search">' + ic('search', 20) + '<span>Search creators, videos or #hashtags</span></button>' +
    '<div class="between"><h2 class="h2">Trending hashtags</h2></div>' +
    '<div class="tagrow">' + HASHTAGS.slice(0, 6).map(function(t){ return '<a class="htag" href="#/tag/' + t.t + '" style="color:inherit;text-decoration:none"><i>#</i><span>' + t.t + '<small>' + t.v + '</small></span></a>'; }).join('') + '</div>' +
    '<h2 class="h2">Creators to follow</h2><div class="creators">' + cr.map(function(h){ var c = CREATORS[h], f = isFollowing(h);
      return '<div class="ccard"><a href="#/creator/' + h + '" style="color:inherit;text-decoration:none;display:flex;flex-direction:column;align-items:center;gap:6px">' + avatar(h, 60) + '<b>' + esc(c.name) + '</b><small>' + short(c.followers) + ' followers</small></a>' +
      '<button class="btn sm ' + (f ? 'ghost' : 'acc') + '" style="width:100%" data-act="follow" data-h="' + h + '">' + (f ? 'Following' : 'Follow') + '</button></div>'; }).join('') + '</div>' +
    '<h2 class="h2">Popular in Mzansi this week</h2><div class="thumbs">' + S.videos.filter(visible).slice().sort(function(a, b){ return b.views - a.views; }).map(function(v){ return thumb(v, { cap: true }); }).join('') + '</div></div>';
});
screen('search', 'Search results', { tab: 'discover', after: function(){ var i = $('#q'); if (!FRAME && i){ i.focus(); i.setSelectionRange(i.value.length, i.value.length); } if (i) i.addEventListener('input', function(){ history.replaceState(null, '', hashOf('search', Object.assign(parse().q, { q: i.value }))); $('#results').innerHTML = results(i.value, parse().q.t || 'top'); }); } }, function(r){
  var q = r.q.q || '', t = r.q.t || 'top';
  return '<div class="pad" style="gap:14px"><div class="hdr"><button class="iconbtn" data-act="back" aria-label="Back">' + ic('back', 22) + '</button><label class="search" style="flex:1">' + ic('search', 20) + '<input id="q" type="search" placeholder="Search creators, videos, #hashtags" value="' + esc(q) + '" aria-label="Search"></label></div>' +
    '<div class="vtabs" role="tablist">' + [['top','Top'],['creators','Creators'],['videos','Videos'],['tags','Hashtags']].map(function(x){ return '<button role="tab" data-act="stab" data-t="' + x[0] + '" class="' + (t === x[0] ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div>' +
    '<div id="results">' + results(q, t) + '</div></div>';
});
function results(q, t){
  var s = q.trim().toLowerCase().replace(/^[@#]/, '');
  if (!s) return '<p class="section-t" style="margin:8px 0">Recent searches</p>' + ['thandi', '#DumoChallenge', 'kota'].map(function(x){ return '<button class="li" data-act="setq" data-q="' + x + '">' + ic('search', 18) + '<span class="t"><b>' + x + '</b></span>' + ic('x', 16) + '</button>'; }).join('');
  var crs = Object.keys(CREATORS).filter(function(h){ var c = CREATORS[h]; return S.blocked.indexOf(h) < 0 && (h.indexOf(s) >= 0 || c.name.toLowerCase().indexOf(s) >= 0); });
  var vids = S.videos.filter(function(v){ return visible(v) && v.cap.toLowerCase().indexOf(s) >= 0; });
  var tags = HASHTAGS.filter(function(h){ return h.t.toLowerCase().indexOf(s) >= 0; });
  var crHTML = crs.map(function(h){ var c = CREATORS[h], f = isFollowing(h); return '<div class="li"><a href="#/creator/' + h + '" class="row" style="flex:1;min-width:0;color:inherit;text-decoration:none">' + avatar(h, 46) + '<span class="t"><b>' + esc(c.name) + '</b><span>@' + h + ' · ' + short(c.followers) + ' followers</span></span></a><button class="btn sm ' + (f ? 'ghost' : 'acc') + '" style="padding:0 14px" data-act="follow" data-h="' + h + '">' + (f ? 'Following' : 'Follow') + '</button></div>'; }).join('');
  var tagHTML = tags.map(function(h){ return '<a class="li" href="#/tag/' + h.t + '" style="color:inherit;text-decoration:none"><span class="iconbtn" style="color:var(--accent);font-weight:800">#</span><span class="t"><b>#' + h.t + '</b><span>' + h.v + ' · ' + h.n.toLocaleString('en-ZA') + ' videos</span></span>' + ic('chev', 18) + '</a>'; }).join('');
  var vidHTML_ = vids.length ? '<div class="thumbs" style="margin-top:6px">' + vids.map(function(v){ return thumb(v, { cap: true }); }).join('') + '</div>' : '';
  var none = '<div class="empty"><span class="ill">' + ic('search', 30) + '</span><b>No results for “' + esc(q) + '”</b><span>Check the spelling or try a hashtag like #DumoChallenge.</span></div>';
  if (t === 'creators') return crHTML || none;
  if (t === 'videos') return vidHTML_ || none;
  if (t === 'tags') return tagHTML || none;
  var out = (crHTML ? '<p class="section-t" style="margin:8px 0 0">Creators</p>' + crHTML : '') + (tagHTML ? '<p class="section-t" style="margin:14px 0 0">Hashtags</p>' + tagHTML : '') + (vidHTML_ ? '<p class="section-t" style="margin:14px 0 6px">Videos</p>' + vidHTML_ : '');
  return out || none;
}
screen('tag', 'Hashtag page', { tab: 'discover' }, function(r){
  var t = r.parts[1] || 'DumoChallenge', h = HASHTAGS.filter(function(x){ return x.t.toLowerCase() === t.toLowerCase(); })[0] || { t: t, v: 'New hashtag', n: 0 };
  var vids = allVideos().filter(function(v){ return visible(v) && v.cap.toLowerCase().indexOf('#' + t.toLowerCase()) >= 0; });
  return '<div class="pad">' + topbar('#' + esc(h.t), { right: '<button class="iconbtn" data-act="sheet" data-s="share" aria-label="Share hashtag">' + ic('share', 20) + '</button>' }) +
    '<div class="row" style="gap:14px"><span class="iconbtn" style="width:72px;height:72px;border-radius:20px;color:var(--accent);font:800 34px var(--display)">#</span><div><b style="font-size:17px">' + h.v + '</b><p class="sub" style="font-size:13px">' + (h.n || vids.length).toLocaleString('en-ZA') + ' videos</p></div></div>' +
    '<button class="btn acc" data-act="use-tag" data-t="' + esc(h.t) + '">' + ic('plus', 20) + 'Post with #' + esc(h.t) + '</button>' +
    (vids.length ? '<div class="thumbs">' + vids.map(function(v){ return thumb(v, { cap: true }); }).join('') + '</div>' : '<div class="empty"><b>No videos yet</b><span>Be the first to use this hashtag.</span></div>') + '</div>';
});

/* ---- creator profile ---- */
screen('creator', 'Creator profile', { tab: 'home' }, function(r){
  var h = r.parts[1] || 'thandi.moves'; if (h === S.me.handle) return SCREENS.me.fn(r);
  var c = creator(h), f = isFollowing(h), blocked = S.blocked.indexOf(h) >= 0;
  var vids = allVideos().filter(function(v){ return v.c === h && visible(v); });
  var filler = [0,1,2,3].map(function(i){ return Object.assign({}, vids[0] || VIDEOS[0], { id: (vids[0] || VIDEOS[0]).id, views: [45000, 21000, 88000, 13000][i], g: [c.col + '', '#3A2E20', '#F2A93B'] }); });
  var head = '<div class="between" style="margin:-6px 0 -8px"><button class="iconbtn" data-act="back" aria-label="Back">' + ic('back', 22) + '</button><b>@' + esc(h) + '</b><button class="iconbtn" data-act="sheet" data-s="profile-more" aria-label="More options">' + ic('more', 22) + '</button></div>';
  if (blocked) return '<div class="pad">' + head + '<div class="empty" style="padding-top:80px"><span class="ill">' + ic('block', 32) + '</span><b>You blocked @' + esc(h) + '</b><span>You won’t see their videos or comments, and they can’t find your profile.</span><button class="btn ghost sm" style="padding:0 20px" data-act="unblock" data-h="' + h + '">Unblock</button></div></div>';
  return '<div class="pad">' + head +
    '<div class="prof">' + avatar(h, 96).replace('class="av"', 'class="av" style="border:3px solid var(--accent)"') + '<h2>' + esc(c.name) + '</h2>' +
    '<span class="sub" style="font-size:14px">@' + esc(h) + ' · ' + esc(c.place) + '</span>' +
    '<div class="row" style="justify-content:center;gap:6px;flex-wrap:wrap">' + (c.founding ? '<span class="badge">Founding Creator</span>' : '') + '<span class="chip">' + esc(c.langs) + '</span></div>' +
    '<p style="margin:4px 0 0;font-size:14px;max-width:300px">' + esc(c.bio) + '</p></div>' +
    '<div class="stats"><div><b>' + short(c.followers + (f ? 1 : 0)) + '</b><span>Followers</span></div><div><b>' + c.likes + '</b><span>Likes</span></div><div><b>' + c.views + '</b><span>Views</span></div></div>' +
    '<div class="row"><button class="btn ' + (f ? 'ghost' : 'light') + '" data-act="follow" data-h="' + h + '" aria-pressed="' + f + '">' + (f ? ic('check', 18) + 'Following' : 'Follow') + '</button>' +
    (S.later ? '<button class="btn acc later-wrap" data-act="later" data-what="Subscriptions">Subscribe · R29/mo</button>' : '<button class="btn ghost" data-act="sheet" data-s="share" style="width:auto;padding:0 16px" aria-label="Share profile">' + ic('share', 20) + '</button>') + '</div>' +
    (S.later ? '<div class="global later-wrap">' + ic('globe', 26) + '<span><b>Go Global: fans in 14 countries</b>Auto-subtitles on · top abroad: UK, US, Nigeria</span></div>' : '') +
    '<div class="vtabs"><button class="on">Videos</button>' + (S.later ? '<button data-act="later" data-what="Subscribers-only videos">Subscribers only</button>' : '') + '<button data-act="toast" data-msg="' + esc(c.name) + ' keeps liked videos private.">' + ic('lock', 14) + ' Liked</button></div>' +
    '<div class="thumbs">' + vids.concat(filler).map(function(v){ return thumb(v); }).join('') + '</div></div>';
});

/* ---- post ---- */
screen('post', 'Record video', { chrome: false, after: function(){ S.rec = false; } }, function(){
  var d = S.draft.max || 60;
  return '<div class="cam" id="cam"><div class="cam-top"><button class="iconbtn clear" data-act="close-post" aria-label="Close">' + ic('x', 26) + '</button>' +
    '<span class="pill" style="border:none">' + ic('music', 16) + 'Original sound</span><span style="width:44px"></span></div>' +
    '<div class="cam-tools"><button data-act="toast" data-msg="Front and back camera switch">' + ic('flip', 26) + 'Flip</button><button data-act="toast" data-msg="3-second countdown before recording">' + ic('timer', 26) + 'Timer</button></div>' +
    '<div class="ph" style="position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);border:2px dashed rgba(255,255,255,.3);border-radius:16px;padding:12px 16px;color:rgba(255,255,255,.7);font-size:13px;text-align:center">Camera preview<br><span style="font-size:12px;opacity:.7">Vertical 9:16 · up to 60 seconds</span></div>' +
    '<div class="timer" id="rtime" hidden>0:00</div>' +
    '<div class="cam-bottom"><div class="durs" role="radiogroup" aria-label="Maximum length">' + [15, 30, 60].map(function(x){ return '<button role="radio" aria-checked="' + (d === x) + '" data-act="dur" data-d="' + x + '" class="' + (d === x ? 'on' : '') + '">' + x + 's</button>'; }).join('') + '</div>' +
    '<div class="recrow"><button data-act="sheet" data-s="pick"><span class="gal"></span>Upload</button>' +
    '<button class="rec" id="rec" data-act="rec" aria-label="Record"><svg width="92" height="92" viewBox="0 0 92 92"><circle cx="46" cy="46" r="43" fill="none" stroke="#F2A93B" stroke-width="5" stroke-dasharray="270" stroke-dashoffset="270" id="ring"/></svg><i></i></button>' +
    '<span style="opacity:.7;font-size:11px;text-align:center">Tap to record<br>tap again to stop</span></div></div></div>';
});
screen('post/trim', 'Trim to 60 s', { chrome: false, after: function(){ var s = $('#tstart'); if (!s) return; var tot = S.draft.src || 74; var upd = function(){ var a = +s.value; $('#twin').style.left = (a / tot * 100) + '%'; $('#tlbl').textContent = fmt(a) + ' – ' + fmt(a + 60) + ' · 60 s selected'; }; s.addEventListener('input', upd); upd(); } }, function(){
  var tot = S.draft.src || 74; var g = S.draft.g || ['#3B1F33', '#B07CE8'];
  return '<div class="ob">' + topbar('Trim your video') + '<p class="sub" style="margin-top:-6px">This clip is ' + fmt(tot) + '. Dumo videos can be up to 60 seconds. Drag to pick the part to keep.</p>' +
    '<div style="aspect-ratio:9/16;max-height:360px;border-radius:16px;align-self:center;width:200px;background:linear-gradient(160deg,' + g[1] + ',' + g[0] + ');display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.8);font-size:12px">Preview</div>' +
    '<div class="trim">' + Array.from({ length: 10 }, function(_, i){ return '<i style="background:linear-gradient(160deg,' + g[1] + ',' + g[0] + ');opacity:' + (0.6 + (i % 3) * 0.15) + '"></i>'; }).join('') + '<div class="win" id="twin" style="width:' + (60 / tot * 100) + '%"></div></div>' +
    '<label class="field" for="tstart">Start point<input type="range" id="tstart" min="0" max="' + (tot - 60) + '" value="0" step="1" style="accent-color:#F2A93B"></label>' +
    '<p class="small" id="tlbl"></p><button class="btn acc" data-go="#/post/details" style="margin-top:auto">Next</button></div>';
});
function fmt(s){ return Math.floor(s / 60) + ':' + String(Math.round(s % 60)).padStart(2, '0'); }
screen('post/details', 'Caption & settings', { chrome: false, after: function(){
  var ta = $('#cap'); if (!ta) return; var cnt = $('#capn');
  ta.addEventListener('input', function(){ S.draft.cap = ta.value; cnt.textContent = ta.value.length + '/150'; });
  $('#plang').addEventListener('change', function(e){ S.draft.lang = e.target.value; });
  $$('[data-tog]').forEach(function(x){ x.addEventListener('change', function(){ S.draft[x.dataset.tog] = x.checked; if (x.dataset.tog === 'wifi') S.wifiUpload = x.checked; }); });
} }, function(){
  var d = S.draft, g = d.g || ['#3A2A1A', '#5B3A6E'];
  var tog = function(key, title, desc, checked, dis, laterOnly){
    return '<label' + (laterOnly ? ' class="later-wrap"' : '') + '><span class="t"><strong>' + title + '</strong><span>' + desc + '</span></span><input type="checkbox" class="switch" data-tog="' + key + '"' + (checked ? ' checked' : '') + (dis ? ' disabled' : '') + '></label>';
  };
  return '<div class="pad" style="padding-bottom:24px">' + topbar('Post a video') +
    '<div class="row" style="align-items:stretch;gap:12px"><div style="width:100px;flex:none;aspect-ratio:9/16;border-radius:12px;background:linear-gradient(160deg,' + g[1] + ',' + g[0] + ');display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font-size:12px;color:rgba(255,255,255,.85);position:relative">' + ic('play', 22) + '<span style="margin-top:4px">' + fmt(d.dur || 24) + '</span><button class="tag" style="position:absolute;bottom:6px;background:rgba(0,0,0,.5);color:#fff;border:none" data-act="toast" data-msg="Choose a cover frame from your video">Cover</button></div>' +
    '<label class="field" for="cap" style="flex:1;min-width:0">Caption<textarea class="textarea" id="cap" maxlength="150" style="height:100%;min-height:150px">' + esc(d.cap) + '</textarea><span class="small" id="capn" style="text-align:right">' + d.cap.length + '/150</span></label></div>' +
    '<div class="tagrow">' + ['DumoChallenge', 'Mzansi', 'Amapiano', 'KasiEats', 'Durban'].map(function(t){ return '<button class="chip" style="padding:6px 10px;border-radius:999px;font-size:13px" data-act="addtag" data-t="' + t + '">#' + t + '</button>'; }).join('') + '</div>' +
    '<label class="field" for="plang">Video language<select class="select" id="plang">' + LANGS.map(function(l){ return '<option' + (l === d.lang ? ' selected' : '') + '>' + l + '</option>'; }).join('') + '</select></label>' +
    '<div class="toggles">' +
      tog('earn', 'Earn from this video', canEarn() ? 'Views and gifts pay into your wallet (test money in the pilot)' : 'Earning unlocks when you turn 18', canEarn() && d.earn, !canEarn()) +
      tog('comments', 'Allow comments', 'People can comment on this video', d.comments) +
      tog('wifi', 'Upload on Wi-Fi only', 'Saves your mobile data. We’ll post when you’re on Wi-Fi.', S.wifiUpload) +
      (S.later ? tog('global', 'Go Global subtitles', 'Auto-translate captions for fans abroad', d.global, false, true) + tog('subs', 'Subscribers only', 'Exclusive for your paying fans', d.subs, false, true) + tog('cross', 'Also post to TikTok and Instagram', 'With a “Watch on Dumo” link', d.cross, false, true) : '') +
    '</div>' +
    '<p class="small">Everyone on Dumo can watch this video. By posting you confirm it follows the <a class="link" href="#/guidelines?from=settings">community guidelines</a>.</p>' +
    '<button class="btn acc" data-act="publish">Post to Dumo</button></div>';
});
screen('post/uploading', 'Uploading', { chrome: false, after: function(){
  var p = 0, bar = $('#upbar'), pct = $('#uppct'), st = $$('.steps > div');
  var set = function(){ bar.style.width = p + '%'; pct.textContent = p + '%'; st.forEach(function(s, i){ s.classList.toggle('done', p >= [5, 55, 85, 100][i]); }); };
  if (FRAME){ p = 64; set(); return; }
  every(function(){ p = Math.min(100, p + 4); set(); if (p >= 100){ clearTimers(); later(finishPost, 400); } }, 110);
} }, function(){
  return '<div class="ob" style="justify-content:center">' +
    '<div class="center" style="display:flex;flex-direction:column;align-items:center;gap:10px"><span class="iconbtn" style="width:72px;height:72px;border-radius:22px;color:var(--accent)">' + ic('share', 34) + '</span><h2 class="h1" style="font-size:24px">Posting your video</h2><p class="sub">You can keep using Dumo. We’ll let you know when it’s live.</p></div>' +
    '<div class="between"><b id="uppct">0%</b><span class="small">' + (S.wifiUpload ? 'On Wi-Fi' : 'On mobile data') + '</span></div><div class="prog"><i id="upbar" style="width:0"></i></div>' +
    '<div class="steps"><div><span class="dot">' + ic('check', 14) + '</span>Uploading</div><div><span class="dot">' + ic('check', 14) + '</span>Making HD and Data Saver versions</div><div><span class="dot">' + ic('check', 14) + '</span>Safety check</div><div><span class="dot">' + ic('check', 14) + '</span>Live on Dumo</div></div>' +
    '<button class="btn ghost" data-go="#/feed" style="margin-top:auto">Keep watching</button></div>';
});
function finishPost(){
  var d = S.draft, id = 'n' + Date.now().toString(36);
  S.mine.unshift({ id: id, c: S.me.handle, cap: d.cap || 'New video', lang: d.lang, likes: 0, comments: 0, views: 0, g: ['#3A2A1A', '#5B3A6E', '#F2A93B'], ago: 'now', dur: fmt(d.dur || 24), fresh: true });
  S.idx = 0; go('#/feed');
  toast(canEarn() && d.earn ? 'Your video is live. You’ll earn from every qualified view.' : 'Your video is live.', 'check');
}

/* ---- wallet ---- */
screen('wallet', 'Wallet', { tab: 'wallet' }, function(){
  var head = '<div class="between"><h1 class="h1">Wallet</h1><span class="tag test">TEST MONEY</span></div>' +
    '<div class="testbar">' + ic('info', 20) + '<span><b>Pilot wallet.</b> Earnings here use test money so we can check the maths. No real payments can be made yet.</span></div>';
  if (!canEarn()) return '<div class="pad">' + head +
    '<div class="card locked">' + ic('lock', 28) + '<b style="font-size:20px;margin-top:6px">Earning unlocks at 18</b><span class="sub" style="font-size:14px">Keep posting. When you turn 18 you can switch on earnings for your videos.</span></div>' +
    coinsRow() + '</div>';
  var weeks = [212.4, 318.9, 286.2, 467.0], max = Math.max.apply(null, weeks);
  var cash = S.later
    ? '<button class="btn dark later-wrap" data-act="sheet" data-s="cashout" style="margin-top:10px">' + ic('bolt', 18) + 'Cash out now with PayShap</button><span style="font-size:12px;text-align:center">To Capitec · 082 *** 4417 · arrives in seconds</span>'
    : '<button class="btn dark" aria-disabled="true" data-act="toast" data-msg="Cash out with PayShap comes after the pilot." style="margin-top:10px;opacity:.85">' + ic('lock', 18) + 'Cash out · coming after the pilot</button>';
  return '<div class="pad">' + head +
    '<div class="card"><span style="font-size:13px;font-weight:600">Earnings balance</span><span class="big" id="bal">' + money(S.balance) + '</span><span style="font-size:13px">Updated a few minutes ago</span>' + cash + '</div>' +
    '<div class="between"><h2 class="h2">This month: ' + money(S.viewsR + S.giftsR + S.subsR) + '</h2><button class="link" data-act="sheet" data-s="explain" style="font-size:13px">How it works</button></div>' +
    '<div class="grid3"><button class="tile" data-act="sheet" data-s="explain" style="text-align:left"><span>Views</span><b>' + money(S.viewsR) + '</b><small>' + S.qviews.toLocaleString('en-ZA').replace(/ /g, ',') + ' qualified</small></button>' +
    '<div class="tile"><span>Gifts</span><b>' + money(S.giftsR) + '</b><small>' + S.fans + ' fans · your 70%</small></div>' +
    '<div class="tile"><span>Subscribers</span><b>' + money(S.subsR) + '</b><small>6 test subs</small></div></div>' +
    '<h2 class="h2">Earnings by week</h2><div class="bars" role="img" aria-label="Weekly earnings: ' + weeks.map(function(w, i){ return 'week ' + (i+1) + ' ' + money(w); }).join(', ') + '">' +
    weeks.map(function(w, i){ return '<div class="' + (i === 3 ? 'cur' : '') + '"><em>' + money(w).replace(/\.\d\d$/, '') + '</em><i style="height:' + Math.round(w / max * 78) + '%"></i>Wk ' + (i+1) + '</div>'; }).join('') + '</div>' +
    coinsRow() +
    '<h2 class="h2">Activity</h2><div>' + S.cashed.map(function(c){ return '<div class="tx"><span>Cash out · PayShap<small>' + c.when + ' · prototype only</small></span><span class="plus" style="color:var(--fg)">−' + money(c.a) + '</span></div>'; }).join('') +
    txs().map(function(t){ return '<div class="tx"><span>' + t.t + '<small>' + t.s + '</small></span><span class="plus">+' + money(t.a) + '</span></div>'; }).join('') + '</div></div>';
});
function coinsRow(){ return '<a class="li list" href="#/coins" style="color:inherit;text-decoration:none;padding:0 14px"><span class="coin">D</span><span class="t"><b>Your coins: ' + S.coins + '</b><span>Free test coins for sending gifts</span></span>' + ic('chev', 18) + '</a>'; }
screen('coins', 'Test coins', { tab: 'wallet' }, function(){
  return '<div class="pad">' + topbar('Coins', { right: '<span class="tag test">TEST</span>' }) +
    '<div class="card" style="align-items:center;text-align:center;background:linear-gradient(160deg,#F2A93B,#E08E1B)"><span class="coin" style="width:46px;height:46px;font-size:20px">D</span><span class="big" id="coinbal">' + S.coins + '</span><span style="font-weight:600">test coins</span></div>' +
    '<button class="btn acc" data-act="free-coins">' + ic('plus', 20) + 'Add 500 free test coins</button>' +
    '<p class="small center">During the pilot coins are free and have no cash value. Buying coins comes in a later phase.</p>' +
    '<h2 class="h2">Gift prices</h2><div class="list">' + GIFTS.map(function(g){ return '<div class="li"><span style="font-size:26px">' + g.e + '</span><span class="t"><b>' + g.n + '</b><span>' + g.c + ' coins = ' + money(g.c * COIN_RAND) + ' · creator gets ' + money(g.c * COIN_RAND * CREATOR_SHARE) + '</span></span></div>'; }).join('') + '</div>' +
    '<h2 class="h2">Gifts you sent</h2>' + (S.giftsSent.length ? '<div>' + S.giftsSent.map(function(g){ return '<div class="tx"><span>' + g.n + ' to @' + esc(g.to) + '<small>just now</small></span><span>−' + g.c + ' coins</span></div>'; }).join('') + '</div>' : '<p class="sub" style="font-size:14px">No gifts yet. Tap Gift on any video to support a creator.</p>') + '</div>';
});

/* ---- my profile & settings ---- */
screen('me', 'My profile', { tab: 'me' }, function(){
  var me = S.me, vids = S.mine;
  return '<div class="pad"><div class="between" style="margin:-6px 0 -8px"><span style="width:44px"></span><b>@' + esc(me.handle) + '</b><button class="iconbtn" data-go="#/settings" aria-label="Settings">' + ic('gear', 22) + '</button></div>' +
    '<div class="prof">' + avatar(me.handle, 96).replace('class="av"', 'class="av" style="border:3px solid var(--accent)"') + '<h2>' + esc(me.name) + '</h2>' +
    '<span class="sub" style="font-size:14px">@' + esc(me.handle) + ' · ' + esc(me.city + ', ' + me.province) + '</span>' +
    '<div class="row" style="justify-content:center;gap:6px">' + (me.founding ? '<span class="badge">Founding Creator</span>' : '') + '<span class="chip">' + esc(me.langs) + '</span></div>' +
    '<p style="margin:4px 0 0;font-size:14px;max-width:300px">' + esc(me.bio) + '</p></div>' +
    '<div class="stats"><div><b>' + short(me.followers) + '</b><span>Followers</span></div><div><b>' + me.following + '</b><span>Following</span></div><div><b>' + me.likes + '</b><span>Likes</span></div></div>' +
    '<div class="row"><button class="btn ghost" data-go="#/me/edit">' + ic('edit', 18) + 'Edit profile</button><button class="btn ghost" data-act="sheet" data-s="share">' + ic('share', 18) + 'Share profile</button></div>' +
    (S.later ? '<div class="global later-wrap">' + ic('globe', 26) + '<span><b>Go Global: fans in 9 countries</b>Top abroad: UK, US, Botswana</span></div>' : '') +
    '<div class="vtabs"><button class="on">Videos · ' + vids.length + '</button><button data-act="toast" data-msg="Only you can see videos you liked.">' + ic('lock', 14) + ' Liked</button></div>' +
    '<div class="thumbs"><button class="thumb" data-go="#/post" style="background:var(--panel);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;color:var(--accent);font-weight:700;font-size:13px;border:2px dashed var(--field)">' + ic('plus', 28) + 'Post</button>' +
    vids.map(function(v){ return thumb(v); }).join('') + '</div></div>';
});
screen('me/edit', 'Edit profile', { tab: 'me' }, function(){
  var me = S.me;
  return '<div class="pad">' + topbar('Edit profile', { right: '<button class="link" data-act="save-profile" style="padding:10px">Save</button>' }) +
    '<div style="align-self:center;position:relative">' + avatar(me.handle, 96) + '<button class="cam-b" data-act="photo" aria-label="Change photo" style="position:absolute;right:-2px;bottom:-2px;width:36px;height:36px;border-radius:50%;background:var(--accent);color:var(--ink);display:flex;align-items:center;justify-content:center">' + ic('camera', 18) + '</button></div>' +
    '<label class="field" for="ename">Name<input class="input" id="ename" value="' + esc(me.name) + '" maxlength="30"></label>' +
    '<label class="field" for="ehandle">Username<div class="handle"><span style="color:var(--muted)">@</span><input id="ehandle" value="' + esc(me.handle) + '" maxlength="24" autocapitalize="off"></div><span class="help">dumo.app/@' + esc(me.handle) + ' · you can change this once every 30 days</span></label>' +
    '<label class="field" for="ebio">Bio<textarea class="textarea" id="ebio" maxlength="80">' + esc(me.bio) + '</textarea></label>' +
    '<div class="row" style="align-items:flex-start"><label class="field" for="ecity" style="flex:1">City or town<input class="input" id="ecity" value="' + esc(me.city) + '"></label>' +
    '<label class="field" for="eprov" style="flex:1.2">Province<select class="select" id="eprov">' + PROVINCES.map(function(p){ return '<option' + (p === me.province ? ' selected' : '') + '>' + p + '</option>'; }).join('') + '</select></label></div>' +
    '<label class="field" for="elang">Languages you post in<input class="input" id="elang" value="' + esc(me.langs) + '"></label></div>';
});
screen('settings', 'Settings', { tab: 'me' }, function(){
  var li = function(href, icon, t, s, extra){ return '<a class="li" href="' + href + '" style="color:inherit;text-decoration:none"><span style="color:var(--muted)">' + ic(icon, 20) + '</span><span class="t"><b>' + t + '</b>' + (s ? '<span>' + s + '</span>' : '') + '</span>' + (extra || '<span class="chev">' + ic('chev', 18) + '</span>') + '</a>'; };
  return '<div class="pad">' + topbar('Settings') +
    '<p class="section-t">Account</p><div class="list">' + li('#/settings', 'phone', 'Cellphone number', '+27 ' + S.me.phone.replace(/^0/, ''), ' ') + li('#/settings', 'cake', 'Date of birth', S.under18 ? '16 years old · earning locked until 18' : S.me.dob + ' · only you can see this', ' ') + '</div>' +
    '<p class="section-t">Data and video</p><div class="list">' + li('#/settings/data-saver', 'saver', 'Data Saver', S.saver ? 'On · about 4 MB per minute' : 'Off · HD up to 12 MB per minute') + li('#/settings', 'lang', 'App language', 'English · more languages coming', ' ') + '</div>' +
    '<p class="section-t">Privacy and safety</p><div class="list">' + li('#/settings/blocked', 'block', 'Blocked accounts', S.blocked.length + ' blocked') + li('#/guidelines?from=settings', 'shield', 'Community guidelines') + li('#/doc/privacy', 'doc', 'Privacy policy') + li('#/doc/terms', 'doc', 'Terms of use') + '</div>' +
    '<p class="section-t">Support</p><div class="list">' + li('#/settings?sheet=problem', 'help', 'Report a problem', 'Send us a message and screenshots') + '</div>' +
    '<div class="list"><button class="li" data-act="sheet" data-s="logout"><span style="color:var(--muted)">' + ic('logout', 20) + '</span><span class="t"><b>Log out</b></span></button>' +
    '<a class="li" href="#/settings/delete" style="color:var(--danger);text-decoration:none">' + ic('trash', 20) + '<span class="t"><b>Delete account</b></span><span class="chev">' + ic('chev', 18) + '</span></a></div>' +
    '<p class="small center">Dumo pilot 0.1.0 (prototype)</p></div>';
});
screen('settings/data-saver', 'Data Saver', { tab: 'me' }, function(){
  return '<div class="pad">' + topbar('Data Saver') +
    '<div class="toggles"><label><span class="t"><strong>Data Saver</strong><span>Plays a lighter video stream. Picture is a little softer.</span></span><input type="checkbox" class="switch" data-act="saver-switch"' + (S.saver ? ' checked' : '') + '></label></div>' +
    '<div class="grid3" style="grid-template-columns:1fr 1fr"><div class="tile" style="' + (S.saver ? 'outline:2px solid var(--accent)' : '') + '"><span>Data Saver</span><b>~4 MB/min</b><small>360p · about R1.20 per 10 min*</small></div><div class="tile" style="' + (!S.saver ? 'outline:2px solid var(--accent)' : '') + '"><span>HD</span><b>~12 MB/min</b><small>up to 720p · about R3.60 per 10 min*</small></div></div>' +
    '<p class="small">*Estimate at R30 per GB. Your network’s price may differ.</p>' +
    '<label class="field" for="preload">Load the next video early<select class="select" id="preload" data-act="preload">' + ['Always', 'Wi-Fi only', 'Never'].map(function(o){ return '<option' + (o === S.preload ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select><span class="help">“Always” starts videos fastest. “Never” uses the least data.</span></label>' +
    '<div class="toggles"><label><span class="t"><strong>Upload on Wi-Fi only</strong><span>Your posts wait until you’re on Wi-Fi</span></span><input type="checkbox" class="switch" data-act="wifi-switch"' + (S.wifiUpload ? ' checked' : '') + '></label></div></div>';
});
screen('settings/blocked', 'Blocked accounts', { tab: 'me' }, function(){
  return '<div class="pad">' + topbar('Blocked accounts') +
    (S.blocked.length ? '<div class="list">' + S.blocked.map(function(h){ return '<div class="li">' + avatar(h, 40) + '<span class="t"><b>@' + esc(h) + '</b><span>Can’t see your videos or find your profile</span></span><button class="btn ghost sm" style="padding:0 14px" data-act="unblock" data-h="' + h + '">Unblock</button></div>'; }).join('') + '</div>'
      : '<div class="empty"><span class="ill">' + ic('block', 30) + '</span><b>No blocked accounts</b><span>When you block someone, they show up here.</span></div>') + '</div>';
});
screen('settings/delete', 'Delete account', { tab: 'me' }, function(){
  return '<div class="pad">' + topbar('Delete account') +
    '<div class="empty" style="padding:10px 0 0"><span class="ill" style="color:var(--danger)">' + ic('trash', 32) + '</span><b>Delete your Dumo account?</b></div>' +
    '<div class="list" style="padding:6px 14px">' + [['Your profile and username', 'user'], ['All ' + S.mine.length + ' of your videos, comments and likes', 'play'], ['Your wallet balance of ' + money(S.balance) + ' (test money)', 'wallet'], ['Your followers and the people you follow', 'heart']].map(function(x){ return '<div class="li" style="min-height:48px">' + ic(x[1], 18) + '<span class="t"><b style="font-weight:500;font-size:14px">' + x[0] + '</b></span></div>'; }).join('') + '</div>' +
    '<p class="small">Everything disappears from Dumo straight away. Backups are wiped within 30 days, as required by POPIA. This can’t be undone.</p>' +
    '<label class="row" style="gap:12px;cursor:pointer;font-size:14px"><input type="checkbox" class="check" id="delok"> I understand my account and videos will be deleted</label>' +
    '<button class="btn danger" data-act="delete-1" id="delbtn" disabled>Delete my account</button><button class="btn ghost" data-act="back">Keep my account</button></div>';
});
screen('settings/deleted', 'Account deleted', { chrome: false }, function(){
  return '<div class="ob" style="justify-content:center"><div class="empty"><span class="ill" style="color:var(--teal)">' + ic('check', 34) + '</span><b>Your account is deleted</b><span>Your profile and videos are no longer on Dumo. Thanks for being part of the pilot.</span></div><button class="btn acc" data-act="restart" style="margin-top:auto">Back to start</button></div>';
});

/* ---------------- sheets ---------------- */
var SHEETS = {
  comments: { title: 'Comments', html: function(){
    var v = curVideo() || {}; var mine = (S.comments[v.id] || []);
    var list = mine.concat(COMMENT_SEED);
    return '<div class="between"><span style="width:44px"></span><b>' + short((v.comments || 0) + mine.length) + ' comments</b><button class="iconbtn clear" data-act="close" aria-label="Close">' + ic('x', 22) + '</button></div>' +
      '<div style="flex:1;overflow:auto;min-height:0">' + list.map(function(c, i){ return '<div class="cmt">' + avatar(c.u, 36) + '<div class="t"><b>' + esc(c.u === S.me.handle ? S.me.name + ' (you)' : '@' + c.u) + '</b>' + esc(c.t) + '<br><small>' + c.ago + ' · <button class="small" data-act="reply" data-u="' + c.u + '">Reply</button>' + (c.u === S.me.handle ? '' : ' · <button class="small" data-act="sheet" data-s="report" data-k="comment">Report</button>') + '</small></div><button class="lk" data-act="clike" aria-label="Like comment">' + ic('heart', 16) + '<span>' + short(c.l) + '</span></button></div>'; }).join('') + '</div>' +
      '<form class="cmt-in" data-form="comment">' + avatar(S.me.handle, 34) + '<input class="input" id="cin" placeholder="Add a comment…" aria-label="Add a comment" maxlength="200" autocomplete="off"><button class="iconbtn" style="background:var(--accent);color:var(--ink);border-radius:50%" aria-label="Send">' + ic('up', 20) + '</button></form>';
  }, tall: true },
  gift: { title: 'Send a gift', html: function(r){
    var v = curVideo() || VIDEOS[0]; var sel = +(r.q.s_g || 1); var g = GIFTS[sel];
    return '<div class="between"><b style="font-size:17px">Send a gift to @' + esc(v.c) + '</b><span class="coins"><span class="coin">D</span>' + S.coins + '</span></div>' +
      '<div class="gifts">' + GIFTS.map(function(x, i){ return '<button class="gift' + (i === sel ? ' sel' : '') + '" data-act="pickgift" data-i="' + i + '" aria-pressed="' + (i === sel) + '"><span class="ic">' + x.e + '</span><span>' + x.n + '</span><b>' + x.c + ' coins</b></button>'; }).join('') + '</div>' +
      '<p class="small center">@' + esc(v.c) + ' receives 70%: ' + money(g.c * COIN_RAND * CREATOR_SHARE) + ' (test money)</p>' +
      (S.coins >= g.c ? '<button class="btn acc" data-act="sendgift" data-i="' + sel + '">Send ' + g.n + ' · ' + g.c + ' coins</button>' : '<button class="btn acc" data-act="free-coins">Not enough coins · Add 500 free test coins</button>') +
      '<button class="btn ghost" data-act="close">Cancel</button>';
  } },
  share: { title: 'Share', html: function(){
    var v = curVideo(); var r = parse(); var isVid = r.parts[0] === 'feed' || r.parts[0] === 'watch';
    var who = isVid && v ? v.c : (r.parts[0] === 'creator' ? r.parts[1] : S.me.handle);
    var url = isVid && v ? 'dumo.app/v/' + v.id : 'dumo.app/@' + who;
    return '<div class="between"><b style="font-size:17px">Share ' + (isVid ? 'video' : 'profile') + '</b><button class="iconbtn clear" data-act="close" aria-label="Close">' + ic('x', 22) + '</button></div>' +
      '<div class="share-row">' + [['WhatsApp', '#25D366', 'wa'], ['Copy link', '#4A3D2C', 'link'], ['Facebook', '#1877F2', 'share'], ['X', '#000', 'share'], ['SMS', '#2BB3A3', 'comment'], ['More', '#4A3D2C', 'more']].map(function(x){ return '<button data-act="shareto" data-to="' + x[0] + '" data-url="' + url + '"><span class="c" style="background:' + x[1] + '">' + ic(x[2], 24) + '</span>' + x[0] + '</button>'; }).join('') + '</div>' +
      '<p class="small">Link: ' + url + ' · opens in the app, or on the web for people without Dumo.</p>' +
      (isVid && v && v.c !== S.me.handle ? '<div class="list"><button class="li" data-act="sheet" data-s="report" data-k="video">' + ic('flag', 20) + '<span class="t"><b>Report video</b></span></button><button class="li" data-act="notint">' + ic('eye', 20) + '<span class="t"><b>Not interested</b><span>See fewer videos like this</span></span></button><button class="li" data-act="sheet" data-s="block" data-h="' + v.c + '">' + ic('block', 20) + '<span class="t"><b>Block @' + esc(v.c) + '</b></span></button></div>' : '');
  } },
  report: { title: 'Report', html: function(r){
    var k = r.q.s_k || (parse().parts[0] === 'creator' ? 'account' : 'video');
    var reasons = ['Nudity or sexual content', 'Violence or dangerous acts', 'Hate speech or symbols', 'Bullying or harassment', 'Spam or scam', 'Child safety (someone under 18 at risk)', 'Copyright or someone else’s video', 'Something else'];
    return '<div class="between"><b style="font-size:17px">Report ' + k + '</b><button class="iconbtn clear" data-act="close" aria-label="Close">' + ic('x', 22) + '</button></div>' +
      '<p class="small" style="margin-top:-6px">Reports are anonymous. The person won’t know it was you.</p>' +
      '<form data-form="report" data-k="' + k + '"><div role="radiogroup" aria-label="Reason">' + reasons.map(function(x, i){ return '<label class="radio-row"><input type="radio" name="rr" value="' + i + '"' + (i === 0 ? ' required' : '') + '>' + x + '</label>'; }).join('') + '</div>' +
      '<label class="field" for="rnote" style="margin-top:12px">Anything else? (optional)<textarea class="textarea" id="rnote" maxlength="300" style="height:70px"></textarea></label>' +
      '<button class="btn acc" style="margin-top:14px">Submit report</button></form>';
  } },
  reported: { title: 'Report sent', html: function(){
    var v = curVideo(); var h = (v && v.c) || parse().parts[1] || '';
    return '<div class="empty" style="padding:16px 0 4px"><span class="ill" style="color:var(--teal)">' + ic('check', 32) + '</span><b>Thanks, we got your report</b><span>Our team will check it, usually within 24 hours. We’ve hidden it from your feed.</span></div>' +
      (h && h !== S.me.handle ? '<button class="btn ghost" data-act="sheet" data-s="block" data-h="' + h + '">' + ic('block', 18) + 'Also block @' + esc(h) + '</button>' : '') + '<button class="btn acc" data-act="close">Done</button>';
  } },
  block: { title: 'Block user', html: function(r){
    var h = r.q.s_h || parse().parts[1] || (curVideo() || {}).c || 'thandi.moves';
    return '<div class="center" style="display:flex;flex-direction:column;align-items:center;gap:8px">' + avatar(h, 64) + '<b style="font-size:18px">Block @' + esc(h) + '?</b></div>' +
      '<div class="list">' + [['eye', 'You won’t see their videos or comments'], ['user', 'They can’t find your profile or see your videos'], ['info', 'They won’t be told you blocked them']].map(function(x){ return '<div class="li" style="min-height:48px">' + ic(x[0], 18) + '<span class="t"><b style="font-weight:500;font-size:14px">' + x[1] + '</b></span></div>'; }).join('') + '</div>' +
      '<button class="btn danger" data-act="block" data-h="' + h + '">Block</button><button class="btn ghost" data-act="close">Cancel</button>';
  } },
  'profile-more': { title: 'Profile options', html: function(){
    var h = parse().parts[1];
    return '<div class="list"><button class="li" data-act="sheet" data-s="share">' + ic('share', 20) + '<span class="t"><b>Share profile</b></span></button><button class="li" data-act="sheet" data-s="report" data-k="account">' + ic('flag', 20) + '<span class="t"><b>Report account</b></span></button><button class="li" data-act="sheet" data-s="block" data-h="' + h + '" style="color:var(--danger)">' + ic('block', 20) + '<span class="t"><b>Block @' + esc(h) + '</b></span></button></div><button class="btn ghost" data-act="close">Cancel</button>';
  } },
  video: { title: 'Own video options', html: function(){
    var v = curVideo() || S.mine[0];
    return '<b style="font-size:17px">Your video</b><div class="list"><div class="li">' + ic('eye', 20) + '<span class="t"><b>' + short(v.views) + ' qualified views</b><span>Earned ' + money(v.views / 1000 * RATE) + ' (test money)</span></span></div><button class="li" data-act="sheet" data-s="share">' + ic('share', 20) + '<span class="t"><b>Share</b></span></button><button class="li" data-act="sheet" data-s="delvid" style="color:var(--danger)">' + ic('trash', 20) + '<span class="t"><b>Delete video</b></span></button></div><button class="btn ghost" data-act="close">Cancel</button>';
  } },
  delvid: { title: 'Delete video', html: function(){
    return '<div class="empty" style="padding:10px 0 0"><span class="ill" style="color:var(--danger)">' + ic('trash', 30) + '</span><b>Delete this video?</b><span>It will be removed from Dumo for everyone. Earnings already in your wallet stay.</span></div><button class="btn danger" data-act="delete-video">Delete video</button><button class="btn ghost" data-act="close">Cancel</button>';
  } },
  pick: { title: 'Pick from gallery', html: function(){
    return '<div class="between"><b style="font-size:17px">Choose a video</b><button class="iconbtn clear" data-act="close" aria-label="Close">' + ic('x', 22) + '</button></div>' +
      '<p class="small" style="margin-top:-6px">Videos up to 60 seconds post straight away. Longer ones can be trimmed.</p>' +
      '<div class="pick">' + GALLERY.map(function(g, i){ return '<button data-act="picked" data-i="' + i + '" style="background:linear-gradient(160deg,' + g.g[1] + ',' + g.g[0] + ')" aria-label="Video ' + fmt(g.d) + (g.d > 60 ? ', too long, trim needed' : '') + '"><span class="' + (g.d > 60 ? 'too' : '') + '">' + fmt(g.d) + '</span></button>'; }).join('') + '</div>';
  }, tall: true },
  explain: { title: 'How earnings work', html: function(){
    return '<div class="between"><b style="font-size:17px">How you earn on Dumo</b><button class="iconbtn clear" data-act="close" aria-label="Close">' + ic('x', 22) + '</button></div>' +
      '<div class="rules"><div class="rule"><span class="i">' + ic('eye', 20) + '</span><span><b>Views · ' + money(RATE) + ' per 1,000</b><span>Only qualified views count: watched for at least 3 seconds, not your own, and one per person every 30 minutes.</span></span></div>' +
      '<div class="rule"><span class="i">' + ic('gift', 20) + '</span><span><b>Gifts · you keep 70%</b><span>A Vuvuzela is 100 coins (R10). You get R7.00.</span></span></div>' +
      '<div class="rule"><span class="i">' + ic('star', 20) + '</span><span><b>Subscribers</b><span>Fans who subscribe each month. Test subscriptions only in the pilot.</span></span></div></div>' +
      '<p class="small">Dumo sets the rate per 1,000 views and may change it. Pilot earnings are test money.</p><button class="btn acc" data-act="close">Got it</button>';
  } },
  cashout: { title: 'Cash out (later phase)', html: function(){
    return '<b style="font-size:17px">Cash out with PayShap</b><span class="tag later" style="align-self:flex-start">Later phase preview</span>' +
      '<label class="field" for="amt">Amount (min R50)<input class="input" type="number" id="amt" min="50" step="0.01" value="' + S.balance.toFixed(2) + '"></label>' +
      '<p class="small">To Capitec · 082 *** 4417 · usually arrives in seconds</p><p class="errtxt" id="amtErr" hidden></p>' +
      '<button class="btn acc" data-act="cash">Confirm cash out</button><button class="btn ghost" data-act="close">Cancel</button>';
  } },
  logout: { title: 'Log out', html: function(){
    return '<b style="font-size:17px">Log out of Dumo?</b><p class="sub" style="font-size:14px">You can log back in any time with your cellphone number.</p><button class="btn acc" data-act="logout">Log out</button><button class="btn ghost" data-act="close">Cancel</button>';
  } },
  delete2: { title: 'Confirm delete', html: function(){
    return '<b style="font-size:17px">Last check</b><p class="sub" style="font-size:14px">We’ll delete @' + esc(S.me.handle) + ' and all your videos now.</p><button class="btn danger" data-act="delete-final">Yes, delete everything</button><button class="btn ghost" data-act="close">Cancel</button>';
  } },
  problem: { title: 'Report a problem', html: function(){
    return '<div class="between"><b style="font-size:17px">Report a problem</b><button class="iconbtn clear" data-act="close" aria-label="Close">' + ic('x', 22) + '</button></div><label class="field" for="pnote">What went wrong?<textarea class="textarea" id="pnote" placeholder="e.g. The video froze after I swiped"></textarea></label><button class="btn ghost" data-act="toast" data-msg="Screenshot picker opens">' + ic('img', 18) + 'Add screenshot</button><p class="small">We’ll also send your phone model and app version to help us fix it.</p><button class="btn acc" data-act="sent-problem">Send</button>';
  } }
};

/* ---------------- render ---------------- */
var screenEl, tabbarEl;
function render(){
  clearTimers();
  var r = parse();
  var key = SCREENS[r.parts.slice(0, 2).join('/')] ? r.parts.slice(0, 2).join('/') : r.parts[0];
  var def = SCREENS[key]; if (!def){ key = 'feed'; def = SCREENS.feed; }
  screenEl.innerHTML = '<div class="view enter" id="view-' + key.replace('/', '-') + '">' + def.fn(r) + '</div>';
  var sh = r.q.sheet && SHEETS[r.q.sheet];
  if (sh){ screenEl.insertAdjacentHTML('beforeend', '<div class="scrim" data-act="close"></div><div class="sheet' + (sh.tall ? ' tall' : '') + '" role="dialog" aria-modal="true" aria-label="' + esc(sh.title) + '"><span class="grab"></span>' + sh.html(r) + '</div>'); }
  tabbarEl.hidden = !def.chrome;
  $$('button', tabbarEl).forEach(function(b){ b.classList.toggle('on', b.dataset.tab === def.tab); });
  if (def.after) def.after(r);
  if (sh && !FRAME){ var f = $('.sheet input:not([type=radio]),.sheet textarea', screenEl); if (f && r.q.sheet !== 'cashout') { /* keep keyboard closed on mobile */ } }
  if (r.q.sheet === 'comments' && !FRAME){ var cin = $('#cin'); if (cin && matchMedia('(hover:hover)').matches) cin.focus(); }
  drawFlow(); drawScen();
  document.dispatchEvent(new Event('dumo:screen'));
}

/* ---------------- actions ---------------- */
var ACT = {
  back: function(){ if (history.length > 1) history.back(); else go('#/feed'); },
  close: closeSheet,
  sheet: function(el){ var r = parse(); r.q.sheet = el.dataset.s; if (el.dataset.k) r.q.s_k = el.dataset.k; if (el.dataset.h) r.q.s_h = el.dataset.h; go(hashOf(r.path, r.q), !!parse().q.sheet); },
  toast: function(el){ toast(el.dataset.msg); },
  later: function(el){ toast(el.dataset.what + ' arrive in a later phase. Shown here as a preview.'); },
  'start-signup': function(){ S.flow = 'signup'; go('#/phone'); },
  'start-login': function(){ S.flow = 'login'; go('#/phone'); },
  'send-code': function(){
    var i = $('#tel'), v = i.value.replace(/\D/g, ''), e = $('#telErr');
    if (!/^0?[678]\d{8}$/.test(v)){ i.classList.add('err'); e.textContent = 'Enter a South African cellphone number, like 082 123 4567.'; e.hidden = false; i.focus(); return; }
    if (v.length === 9) v = '0' + v; S.phone = v.slice(0, 3) + ' ' + v.slice(3, 6) + ' ' + v.slice(6); go('#/otp');
  },
  resend: function(){ toast('New code sent by SMS'); render(); },
  'age-next': function(){ var a = S.dobAge; if (a == null) return; if (a < 13) go('#/age-blocked'); else { S.under18 = a < 18; go('#/profile-setup'); } },
  photo: function(){ toast('Opens camera or gallery to pick a photo'); },
  'profile-next': function(){
    var n = $('#pname').value.trim(), h = $('#phandle').value.trim().toLowerCase();
    if (!n || !/^[a-z0-9._]{3,24}$/.test(h) || CREATORS[h]) { toast('Check your name and username'); return; }
    S.me.name = n; S.me.handle = h; S.me.ini = n.split(/\s+/).map(function(x){ return x[0]; }).join('').slice(0, 2).toUpperCase(); S.me.province = $('#pprov').value;
    S.mine.forEach(function(v){ v.c = h; }); go('#/guidelines');
  },
  'guidelines-done': function(){ S.signedIn = true; S.coach = true; S.idx = 0; go('#/feed'); toast('Welcome to Dumo, ' + S.me.name.split(' ')[0] + '!'); },
  'coach-off': function(){ S.coach = false; var c = $('.coach'); if (c) c.remove(); },
  saver: function(){ S.saver = !S.saver; render(); toast(S.saver ? 'Data Saver on: lighter video, about 4 MB per minute' : 'Data Saver off: HD video, about 12 MB per minute'); },
  'saver-switch': function(el){ S.saver = el.checked; render(); },
  'wifi-switch': function(el){ S.wifiUpload = el.checked; },
  next: function(){ step(1); }, prev: function(){ step(-1); },
  like: function(){ var v = curVideo(); if (!v) return; S.liked[v.id] = !S.liked[v.id]; $('#overlay').innerHTML = overlayHTML(v); var b = $('[data-act=like]'); if (b && S.liked[v.id]) b.classList.add('pop'); },
  follow: function(el){
    var h = el.dataset.h, i = S.following.indexOf(h);
    if (i >= 0) S.following.splice(i, 1); else S.following.push(h);
    toast(i >= 0 ? 'Unfollowed @' + h : 'Following @' + h + '. Their videos will show in your Following tab.');
    var r = parse(); if (r.parts[0] === 'feed' || r.parts[0] === 'watch'){ var v = curVideo(); if (v) $('#overlay').innerHTML = overlayHTML(v); } else if (r.path === 'search') { $('#results').innerHTML = results(r.q.q || '', r.q.t || 'top'); } else render();
  },
  pickgift: function(el){ setQ('s_g', el.dataset.i); },
  sendgift: function(el){
    var g = GIFTS[+el.dataset.i], v = curVideo(); if (S.coins < g.c) return;
    S.coins -= g.c; S.giftsSent.unshift({ n: g.n, to: v.c, c: g.c }); closeSheet();
    toast(g.e + ' ' + g.n + ' sent! @' + v.c + ' earned ' + money(g.c * COIN_RAND * CREATOR_SHARE) + ' (test money).');
  },
  'free-coins': function(){ S.coins += 500; var r = parse(); if (r.q.sheet) render(); else render(); toast('500 free test coins added'); },
  shareto: function(el){ if (el.dataset.to === 'Copy link'){ try { navigator.clipboard.writeText('https://' + el.dataset.url); } catch(e){} toast('Link copied'); } else toast('Opens ' + el.dataset.to + ' with the link'); closeSheet(); },
  notint: function(){ closeSheet(); toast('Got it. You’ll see fewer videos like this.'); },
  block: function(el){
    var h = el.dataset.h; if (S.blocked.indexOf(h) < 0) S.blocked.push(h);
    var fi = S.following.indexOf(h); if (fi >= 0) S.following.splice(fi, 1);
    var r = parse(); delete r.q.sheet; delete r.q.s_h; delete r.q.s_k;
    go(hashOf(r.path, r.q), true); toast('@' + h + ' is blocked');
  },
  unblock: function(el){ S.blocked = S.blocked.filter(function(x){ return x !== el.dataset.h; }); render(); toast('@' + el.dataset.h + ' is unblocked'); },
  stab: function(el){ setQ('t', el.dataset.t); },
  setq: function(el){ setQ('q', el.dataset.q); },
  'use-tag': function(el){ S.draft.cap = '#' + el.dataset.t + ' '; go('#/post'); },
  'close-post': function(){ go('#/feed'); },
  dur: function(el){ S.draft.max = +el.dataset.d; render(); },
  rec: function(){
    var b = $('#rec'), t = $('#rtime'), ring = $('#ring'), max = S.draft.max || 60;
    if (S.rec){ stopRec(); return; }
    S.rec = true; S.recS = 0; b.classList.add('on'); b.setAttribute('aria-label', 'Stop recording'); t.hidden = false;
    every(function(){ S.recS++; t.textContent = fmt(S.recS); ring.style.strokeDashoffset = 270 - 270 * S.recS / max; if (S.recS >= max) stopRec(); }, 250);
  },
  picked: function(el){ var g = GALLERY[+el.dataset.i]; S.draft.src = g.d; S.draft.g = g.g; S.draft.dur = Math.min(60, g.d); go(g.d > 60 ? '#/post/trim' : '#/post/details', true); },
  addtag: function(el){ var ta = $('#cap'); var t = '#' + el.dataset.t; if (ta.value.indexOf(t) < 0){ ta.value = (ta.value.trim() + ' ' + t).trim().slice(0, 150); ta.dispatchEvent(new Event('input')); } },
  publish: function(){ if (!S.draft.cap.trim()){ toast('Add a caption first'); $('#cap').focus(); return; } go('#/post/uploading', true); },
  cash: function(){
    var a = parseFloat($('#amt').value), err = $('#amtErr');
    if (!(a >= 50)){ err.textContent = 'Enter at least R50.'; err.hidden = false; return; }
    if (a > S.balance + 0.001){ err.textContent = 'You can cash out up to ' + money(S.balance) + '.'; err.hidden = false; return; }
    S.balance = Math.round((S.balance - a) * 100) / 100; S.cashed.unshift({ a: a, when: 'Today' }); closeSheet(); toast(money(a) + ' sent (prototype only, no real money moved).');
  },
  'save-profile': function(){
    var h = $('#ehandle').value.trim().toLowerCase();
    if (!/^[a-z0-9._]{3,24}$/.test(h)){ toast('Usernames use 3–24 letters, numbers, dots or underscores'); return; }
    S.me.name = $('#ename').value.trim() || S.me.name; S.mine.forEach(function(v){ v.c = h; }); S.me.handle = h;
    S.me.bio = $('#ebio').value.trim(); S.me.city = $('#ecity').value.trim(); S.me.province = $('#eprov').value; S.me.langs = $('#elang').value.trim();
    go('#/me', true); toast('Profile saved', 'check');
  },
  'delete-video': function(){ var v = curVideo(); S.mine = S.mine.filter(function(x){ return x !== v; }); go('#/me', true); toast('Video deleted'); },
  logout: function(){ S.signedIn = false; go('#/welcome', true); toast('You’re logged out'); },
  'delete-1': function(){ var r = parse(); r.q.sheet = 'delete2'; go(hashOf(r.path, r.q)); },
  'delete-final': function(){ S.mine = []; S.signedIn = false; go('#/settings/deleted', true); },
  restart: function(){ S = fresh(); S.signedIn = false; go('#/welcome', true); },
  'sent-problem': function(){ closeSheet(); toast('Thanks. Our team will look into it.'); },
  clike: function(el){ el.classList.toggle('liked'); },
  reply: function(el){ var i = $('#cin'); i.value = '@' + el.dataset.u + ' '; i.focus(); }
};
function stopRec(){ clearTimers(); S.rec = false; if (S.recS < 2){ toast('Hold on, record at least 2 seconds'); render(); return; } S.draft.dur = S.recS; S.draft.g = null; go('#/post/details'); }
function checkOtp(){
  var boxes = $$('.otp input'), code = boxes.map(function(b){ return b.value; }).join('');
  if (code.length < 6) return;
  if (code === '000000'){ $('#otp').classList.add('err'); $('#otpErr').hidden = false; boxes.forEach(function(b){ b.value = ''; }); boxes[0].focus(); return; }
  boxes.forEach(function(b){ b.disabled = true; });
  later(function(){
    if (S.flow === 'login'){ S.signedIn = true; go('#/feed', true); toast('Welcome back, ' + S.me.name.split(' ')[0]); }
    else go('#/age', true);
  }, 500);
}

/* ---------------- global wiring ---------------- */
function bind(){
  document.addEventListener('click', function(e){
    var el = e.target.closest('[data-act],[data-go],[data-tab]'); if (!el || !$('#phone').contains(el) && !el.closest('.drawer')) return;
    if (el.dataset.tab && el.closest('.tabbar')){ var t = el.dataset.tab; go({ home: '#/feed', discover: '#/discover', post: '#/post', wallet: '#/wallet', me: '#/me' }[t]); return; }
    if (el.dataset.tab && el.closest('.f-tabs')){ S.idx = 0; setQ('tab', el.dataset.tab === 'foryou' ? '' : el.dataset.tab); return; }
    if (el.dataset.go){ e.preventDefault(); go(el.dataset.go); return; }
    var a = ACT[el.dataset.act]; if (a && el.tagName !== 'INPUT' && el.tagName !== 'SELECT'){ e.preventDefault(); a(el, e); }
  });
  document.addEventListener('change', function(e){
    var el = e.target;
    if (el.dataset && (el.dataset.act === 'saver-switch' || el.dataset.act === 'wifi-switch')) ACT[el.dataset.act](el);
    if (el.id === 'preload') S.preload = el.value;
    if (el.id === 'agree') $('#gdone').disabled = !el.checked;
    if (el.id === 'delok') $('#delbtn').disabled = !el.checked;
    if (el.id === 'dd' || el.id === 'mm' || el.id === 'yy'){
      var d = +$('#dd').value, m = $('#mm').value, y = +$('#yy').value, msg = $('#ageMsg');
      if (!d || m === '' || !y){ S.dobAge = null; $('#ageNext').disabled = true; msg.innerHTML = ''; return; }
      var now = new Date(2026, 9, 9), b = new Date(y, +m, d); var a = now.getFullYear() - y - ((now < new Date(now.getFullYear(), +m, d)) ? 1 : 0);
      S.dobAge = a; $('#ageNext').disabled = false;
      msg.innerHTML = a < 13 ? '<p class="errtxt">You need to be 13 or older to use Dumo.</p>' : a < 18 ? '<div class="infobox">' + ic('info', 18) + '<span><b>You can watch and post.</b> Earning money unlocks when you turn 18.</span></div>' : '<p class="ok">' + ic('check', 16) + ' You can watch, post and earn.</p>';
      void b;
    }
  });
  document.addEventListener('submit', function(e){
    var f = e.target; if (!f.dataset || !f.dataset.form) return; e.preventDefault();
    if (f.dataset.form === 'comment'){
      var i = $('#cin'), t = i.value.trim(); if (!t) return; var v = curVideo(); if (!v) return;
      (S.comments[v.id] = S.comments[v.id] || []).unshift({ u: S.me.handle, t: t, l: 0, ago: 'now' }); render();
    }
    if (f.dataset.form === 'report'){
      var k = f.dataset.k, r = parse(), v2 = curVideo();
      if (k === 'video' && v2) S.reported[v2.id] = true;
      r.q.sheet = 'reported'; delete r.q.s_k; go(hashOf(r.path, r.q), true);
    }
  });
  document.addEventListener('keydown', function(e){
    var t = e.target; if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
    var r = parse();
    if ((r.parts[0] === 'feed' || r.parts[0] === 'watch') && !r.q.sheet){ if (e.key === 'ArrowDown'){ e.preventDefault(); step(1); } if (e.key === 'ArrowUp'){ e.preventDefault(); step(-1); } }
    if (e.key === 'Escape' && r.q.sheet) closeSheet();
  });
  addEventListener('hashchange', render);
}

/* ---------------- side panels ---------------- */
var FLOW = [
  ['Sign up and log in', [['splash', 'Splash'], ['welcome', 'Welcome'], ['phone', 'Phone number'], ['otp', 'SMS code'], ['age', 'Date of birth (age check)'], ['age-blocked', 'Under 13 · blocked'], ['profile-setup', 'Create profile'], ['guidelines', 'Community guidelines']]],
  ['Home feed', [['feed', 'For You'], ['feed?tab=following', 'Following'], ['feed?sheet=comments', 'Comments'], ['feed?sheet=gift', 'Send a gift (test coins)'], ['feed?sheet=share', 'Share'], ['feed?sheet=report', 'Report video'], ['feed?sheet=reported', 'Report sent'], ['feed?sheet=block', 'Block user']]],
  ['Discover', [['discover', 'Discover'], ['search?q=thandi', 'Search results'], ['tag/DumoChallenge', 'Hashtag page'], ['creator/thandi.moves', 'Creator profile'], ['creator/thandi.moves?sheet=profile-more', 'Profile options']]],
  ['Post a video', [['post', 'Record (up to 60 s)'], ['post?sheet=pick', 'Pick from gallery'], ['post/trim', 'Trim to 60 s'], ['post/details', 'Caption and settings'], ['post/uploading', 'Uploading']]],
  ['Wallet (test money)', [['wallet', 'Wallet'], ['wallet?sheet=explain', 'How earnings work'], ['coins', 'Test coins']]],
  ['Profile and settings', [['me', 'My profile'], ['watch/m1?sheet=video', 'Own video options'], ['watch/m1?sheet=delvid', 'Delete video'], ['me/edit', 'Edit profile'], ['settings', 'Settings'], ['settings/data-saver', 'Data Saver'], ['settings/blocked', 'Blocked accounts'], ['settings?sheet=logout', 'Log out'], ['settings/delete', 'Delete account'], ['settings/deleted', 'Account deleted']]]
];
function drawFlow(){
  var cur = location.hash.replace(/^#\/?/, '') || 'feed';
  var html = FLOW.map(function(g){ return '<h3>' + g[0] + '</h3>' + g[1].map(function(x){ return '<a href="#/' + x[0] + '" class="' + (x[0] === cur ? 'on' : '') + '">' + x[1] + '</a>'; }).join(''); }).join('');
  var f = $('#flow'); if (f) f.innerHTML = html;
  var d = $('.drawer .flow'); if (d) d.innerHTML = html;
}
function drawScen(){
  var els = $$('.scen'); if (!els.length) return;
  var row = function(k, t, s, on){ return '<label><span>' + t + '<small>' + s + '</small></span><input type="checkbox" data-scen="' + k + '"' + (on ? ' checked' : '') + '></label>'; };
  var h = row('under18', 'User is 13–17', 'Earning locked, wallet changes', S.under18) + row('later', 'Show later-phase features', 'PayShap, subscriptions, Go Global, Mzansi tab', S.later) +
    row('saver', 'Data Saver', 'Lighter stream on the feed', S.saver) + row('offline', 'Phone is offline', 'Feed banner', S.offline) + row('nofollow', 'Following nobody', 'Empty Following tab', !S.following.length);
  els.forEach(function(el){ el.innerHTML = h; });
}
function scenWire(){
  document.addEventListener('change', function(e){
    var k = e.target.dataset && e.target.dataset.scen; if (!k) return;
    if (k === 'nofollow') S.following = e.target.checked ? [] : ['thandi.moves', 'sipho.comedy'];
    else S[k] = e.target.checked;
    render();
  });
  $('#reset').addEventListener('click', function(){ S = fresh(); go('#/feed'); toast('Prototype reset'); });
  window.DUMO_REVIEW = { compact: true, extra: { label: 'Screens', svg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>', run: openDrawer } };
  function openDrawer(){
    var d = document.createElement('div'); d.className = 'drawer'; d.innerHTML = '<div class="in"><a class="back" href="../" style="color:var(--muted);font-size:13px">← Design review hub</a><h2 style="font:800 26px var(--display);color:var(--accent);margin:10px 0">All screens</h2><nav class="flow"></nav><h3 style="margin:18px 0 6px;font:800 16px var(--display)">Try a scenario</h3><div class="scen"></div></div>';
    d.addEventListener('click', function(e){ if (e.target === d || e.target.closest('a')) d.remove(); });
    document.body.appendChild(d); drawFlow(); drawScen();
  }
}

/* ---------------- review hooks ---------------- */
window.dumoReviewContext = function(){
  var r = parse(), key = r.parts.slice(0, 2).join('/'); var def = SCREENS[key] ? key : r.parts[0];
  var k = '#/' + (r.parts[0] === 'creator' || r.parts[0] === 'tag' || r.parts[0] === 'watch' ? r.parts[0] : r.path) + (r.q.tab ? '?tab=' + r.q.tab : '') + (r.q.sheet ? (r.q.tab ? '&' : '?') + 'sheet=' + r.q.sheet : '');
  var label = 'App › ' + (TITLES[def] || def) + (r.q.tab === 'following' ? ' (Following)' : '') + (r.q.sheet && SHEETS[r.q.sheet] ? ' › ' + SHEETS[r.q.sheet].title : '');
  return { key: k, label: label };
};
window.dumoReviewGoto = function(k){
  var m = /^#\/(creator|tag|watch)(.*)$/.exec(k);
  if (m){ var sub = { creator: '/thandi.moves', tag: '/DumoChallenge', watch: '/m1' }[m[1]]; k = '#/' + m[1] + sub + m[2]; }
  location.hash = k;
};

/* ---------------- boot ---------------- */
screenEl = $('#screen'); tabbarEl = $('#tabbar');
tabbarEl.innerHTML = '<button data-tab="home">' + ic('home') + 'Home</button><button data-tab="discover">' + ic('search') + 'Discover</button><button class="post" data-tab="post" aria-label="Post a video">' + ic('plus', 22, ' stroke="#17120C" stroke-width="2.6"') + '</button><button data-tab="wallet">' + ic('wallet') + 'Wallet</button><button data-tab="me">' + ic('user') + 'Profile</button>';
bind(); scenWire();
if (!location.hash) history.replaceState(null, '', '#/splash');
render();
})();
