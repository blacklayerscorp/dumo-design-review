/* Dumo design review layer — Figma-style pin comments on any page of this site.
   - Press C (or the Comment button), click anywhere, type, post.
   - Pins are tied to the page + current screen (window.dumoReviewContext() if the page defines it).
   - Comments live in this browser (localStorage); "Send feedback" exports them
     (email, GitHub issue, copy, JSON) and "Import" merges someone else's file.
   Pages opt in with: <script src="…/assets/review.js" defer></script>
   Disabled inside iframes (the screen board) unless the iframe URL has ?review=1. */
(function(){
  'use strict';
  if (window.top !== window.self && !/[?&]review=1/.test(location.search)) return;

  var CFG = Object.assign({ repo: 'blacklayerscorp/dumo-design-review', project: 'Dumo — Design review' }, window.DUMO_REVIEW || {});
  var KEY = 'dumo-review-v1', NAME_KEY = 'dumo-review-name';
  var mem = { items: [] };

  function load(){ try { var r = localStorage.getItem(KEY); return r ? JSON.parse(r) : []; } catch(e){ return mem.items; } }
  function save(items){ mem.items = items; try { localStorage.setItem(KEY, JSON.stringify(items)); } catch(e){} }
  function getName(){ try { return localStorage.getItem(NAME_KEY) || ''; } catch(e){ return mem.name || ''; } }
  function setName(n){ mem.name = n; try { localStorage.setItem(NAME_KEY, n); } catch(e){} }

  // page id relative to site root, e.g. "app/", "plan.html"
  var root = (function(){
    var s = document.currentScript && document.currentScript.src;
    if (!s) { var all = document.querySelectorAll('script[src*="review.js"]'); s = all.length ? all[all.length-1].src : ''; }
    return s ? s.replace(/assets\/review\.js.*$/, '') : location.origin + '/';
  })();
  function pageId(){ var p = location.href.split('#')[0].split('?')[0]; return p.indexOf(root) === 0 ? (p.slice(root.length) || 'index.html') : p; }
  function ctx(){
    if (typeof window.dumoReviewContext === 'function') { try { return window.dumoReviewContext(); } catch(e){} }
    return { key: location.hash || '', label: document.title };
  }
  function here(c){ var x = ctx(); return c.page === pageId() && c.ctx === x.key; }

  var esc = function(s){ return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); };
  var uid = function(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); };
  var when = function(t){ var d = new Date(t); return d.toLocaleDateString(undefined,{day:'numeric',month:'short'}) + ' ' + d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'}); };

  // ---------- styles ----------
  var css = `
  .rv-ui{font:14px/1.45 'DM Sans','Segoe UI',Arial,sans-serif;color:#17120C;--rv-a:#F2A93B}
  .rv-bar{position:fixed;left:16px;bottom:16px;z-index:2147483000;display:flex;gap:6px;background:#17120C;border:1px solid #3A2E20;border-radius:14px;padding:6px;box-shadow:0 10px 30px rgba(0,0,0,.35)}
  .rv-bar button{all:unset;cursor:pointer;display:flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:10px;color:#FBF6EC;font:600 13px 'DM Sans',Arial,sans-serif;white-space:nowrap}
  .rv-bar button:hover{background:#2A2117}
  .rv-bar button:focus-visible{outline:2px solid #F2A93B}
  .rv-bar button.on{background:#F2A93B;color:#17120C}
  .rv-bar .n{background:#F2A93B;color:#17120C;border-radius:999px;padding:0 7px;font-size:11px;line-height:18px}
  .rv-bar kbd{font:600 10px ui-monospace,monospace;border:1px solid currentColor;border-radius:4px;padding:0 4px;opacity:.7;background:none;color:inherit;box-shadow:none}
  .rv-bar [data-a=toggle]{display:none}
  .rv-bar.rv-compact{left:0;bottom:auto;top:38%;flex-direction:column;border-radius:0 14px 14px 0;border-left:none;padding:5px 4px}
  .rv-bar.rv-compact [data-a=toggle]{display:flex;justify-content:center;padding:0 6px}
  .rv-bar.rv-compact:not(.rv-open) > :not([data-a=toggle]){display:none}
  .rv-bar.rv-compact .lbl{display:none}
  @media (max-width:520px){.rv-bar .lbl{display:none}}
  .rv-catch{position:fixed;inset:0;z-index:2147482990;cursor:crosshair;background:rgba(242,169,59,.06);box-shadow:inset 0 0 0 3px #F2A93B}
  .rv-hint{position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:2147483001;background:#F2A93B;color:#17120C;font:700 13px 'DM Sans',Arial,sans-serif;padding:6px 14px;border-radius:999px;pointer-events:none;box-shadow:0 6px 18px rgba(0,0,0,.3)}
  .rv-layer{position:absolute;left:0;top:0;width:0;height:0;z-index:2147482995}
  .rv-pin{position:absolute;width:30px;height:30px;margin:-30px 0 0 0;border-radius:15px 15px 15px 3px;background:#F2A93B;color:#17120C;border:2px solid #17120C;font:800 12px 'DM Sans',Arial,sans-serif;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.35);padding:0}
  .rv-pin.res{background:#7FE0CF;opacity:.75}
  .rv-pin:focus-visible{outline:2px solid #fff}
  .rv-pop{position:fixed;z-index:2147483002;width:300px;max-width:calc(100vw - 24px);background:#FFFDF8;border:1px solid #E6DCC8;border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.35);padding:12px;display:flex;flex-direction:column;gap:8px}
  .rv-pop textarea,.rv-pop input,.rv-panel textarea{all:unset;box-sizing:border-box;width:100%;background:#fff;border:1px solid #D9CDB5;border-radius:10px;padding:8px 10px;font:14px 'DM Sans',Arial,sans-serif;color:#17120C}
  .rv-pop textarea{min-height:76px;white-space:pre-wrap}
  .rv-pop textarea:focus,.rv-pop input:focus{border-color:#9A5B00;box-shadow:0 0 0 2px rgba(242,169,59,.35)}
  .rv-row{display:flex;gap:6px;justify-content:flex-end;align-items:center;flex-wrap:wrap}
  .rv-b{all:unset;cursor:pointer;height:32px;padding:0 12px;border-radius:9px;font:700 13px 'DM Sans',Arial,sans-serif;background:#F3EDE0;color:#17120C;display:inline-flex;align-items:center;gap:6px}
  .rv-b.p{background:#F2A93B}
  .rv-b.d{color:#B4361F}
  .rv-b:focus-visible{outline:2px solid #9A5B00}
  .rv-msg{display:flex;flex-direction:column;gap:2px;padding:8px 0;border-bottom:1px solid #EFE6D4}
  .rv-msg:last-of-type{border-bottom:none}
  .rv-who{font-weight:700;font-size:13px}
  .rv-when{font-size:11px;color:#6B5D49;font-weight:400;margin-left:6px}
  .rv-txt{white-space:pre-wrap;word-break:break-word}
  .rv-where{font-size:11px;color:#6B5D49;text-transform:uppercase;letter-spacing:.06em;font-weight:700}
  .rv-panel{position:fixed;top:0;right:0;bottom:0;width:380px;max-width:100vw;z-index:2147483003;background:#FFFDF8;border-left:1px solid #E6DCC8;box-shadow:-20px 0 50px rgba(0,0,0,.25);display:flex;flex-direction:column}
  .rv-panel header{padding:16px;border-bottom:1px solid #E6DCC8;display:flex;flex-direction:column;gap:10px}
  .rv-panel h2{margin:0;font:800 20px 'Bricolage Grotesque','Arial Black',sans-serif}
  .rv-panel .body{flex:1;overflow:auto;padding:8px 16px 24px}
  .rv-item{all:unset;box-sizing:border-box;display:flex;gap:10px;width:100%;padding:12px 0;border-bottom:1px solid #EFE6D4;cursor:pointer}
  .rv-item:focus-visible{outline:2px solid #9A5B00}
  .rv-item .num{flex:none;width:26px;height:26px;border-radius:13px 13px 13px 3px;background:#F2A93B;display:flex;align-items:center;justify-content:center;font:800 11px 'DM Sans',Arial,sans-serif}
  .rv-item.res .num{background:#7FE0CF}
  .rv-item.res .rv-txt{color:#6B5D49;text-decoration:line-through}
  .rv-empty{color:#6B5D49;padding:24px 0;text-align:center}
  .rv-filter{display:flex;gap:6px}
  .rv-filter button{all:unset;cursor:pointer;font:700 12px 'DM Sans',Arial,sans-serif;padding:4px 10px;border-radius:999px;background:#F3EDE0}
  .rv-filter button.on{background:#17120C;color:#fff}
  .rv-toast{position:fixed;left:50%;bottom:76px;transform:translateX(-50%);z-index:2147483004;background:#17120C;color:#FBF6EC;padding:10px 16px;border-radius:12px;font:600 13px 'DM Sans',Arial,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.35)}
  .rv-hidepins .rv-layer{display:none}
  `;
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // ---------- DOM ----------
  var bar = document.createElement('div'); bar.className = 'rv-ui rv-bar'; bar.setAttribute('role','toolbar'); bar.setAttribute('aria-label','Design review');
  bar.innerHTML =
    '<button type="button" data-a="mode" aria-pressed="false" title="Add a comment (C)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z"/><path d="M12 9v6M9 12h6" stroke-linecap="round"/></svg><span class="lbl">Comment</span> <kbd class="lbl">C</kbd></button>' +
    '<button type="button" data-a="list" title="All comments"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg><span class="lbl">Feedback</span><span class="n" data-n>0</span></button>' +
    '<button type="button" data-a="pins" aria-pressed="true" title="Show or hide pins"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg><span class="lbl">Pins</span></button>';
  if (CFG.extra){ var xb = document.createElement('button'); xb.type = 'button'; xb.dataset.a = 'extra'; xb.title = CFG.extra.label; xb.innerHTML = CFG.extra.svg + '<span class="lbl">' + CFG.extra.label + '</span>'; bar.insertBefore(xb, bar.firstChild); }
  var tg = document.createElement('button'); tg.type = 'button'; tg.dataset.a = 'toggle'; tg.setAttribute('aria-label', 'Review tools'); tg.setAttribute('aria-expanded', 'false');
  tg.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z"/></svg><span class="n" data-n2>0</span>';
  bar.insertBefore(tg, bar.firstChild);
  var mq = window.matchMedia('(max-width: 760px)');
  function compact(){ bar.classList.toggle('rv-compact', !!CFG.compact && mq.matches); if (!bar.classList.contains('rv-compact')) bar.classList.remove('rv-open'); }
  compact(); if (mq.addEventListener) mq.addEventListener('change', compact);
  function fold(){ bar.classList.remove('rv-open'); tg.setAttribute('aria-expanded', 'false'); }
  var layer = document.createElement('div'); layer.className = 'rv-layer rv-ui';
  document.addEventListener('DOMContentLoaded', mount);
  if (document.readyState !== 'loading') mount();
  var mounted = false;
  function mount(){ if (mounted) return; mounted = true; document.body.appendChild(layer); document.body.appendChild(bar); render(); openFromUrl(); }

  var mode = false, catcher = null, hint = null, pop = null, panel = null, showPins = true, filter = 'open';

  function setMode(on){
    mode = on; closePop();
    bar.querySelector('[data-a=mode]').classList.toggle('on', on);
    bar.querySelector('[data-a=mode]').setAttribute('aria-pressed', on);
    if (on){
      catcher = document.createElement('div'); catcher.className = 'rv-catch';
      hint = document.createElement('div'); hint.className = 'rv-hint'; hint.textContent = 'Click anywhere to leave a comment · Esc to cancel';
      catcher.addEventListener('click', placeNew);
      document.body.appendChild(catcher); document.body.appendChild(hint);
    } else { catcher && catcher.remove(); hint && hint.remove(); catcher = hint = null; }
  }

  // Find a stable anchor: nearest ancestor with data-review-anchor or an id.
  function anchorFor(el){
    while (el && el !== document.body && el !== document.documentElement){
      if (el.hasAttribute && (el.hasAttribute('data-review-anchor') || el.id)) return el;
      el = el.parentElement;
    }
    return document.body;
  }
  function selOf(el){
    if (el === document.body) return 'body';
    if (el.hasAttribute('data-review-anchor')) return '[data-review-anchor="' + el.getAttribute('data-review-anchor') + '"]';
    return '#' + CSS.escape(el.id);
  }

  function placeNew(e){
    catcher.style.display = 'none';
    var under = document.elementFromPoint(e.clientX, e.clientY);
    catcher.style.display = '';
    var a = anchorFor(under); var r = a.getBoundingClientRect();
    var fx = r.width ? (e.clientX - r.left) / r.width : 0, fy = r.height ? (e.clientY - r.top) / r.height : 0;
    if (a === document.body){ fx = (e.clientX + scrollX) / document.documentElement.scrollWidth; fy = (e.clientY + scrollY); }
    setMode(false);
    var c = ctx();
    var draft = { id: uid(), page: pageId(), ctx: c.key, ctxLabel: c.label, anchor: selOf(a), fx: fx, fy: fy, author: '', text: '', ts: Date.now(), status: 'open', replies: [] };
    composer(e.clientX, e.clientY, draft);
  }

  function positionPop(x, y){
    var w = pop.offsetWidth, h = pop.offsetHeight;
    var left = Math.min(Math.max(12, x + 14), innerWidth - w - 12);
    var top = Math.min(Math.max(12, y - 10), innerHeight - h - 12);
    pop.style.left = left + 'px'; pop.style.top = top + 'px';
  }
  function closePop(){ if (pop){ pop.remove(); pop = null; } }

  function nameField(){ return getName() ? '' : '<input data-f="name" placeholder="Your name (shown on comments)" aria-label="Your name" autocomplete="name">'; }

  function composer(x, y, draft){
    closePop();
    pop = document.createElement('div'); pop.className = 'rv-ui rv-pop'; pop.setAttribute('role','dialog'); pop.setAttribute('aria-label','New comment');
    pop.innerHTML = '<div class="rv-where">' + esc(draft.ctxLabel || draft.page) + '</div>' + nameField() +
      '<textarea data-f="text" placeholder="What should change here? (Ctrl+Enter to post)" aria-label="Comment"></textarea>' +
      '<div class="rv-row"><button class="rv-b" data-x="cancel">Cancel</button><button class="rv-b p" data-x="post">Post comment</button></div>';
    document.body.appendChild(pop); positionPop(x, y);
    var ta = pop.querySelector('[data-f=text]'); (pop.querySelector('[data-f=name]') || ta).focus();
    if (getName()) ta.focus();
    function post(){
      var nm = pop.querySelector('[data-f=name]'); if (nm){ if (!nm.value.trim()){ nm.focus(); return; } setName(nm.value.trim()); }
      if (!ta.value.trim()){ ta.focus(); return; }
      draft.author = getName(); draft.text = ta.value.trim(); draft.ts = Date.now();
      var items = load(); items.push(draft); save(items); closePop(); render(); toast('Comment saved');
    }
    pop.querySelector('[data-x=post]').onclick = post;
    pop.querySelector('[data-x=cancel]').onclick = closePop;
    ta.addEventListener('keydown', function(e){ if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) post(); });
  }

  function thread(id, x, y){
    var items = load(); var c = items.filter(function(i){ return i.id === id; })[0]; if (!c) return;
    closePop();
    pop = document.createElement('div'); pop.className = 'rv-ui rv-pop'; pop.setAttribute('role','dialog'); pop.setAttribute('aria-label','Comment thread');
    var msgs = [c].concat(c.replies || []).map(function(m){ return '<div class="rv-msg"><div class="rv-who">' + esc(m.author || 'Reviewer') + '<span class="rv-when">' + when(m.ts) + '</span></div><div class="rv-txt">' + esc(m.text) + '</div></div>'; }).join('');
    pop.innerHTML = '<div class="rv-where">#' + (number(c)) + ' · ' + esc(c.ctxLabel || c.page) + (c.status === 'resolved' ? ' · resolved' : '') + '</div>' + msgs + nameField() +
      '<textarea data-f="text" placeholder="Reply…" aria-label="Reply" style="min-height:50px"></textarea>' +
      '<div class="rv-row"><button class="rv-b d" data-x="del">Delete</button><button class="rv-b" data-x="res">' + (c.status === 'resolved' ? 'Reopen' : 'Resolve') + '</button><button class="rv-b p" data-x="reply">Reply</button></div>';
    document.body.appendChild(pop); positionPop(x, y);
    pop.querySelector('[data-x=del]').onclick = function(){ save(load().filter(function(i){ return i.id !== id; })); closePop(); render(); };
    pop.querySelector('[data-x=res]').onclick = function(){ var it = load(); it.forEach(function(i){ if (i.id === id) i.status = i.status === 'resolved' ? 'open' : 'resolved'; }); save(it); closePop(); render(); };
    var reply = function(){
      var ta = pop.querySelector('[data-f=text]'); var nm = pop.querySelector('[data-f=name]');
      if (nm){ if (!nm.value.trim()){ nm.focus(); return; } setName(nm.value.trim()); }
      if (!ta.value.trim()) { ta.focus(); return; }
      var it = load(); it.forEach(function(i){ if (i.id === id){ i.replies = i.replies || []; i.replies.push({ author: getName(), text: ta.value.trim(), ts: Date.now() }); } }); save(it); thread(id, x, y); render();
    };
    pop.querySelector('[data-x=reply]').onclick = reply;
    pop.querySelector('[data-f=text]').addEventListener('keydown', function(e){ if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) reply(); });
  }

  function number(c){ var all = load().sort(function(a,b){ return a.ts - b.ts; }); return all.findIndex(function(i){ return i.id === c.id; }) + 1; }

  // ---------- render pins ----------
  function pinXY(c){
    var a = c.anchor === 'body' ? document.body : document.querySelector(c.anchor);
    if (!a) return null;
    if (a === document.body) return { x: c.fx * document.documentElement.scrollWidth, y: c.fy };
    var r = a.getBoundingClientRect();
    if (!r.width && !r.height) return null;
    return { x: r.left + scrollX + c.fx * r.width, y: r.top + scrollY + c.fy * r.height };
  }
  function render(){
    var items = load();
    var openN = items.filter(function(i){ return i.status !== 'resolved'; }).length;
    bar.querySelector('[data-n]').textContent = openN; bar.querySelector('[data-n2]').textContent = openN;
    layer.innerHTML = '';
    var order = items.slice().sort(function(a,b){ return a.ts - b.ts; });
    order.forEach(function(c, i){
      if (!here(c)) return;
      var p = pinXY(c); if (!p) return;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'rv-pin' + (c.status === 'resolved' ? ' res' : '');
      b.textContent = i + 1; b.style.left = p.x + 'px'; b.style.top = p.y + 'px';
      b.setAttribute('aria-label', 'Comment ' + (i+1) + ' by ' + (c.author || 'reviewer'));
      b.onclick = function(e){ e.stopPropagation(); var r = b.getBoundingClientRect(); thread(c.id, r.right, r.top); };
      layer.appendChild(b);
    });
    if (panel) drawPanel();
  }
  var raf = 0; function soon(){ if (!raf) raf = requestAnimationFrame(function(){ raf = 0; render(); }); }
  addEventListener('resize', soon); addEventListener('scroll', soon, true); addEventListener('hashchange', function(){ closePop(); soon(); });
  document.addEventListener('dumo:screen', function(){ closePop(); soon(); });
  setInterval(function(){ if (!pop) render(); }, 1200);

  // ---------- panel ----------
  function drawPanel(){
    var items = load().sort(function(a,b){ return a.ts - b.ts; });
    var nums = {}; items.forEach(function(c, i){ nums[c.id] = i + 1; });
    var shown = items.filter(function(c){ return filter === 'all' || (filter === 'open' ? c.status !== 'resolved' : c.status === 'resolved'); });
    var groups = {};
    shown.forEach(function(c){ var g = (c.page === 'index.html' ? 'Hub' : c.page) ; (groups[g] = groups[g] || []).push(c); });
    var body = Object.keys(groups).map(function(g){
      return '<div class="rv-where" style="margin-top:14px">' + esc(g) + '</div>' + groups[g].map(function(c){
        return '<button class="rv-item' + (c.status === 'resolved' ? ' res' : '') + '" data-id="' + c.id + '"><span class="num">' + nums[c.id] + '</span><span style="flex:1;min-width:0"><span class="rv-who">' + esc(c.author || 'Reviewer') + '<span class="rv-when">' + when(c.ts) + (c.replies && c.replies.length ? ' · ' + c.replies.length + ' repl' + (c.replies.length > 1 ? 'ies' : 'y') : '') + '</span></span><span class="rv-where" style="display:block;text-transform:none;letter-spacing:0;font-weight:500">' + esc(c.ctxLabel || '') + '</span><span class="rv-txt" style="display:block">' + esc(c.text) + '</span></span></button>';
      }).join('');
    }).join('') || '<p class="rv-empty">No ' + (filter === 'all' ? '' : filter + ' ') + 'comments yet.<br>Press <b>C</b> and click anywhere to add one.</p>';
    panel.querySelector('.body').innerHTML = body;
    panel.querySelectorAll('.rv-filter button').forEach(function(b){ b.classList.toggle('on', b.dataset.f === filter); });
    panel.querySelectorAll('.rv-item').forEach(function(b){ b.onclick = function(){ jump(b.dataset.id); }; });
  }
  function openPanel(){
    if (panel){ closePanel(); return; }
    panel = document.createElement('aside'); panel.className = 'rv-ui rv-panel'; panel.setAttribute('aria-label','All feedback');
    panel.innerHTML = '<header><div style="display:flex;justify-content:space-between;align-items:center"><h2>Feedback</h2><button class="rv-b" data-x="close" aria-label="Close">Close</button></div>' +
      '<div class="rv-filter"><button data-f="open">Open</button><button data-f="resolved">Resolved</button><button data-f="all">All</button></div>' +
      '<div class="rv-row" style="justify-content:flex-start"><button class="rv-b p" data-x="send">Send feedback</button><button class="rv-b" data-x="copy">Copy</button><button class="rv-b" data-x="json">Download</button><button class="rv-b" data-x="import">Import</button></div>' +
      '<p style="margin:0;font-size:12px;color:#6B5D49">Comments are saved in this browser. When you are done, press <b>Send feedback</b> so the team receives them.</p></header><div class="body"></div>';
    document.body.appendChild(panel); drawPanel();
    panel.querySelector('[data-x=close]').onclick = closePanel;
    panel.querySelectorAll('.rv-filter button').forEach(function(b){ b.onclick = function(){ filter = b.dataset.f; drawPanel(); }; });
    panel.querySelector('[data-x=send]').onclick = sendMenu;
    panel.querySelector('[data-x=copy]').onclick = function(){ copy(asText()); };
    panel.querySelector('[data-x=json]').onclick = download;
    panel.querySelector('[data-x=import]').onclick = importFile;
  }
  function closePanel(){ if (panel){ panel.remove(); panel = null; } }

  function jump(id){
    var c = load().filter(function(i){ return i.id === id; })[0]; if (!c) return;
    if (c.page !== pageId()){
      location.href = root + (c.page === 'index.html' ? '' : c.page) + '?pin=' + id + (c.ctx && c.ctx.charAt(0) === '#' ? c.ctx : (c.ctx ? '#' + c.ctx : ''));
      return;
    }
    goCtx(c, function(){ var p = pinXY(c); if (!p) return; scrollTo({ top: Math.max(0, p.y - innerHeight/2), behavior: 'smooth' }); setTimeout(function(){ render(); thread(id, Math.min(p.x - scrollX, innerWidth - 320), p.y - scrollY); }, 350); });
  }
  function goCtx(c, done){
    if (here(c)) return done();
    if (typeof window.dumoReviewGoto === 'function') window.dumoReviewGoto(c.ctx);
    else if (c.ctx && c.ctx.charAt(0) === '#') location.hash = c.ctx;
    setTimeout(done, 300);
  }
  function openFromUrl(){
    var m = /[?&]pin=([a-z0-9]+)/.exec(location.search); if (!m) return;
    setTimeout(function(){ jump(m[1]); }, 600);
  }

  // ---------- export / import ----------
  function asText(){
    var items = load().sort(function(a,b){ return a.ts - b.ts; });
    var lines = [CFG.project + ' — ' + items.length + ' comment(s) · exported ' + new Date().toLocaleString(), ''];
    items.forEach(function(c, i){
      lines.push('#' + (i+1) + ' [' + (c.status === 'resolved' ? 'resolved' : 'open') + '] ' + (c.page) + ' › ' + (c.ctxLabel || c.ctx || ''));
      lines.push('   ' + (c.author || 'Reviewer') + ': ' + c.text.replace(/\n/g, '\n   '));
      (c.replies || []).forEach(function(r){ lines.push('   ↳ ' + (r.author || 'Reviewer') + ': ' + r.text.replace(/\n/g, '\n     ')); });
      lines.push('   Open: ' + root + (c.page === 'index.html' ? '' : c.page) + '?pin=' + c.id + (c.ctx && c.ctx.charAt(0) === '#' ? c.ctx : ''));
      lines.push('');
    });
    return lines.join('\n');
  }
  function sendMenu(){
    var items = load(); if (!items.length){ toast('Add a comment first'); return; }
    closePop();
    pop = document.createElement('div'); pop.className = 'rv-ui rv-pop'; pop.setAttribute('role','dialog'); pop.setAttribute('aria-label','Send feedback');
    pop.innerHTML = '<b style="font-size:15px">Send ' + items.length + ' comment' + (items.length > 1 ? 's' : '') + ' to the team</b>' +
      '<p style="margin:0;font-size:13px;color:#6B5D49">Pick whichever is easiest. The team can import the file to see every pin in place.</p>' +
      '<button class="rv-b p" data-x="mail">Email it</button><button class="rv-b" data-x="gh">Post as GitHub issue</button><button class="rv-b" data-x="file">Download file to attach (WhatsApp / email)</button><button class="rv-b" data-x="cp">Copy text</button>';
    document.body.appendChild(pop); positionPop(innerWidth - 400, 120);
    pop.querySelector('[data-x=mail]').onclick = function(){
      var body = asText(); if (body.length > 1800) body = body.slice(0, 1800) + '\n\n[…truncated — please also attach the downloaded feedback file]';
      location.href = 'mailto:?subject=' + encodeURIComponent(CFG.project + ' feedback') + '&body=' + encodeURIComponent(body);
    };
    pop.querySelector('[data-x=gh]').onclick = function(){
      var body = asText(); if (body.length > 6000) body = body.slice(0, 6000) + '\n\n[…truncated]';
      open('https://github.com/' + CFG.repo + '/issues/new?title=' + encodeURIComponent('Design feedback from ' + (getName() || 'client') + ' — ' + new Date().toLocaleDateString()) + '&labels=feedback&body=' + encodeURIComponent('```\n' + body + '\n```\n\n<details><summary>Raw JSON (for import)</summary>\n\n```json\n' + JSON.stringify(items).slice(0, 1500) + '\n```\n</details>'), '_blank', 'noopener');
    };
    pop.querySelector('[data-x=file]').onclick = download;
    pop.querySelector('[data-x=cp]').onclick = function(){ copy(asText()); };
  }
  function copy(t){ (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function(){ toast('Copied to clipboard'); }, function(){ prompt('Copy the feedback:', t); }); }
  function download(){
    var blob = new Blob([JSON.stringify({ project: CFG.project, exported: new Date().toISOString(), by: getName(), comments: load() }, null, 2)], { type: 'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'dumo-feedback-' + (getName() || 'review').replace(/\W+/g,'-').toLowerCase() + '-' + new Date().toISOString().slice(0,10) + '.json';
    document.body.appendChild(a); a.click(); a.remove(); toast('Feedback file downloaded');
  }
  function importFile(){
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = function(){
      var f = inp.files[0]; if (!f) return;
      f.text().then(function(t){
        var d = JSON.parse(t); var incoming = Array.isArray(d) ? d : (d.comments || []);
        var items = load(); var byId = {}; items.forEach(function(i){ byId[i.id] = i; });
        var added = 0; incoming.forEach(function(i){ if (i && i.id && !byId[i.id]){ items.push(i); added++; } });
        save(items); render(); toast(added + ' comment' + (added === 1 ? '' : 's') + ' imported');
      }).catch(function(){ toast('That file could not be read'); });
    };
    inp.click();
  }

  function toast(m){ var t = document.createElement('div'); t.className = 'rv-toast'; t.setAttribute('role','status'); t.textContent = m; document.body.appendChild(t); setTimeout(function(){ t.remove(); }, 2200); }

  // ---------- wiring ----------
  bar.addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.a === 'toggle'){ var o = bar.classList.toggle('rv-open'); tg.setAttribute('aria-expanded', o); return; }
    if (b.dataset.a === 'extra'){ fold(); CFG.extra.run(); return; }
    if (b.dataset.a === 'mode'){ setMode(!mode); fold(); }
    if (b.dataset.a === 'list'){ openPanel(); fold(); }
    if (b.dataset.a === 'pins'){ showPins = !showPins; document.documentElement.classList.toggle('rv-hidepins', !showPins); b.setAttribute('aria-pressed', showPins); b.classList.toggle('on', !showPins); }
  });
  document.addEventListener('keydown', function(e){
    var t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
    if (e.key === 'Escape'){ if (mode) setMode(false); else if (pop) closePop(); else if (panel) closePanel(); }
    else if (!typing && !e.metaKey && !e.ctrlKey && !e.altKey && (e.key === 'c' || e.key === 'C')) setMode(!mode);
  });
  document.addEventListener('mousedown', function(e){ if (pop && !pop.contains(e.target) && !e.target.closest('.rv-pin') && !e.target.closest('.rv-catch')) closePop(); });
  window.dumoReview = { render: render, count: function(){ return load().length; } };
})();
