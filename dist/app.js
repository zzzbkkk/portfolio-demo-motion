(() => {
  'use strict';
  const {projects,email,imageSizes}=window.PORTFOLIO_DATA;
  const collectionProjects=[...projects],radioIndex=collectionProjects.findIndex(w=>w.id==='radio');
  if(radioIndex>=0&&radioIndex<collectionProjects.length-1)collectionProjects.splice(radioIndex+1,0,collectionProjects.splice(radioIndex,1)[0]);
  const page=document.body.dataset.page;
  const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const url=w=>`project.html?work=${encodeURIComponent(w.id)}`;
  const crops={'ip-black':[388,303,696,662],'ip-white':[459,81,691,920],'ip-lin':[111,163,850,1167],'ip-yaba':[265,234,506,675],'ip-fufu':[668,444,1065,799]};
  const thumbs=new Set(projects.map(w=>w.cover).concat(['aigc-snow','poster-no-image','poster-sea','poster-seventh']));
  const getSize=n=>imageSizes[n]||[1,1];
  function image(name,alt,{thumb=false,eager=false,crop=false}={}){
    const [w,h]=getSize(name),path=thumb&&thumbs.has(name)&&!(crop&&crops[name])?`assets/thumbs/${name}.webp`:`assets/${name}.webp`;
    const tag=`<img src="${path}" alt="${esc(alt)}" width="${w}" height="${h}" loading="${eager?'eager':'lazy'}"${eager?' fetchpriority="high"':''}>`;
    if(!crop||!crops[name])return tag;
    const [x,y,cw,ch]=crops[name];return `<span class="art-viewport" style="--ratio:${cw/ch};--iw:${w/cw*100}%;--ix:${-x/cw*100}%;--iy:${-y/ch*100}%">${tag}</span>`;
  }
  function read(key,fallback=''){try{return sessionStorage.getItem(`demo-motion-${key}`)||fallback;}catch{return fallback;}}
  function write(key,value){try{sessionStorage.setItem(`demo-motion-${key}`,value);}catch{}}
  const revisiting=read('seen-'+page)==='true';
  write('seen-'+page,'true');
  const themes=[
    {id:'gray',name:'混凝土灰',bg:'#bec1ca',ink:'#080808',secondary:'#b4b7c0',line:'#a2a4ac',nav:['#989aa2','#a2a4ac','#b0b3bb']},
    {id:'green',name:'橄榄绿',bg:'#919e44',ink:'#080808',secondary:'#8a9641',line:'#7b863a',nav:['#747e36','#7b863a','#86923f']},
    {id:'orange',name:'锈橙',bg:'#ff633d',ink:'#080808',secondary:'#f25e3a',line:'#d95434',nav:['#cc4f31','#d95434','#ec5c38']},
    {id:'white',name:'纸白',bg:'#ffffff',ink:'#080808',secondary:'#f2f2f2',line:'#d0d0d0',nav:['#cbcece','#dadddc','#e7e7e7']},
    {id:'red',name:'深红',bg:'#c31f26',ink:'#080808',secondary:'#b41d23',line:'#a61a20',nav:['#9c191e','#a61a20','#b41d23']}
  ];
  let themeTransition;
  function applyTheme(id){
    const t=themes.find(t=>t.id===id)||themes[0],root=document.documentElement;
    for(const [key,value]of Object.entries({bg:t.bg,ink:t.ink,secondary:t.secondary,line:t.line}))root.style.setProperty(`--${key}`,value);
    t.nav.forEach((color,i)=>root.style.setProperty(`--nav-${i+1}`,color));
    root.dataset.theme=t.id;document.querySelector('meta[name="theme-color"]').content=t.bg;
    document.querySelectorAll('[data-theme-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeChoice===t.id)));
    write('theme',t.id);
  }
  function theme(id,event){
    if(id===document.documentElement.dataset.theme)return;
    if(reduce()||!document.startViewTransition||!event){applyTheme(id);return;}
    themeTransition?.skipTransition();
    const rect=event.currentTarget.getBoundingClientRect(),x=event.clientX||rect.left+rect.width/2,y=event.clientY||rect.top+rect.height/2;
    const radius=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y))*1.18;
    document.documentElement.dataset.themeTransition='capturing';
    const transition=document.startViewTransition(()=>applyTheme(id));themeTransition=transition;
    transition.ready.then(()=>{
      const frames=Array.from({length:45},(_,i)=>{
        const p=i/44,r=radius*(1-Math.pow(1-p,3)),points=Array.from({length:96},(_,j)=>{const a=j/96*Math.PI*2,wave=(Math.sin(a*5+p*9)*.055+Math.sin(a*11-p*5)*.027)*Math.sin(p*Math.PI),d=r*(1+wave);return `${(x+Math.cos(a)*d).toFixed(1)}px ${(y+Math.sin(a)*d).toFixed(1)}px`;});
        return {clipPath:`polygon(${points.join(',')})`,offset:p};
      });
      document.documentElement.animate(frames,{duration:1200,easing:'linear',fill:'both',pseudoElement:'::view-transition-new(root)'});
      document.documentElement.dataset.themeTransition='running';
    }).catch(()=>{});
    transition.finished.then(()=>{if(themeTransition===transition)document.documentElement.dataset.themeTransition='idle';}).catch(()=>{});
  }
  function copyEmail(){location.href='demo.html#contact-demo';}
  function navigation(){
    const current=dest=>page===dest?' aria-current="page"':page==='project'&&dest==='works'?' aria-current="location"':'';
    document.querySelector('#navigation').innerHTML=`<div class="site-controls"><button class="grid-toggle" type="button" aria-pressed="false" aria-label="显示排版网格" title="显示排版网格"></button><nav class="primary-tabs" aria-label="主导航"><a href="index.html"${current('home')}><span>首页</span></a><a href="works.html"${current('works')}><span>作品集</span></a><a href="about.html"${current('about')}><span>关于我</span></a></nav><button class="menu-trigger" type="button" aria-expanded="false" aria-controls="nav-sheet">菜单</button></div><div class="ghost-names" aria-hidden="true"><span>Lin</span><span>Yu</span></div><div class="grid-overlay" hidden aria-hidden="true">${Array.from({length:8},()=>'<span></span>').join('')}</div>`;
    const dialog=document.createElement('dialog');dialog.id='nav-sheet';dialog.className='nav-sheet';dialog.setAttribute('aria-label','网站菜单');
    dialog.innerHTML=`<nav class="nav-tiles" aria-label="展开导航"><a class="nav-tile" href="index.html"${current('home')}><small>1</small><span data-roll="首页">首页</span></a><a class="nav-tile" href="works.html"${current('works')}><small>2</small><span data-roll="作品集">作品集</span></a><a class="nav-tile" href="about.html"${current('about')}><small>3</small><span data-roll="关于我">关于我</span></a></nav><a class="nav-about" href="contact.html"${current('contact')}>联系林予 ↗</a><button type="button" class="menu-close">关闭</button>`;
    document.body.append(dialog);
    dialog.querySelectorAll('[data-roll]').forEach(el=>{el.innerHTML=`<span class="roll-inner"><span>${esc(el.dataset.roll)}</span><span aria-hidden="true">${esc(el.dataset.roll)}</span></span>`;});
    const trigger=document.querySelector('.menu-trigger');
    trigger.addEventListener('click',()=>{
      dialog.showModal();trigger.setAttribute('aria-expanded','true');
      window.siteScroll?.stop();
      if(!reduce()){const mobile=matchMedia('(max-width:767px)').matches;dialog.querySelectorAll('.nav-tile').forEach((el,i)=>el.animate([{clipPath:mobile?'inset(0 0 0 100%)':'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:800,delay:(mobile?i:2-i)*100,easing:'cubic-bezier(.25,1,.5,1)',fill:'backwards'}));}
    });
    function closeMenu(){if(!dialog.open)return;if(reduce()){dialog.close();return;}const mobile=matchMedia('(max-width:767px)').matches;Promise.all([...dialog.querySelectorAll('.nav-tile')].map((el,i)=>el.animate([{clipPath:'inset(0 0 0 0)'},{clipPath:mobile?'inset(0 0 0 100%)':'inset(0 0 100% 0)'}],{duration:400,delay:i*70,easing:'cubic-bezier(.5,0,.75,0)',fill:'forwards'}).finished)).then(()=>{dialog.close();dialog.querySelectorAll('.nav-tile').forEach(el=>el.getAnimations().forEach(a=>a.cancel()));});}
    dialog.querySelector('.menu-close').addEventListener('click',closeMenu);
    dialog.addEventListener('click',e=>{if(e.target===dialog)closeMenu();});
    dialog.addEventListener('close',()=>{window.siteScroll?.start();trigger.setAttribute('aria-expanded','false');trigger.focus({preventScroll:true});});
    dialog.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>dialog.close()));
    const gridButton=document.querySelector('.grid-toggle'),overlay=document.querySelector('.grid-overlay');
    gridButton.addEventListener('click',()=>{overlay.hidden=!overlay.hidden;gridButton.setAttribute('aria-pressed',String(!overlay.hidden));gridButton.setAttribute('aria-label',overlay.hidden?'显示排版网格':'隐藏排版网格');});
    if(page==='home'){
      document.querySelector('#theme-grid').innerHTML=themes.map(t=>`<button type="button" class="theme-button" data-theme-choice="${t.id}" aria-label="切换为${t.name}配色" aria-pressed="false" style="--swatch:${t.bg}"><span></span><small>${t.name}</small></button>`).join('');
    }
    document.querySelectorAll('[data-theme-choice]').forEach(b=>b.addEventListener('click',e=>theme(b.dataset.themeChoice,e)));
    const footer=document.querySelector('#footer');footer.className='footer';
    footer.innerHTML=`${page!=='contact'?`<div class="footer-contact"><p>联系林予</p><a href="demo.html#contact-demo">${email} ↗</a></div><div id="footer-dial"></div>`:''}<div class="footer-bottom"><p>林予的视觉传达设计作品集</p><a class="footer-name" href="index.html">Lin Yu</a><a href="#main">回到顶部 ↑</a></div>`;
    const dialHost=document.querySelector(page==='contact'?'#contact-dial':'#footer-dial');if(dialHost)dial(dialHost);
    applyTheme(read('theme','orange'));
    const sentinel=document.createElement('span');
    sentinel.className='nav-sentinel';sentinel.setAttribute('aria-hidden','true');
    document.body.prepend(sentinel);
    new IntersectionObserver(([entry])=>document.body.classList.toggle('is-scrolled',!entry.isIntersecting)).observe(sentinel);
  }
  function dial(host){
    const actions=[['首页','index.html'],['作品集','works.html'],['关于我','about.html'],['联系',`demo.html#contact-demo`],['说明','copy'],['白','white'],['绿','green'],['橙','orange'],['红','red']];
    const points=actions.map((a,i)=>{const angle=-150+i*35,rad=angle*Math.PI/180;return{x:250+197.5*Math.sin(rad),y:250-197.5*Math.cos(rad),angle};});
    const circle=(x,y,r)=>`M ${x-r} ${y} a ${r} ${r} 0 1 0 ${r*2} 0 a ${r} ${r} 0 1 0 ${-r*2} 0 Z`;
    const path=circle(250,250,249)+circle(250,250,128)+points.map(p=>circle(p.x,p.y,40)).join('');
    host.innerHTML=`<div class="dial-frame"><div class="dial" aria-label="联系与导航拨盘"><div class="dial-base"></div><div class="dial-center">林予<small>LIN YU</small></div>${actions.map((a,i)=>a[1].includes('.html')||a[1].startsWith('mailto:')?`<a class="dial-key" href="${a[1]}" style="--angle:${points[i].angle}deg">${a[0]}</a>`:`<button class="dial-key" data-dial-action="${a[1]}" style="--angle:${points[i].angle}deg" type="button" aria-label="${a[1]==='copy'?'查看演示说明':'切换'+a[0]+'色配色'}">${a[0]}</button>`).join('')}<div class="dial-overlay"><svg viewBox="0 0 500 500" aria-hidden="true"><path class="dial-material" fill-rule="evenodd" d="${path}"></path></svg></div><span class="dial-stop" aria-hidden="true"></span></div></div><p class="dial-help">转动拨盘，或点击圆孔中的入口。</p>`;
    host.querySelectorAll('[data-dial-action]').forEach(b=>b.addEventListener('click',e=>b.dataset.dialAction==='copy'?copyEmail(b):theme(b.dataset.dialAction,e)));
    const ring=host.querySelector('.dial-overlay'),material=host.querySelector('.dial-material');let gesture=null;
    function angle(e){const r=ring.getBoundingClientRect();return Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)*180/Math.PI;}
    material.addEventListener('pointerdown',e=>{if(e.button!==0)return;gesture={id:e.pointerId,start:angle(e)};material.setPointerCapture(e.pointerId);ring.style.transition='none';ring.classList.add('is-dragging');});
    material.addEventListener('pointermove',e=>{if(!gesture)return;let delta=angle(e)-gesture.start;if(delta>180)delta-=360;if(delta< -180)delta+=360;ring.style.transform=`rotate(${Math.max(-6,Math.min(60,delta))}deg)`;});
    const release=e=>{if(!gesture)return;if(material.hasPointerCapture(e.pointerId))material.releasePointerCapture(e.pointerId);gesture=null;ring.classList.remove('is-dragging');ring.style.transition=reduce()?'none':'transform .9s cubic-bezier(.2,1.4,.3,1)';ring.style.transform='rotate(0deg)';};
    material.addEventListener('pointerup',release);material.addEventListener('pointercancel',release);
  }
  const svgNS='http://www.w3.org/2000/svg';
  function svgNode(tag,attrs={}){const n=document.createElementNS(svgNS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;}
  const effects=svgNode('svg',{width:0,height:0,'aria-hidden':'true'});effects.style.position='absolute';const defs=svgNode('defs');effects.append(defs);document.body.append(effects);
  function tween(duration,fn,end){const start=performance.now();function run(now){const p=Math.min(1,(now-start)/duration);fn(p);if(p<1)requestAnimationFrame(run);else end?.();}requestAnimationFrame(run);}
  let effectIndex=0;
  function goo(el,delay=200){
    if(reduce()||el.dataset.gooDone)return;el.dataset.gooDone='true';
    const duration=page==='home'&&!revisiting?1200:650;
    if(duration<1200)delay=Math.min(delay,100);
    const id=`goo-${++effectIndex}`,filter=svgNode('filter',{id,x:'-40%',y:'-100%',width:'180%',height:'300%','color-interpolation-filters':'sRGB'}),blur=svgNode('feGaussianBlur',{'in':'SourceGraphic',stdDeviation:50,result:'soft'}),matrix=svgNode('feColorMatrix',{'in':'soft',type:'matrix',values:'1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -8'});
    filter.append(blur,matrix);defs.append(filter);el.style.filter=`url(#${id})`;
    tween(duration+delay,p=>{const t=Math.max(0,(p*(duration+delay)-delay)/duration),fade=Math.max(0,(t-.65)/.35);blur.setAttribute('stdDeviation',String(50*Math.pow(1-t,4)));matrix.setAttribute('values',`1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 ${20-19*fade} ${-8+8*fade}`);},()=>{el.style.filter='';el.dataset.revealed='true';filter.remove();});
  }
  function wave(el){
    if(reduce()||el.dataset.waveDone)return;el.dataset.waveDone='true';
    const target=el.querySelector('img')||el,id=`wave-${++effectIndex}`,id2=id+'-inner';
    const clip=svgNode('clipPath',{id,clipPathUnits:'objectBoundingBox'}),clip2=svgNode('clipPath',{id:id2,clipPathUnits:'objectBoundingBox'}),path=svgNode('path'),path2=svgNode('path');clip.append(path);clip2.append(path2);defs.append(clip,clip2);
    const seed=effectIndex,offsets=Array.from({length:13},(_,i)=>Math.sin(i*2.47+seed)*.075);
    function d(progress){let p=`M 0 0 L 0 ${progress+offsets[0]*Math.sin(progress*Math.PI)}`;for(let i=1;i<13;i++){const x=i/12,prev=(i-1)/12,y=progress+offsets[i]*Math.sin(progress*Math.PI),py=progress+offsets[i-1]*Math.sin(progress*Math.PI),mid=(x+prev)/2;p+=` C ${mid} ${py} ${mid} ${y} ${x} ${y}`;}return p+' L 1 0 Z';}
    path.setAttribute('d',d(0));path2.setAttribute('d',d(0));el.style.clipPath=`url(#${id})`;target.style.clipPath=`url(#${id2})`;
    const ease=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
    const duration=revisiting?700:1000,lag=80;
    tween(duration+lag,p=>{path.setAttribute('d',d(ease(Math.min(1,p*(duration+lag)/duration))));path2.setAttribute('d',d(ease(Math.max(0,(p*(duration+lag)-lag)/duration))));},()=>{el.style.clipPath='';target.style.clipPath='';clip.remove();clip2.remove();});
  }
  function observeEffects(root=document){
    if(reduce())return;
    const obs=new IntersectionObserver(entries=>{let order=0;entries.forEach(e=>{if(e.isIntersecting){obs.unobserve(e.target);if(e.target.hasAttribute('data-goo'))goo(e.target,150+Math.min(order++,4)*100);else wave(e.target);}});},{threshold:.13});
    root.querySelectorAll('[data-goo]:not([data-goo-done]),.wave-image:not([data-wave-done])').forEach(el=>obs.observe(el));
  }
  async function globe(stage,works){
    stage._latestWorks=works;
    if(stage._globe){await stage._globe.setWorks(works);return stage._globe;}
    if(stage._loading)return stage._loading;
    stage._loading=(async()=>{
      try{
        const {createGlobe}=await import('./globe.js?v=045');
        const controller=await createGlobe(stage,works,{onOpen:w=>location.href=url(w),onHover:w=>stage.setAttribute('title',w?`${w.name}，点击查看`:'拖动旋转作品球')});stage._globe=controller;
        if(stage._latestWorks!==works)await controller.setWorks(stage._latestWorks);
        const parent=stage.closest('.featured-sticky,#work-sphere');
        parent?.querySelectorAll('[data-globe-toggle]').forEach(b=>{if(reduce())b.textContent='开始旋转';b.addEventListener('click',()=>b.textContent=controller.toggle()?'暂停旋转':'开始旋转');});
        parent?.querySelectorAll('[data-globe-turn]').forEach(b=>b.addEventListener('click',()=>controller.turn(Number(b.dataset.globeTurn))));
        return controller;
      }catch(error){
        stage.dataset.engine='fallback';stage.innerHTML=`<div class="globe-fallback">${works.map(w=>`<a href="${url(w)}" aria-label="查看${esc(w.name)}">${image(w.cover,w.name,{thumb:true})}</a>`).join('')}</div>`;stage.setAttribute('aria-label','当前环境无法启用三维，以下是同一批作品的可访问图集');console.warn('3D unavailable; using accessible artwork fallback.',error.message);return null;
      }
    })();return stage._loading;
  }
  function home(){
    const stage=document.querySelector('[data-globe="home"]');
    const obs=new IntersectionObserver(e=>{if(e[0].isIntersecting){obs.disconnect();globe(stage,projects);}},{rootMargin:'300px'});obs.observe(stage);
    const fluidMedia=matchMedia('(min-width:992px) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
    let fluidStarted=false;
    const startFluid=()=>{
      if(fluidStarted||!fluidMedia.matches)return;
      fluidStarted=true;
      import('./motion.js?v=061').then(m=>m.initFluidArtwork(document.querySelector('.intro'),projects)).catch(()=>{
        document.querySelector('.intro-canvas').dataset.flow='unavailable';
      });
    };
    startFluid();fluidMedia.addEventListener('change',startFluid);
    const section=document.querySelector('.featured'),heading=section.querySelector('.featured-title');let pending=false;
    function update(){pending=false;const r=section.getBoundingClientRect(),p=Math.max(0,Math.min(1,(innerHeight-r.top)/(r.height+innerHeight)));heading.style.setProperty('--spread',String(Math.sin(p*Math.PI)));heading.classList.toggle('is-finished',p>.78);}
    addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update);}},{passive:true});update();
  }
  function works(){
    if(window.PORTFOLIO_PAGES)return window.PORTFOLIO_PAGES.works({projects,orderedProjects:collectionProjects,image,url,esc,reduce,globe,read,write});
    const params=new URLSearchParams(location.search),filters=['all','brand','editorial','illustration','aigc'];
    let selected=filters.includes(params.get('category'))?params.get('category'):'all',mode=params.get('view')==='sphere'?'sphere':'cards',current=[];
    const cards=document.querySelector('#work-cards'),sphere=document.querySelector('#work-sphere'),count=document.querySelector('#work-count');
    const types={editorial:'编辑',brand:'视觉',illustration:'插画',aigc:'AIGC'};
    function render(animate=true){
      current=projects.filter(w=>selected==='all'||w.tags.includes(selected));cards.replaceChildren();
      current.forEach(w=>{
        const a=document.createElement('a');a.className='case-card';a.href=url(w);a.dataset.id=w.id;a.setAttribute('aria-label',`查看${w.name}，${w.category}`);
        const cover=w.id==='book-posters'?'poster-no-image':w.cover,source=crops[cover],size=getSize(cover),ratio=source?source[2]/source[3]:size[0]/size[1];
        a.style.setProperty('--work-color',w.color);a.style.setProperty('--art-ratio',String(ratio));a.dataset.format=ratio>1.2?'landscape':'portrait';
        a.innerHTML=`<div class="case-picture"><div class="case-mat">${image(cover,w.name,{thumb:true,crop:true})}</div></div><div class="case-meta"><span>${types[w.tags[0]]||'设计'}</span><h2>${esc(w.name)}</h2></div><span class="case-explore">查看作品 ↗</span>`;
        a.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||reduce())return;const r=a.getBoundingClientRect();a.style.setProperty('--rx',`${-(e.clientY-r.top-r.height/2)/r.height*32}deg`);a.style.setProperty('--ry',`${(e.clientX-r.left-r.width/2)/r.width*45}deg`);});
        a.addEventListener('pointerleave',()=>{a.style.setProperty('--rx','0deg');a.style.setProperty('--ry','0deg');});cards.append(a);
      });
      count.textContent=`${current.length} 件作品`;cards.hidden=mode!=='cards';sphere.hidden=mode!=='sphere';
      document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
      document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===selected)));
      const strip=document.querySelector('.filter-strip'),active=strip.querySelector('[aria-pressed="true"]');const s=strip.getBoundingClientRect(),r=active.getBoundingClientRect();if(r.left<s.left||r.right>s.right)strip.scrollTo({left:active.offsetLeft-strip.offsetLeft-12,behavior:'instant'});
      document.querySelector('#sphere-index').innerHTML=current.map(w=>`<a href="${url(w)}">${esc(w.name)}</a>`).join('');
      if(mode==='sphere')globe(document.querySelector('[data-globe="works"]'),current);
      else if(!reduce()){cards.querySelectorAll('.case-card').forEach((el,i)=>el.animate([{transform:`translateX(${i%2?100:-100}vw)`},{transform:'none'}],{duration:900,delay:Math.floor(i/2)*40,easing:'cubic-bezier(.25,1,.5,1)',fill:'backwards'}));}
      const q=new URLSearchParams();if(selected!=='all')q.set('category',selected);if(mode==='sphere')q.set('view','sphere');
      try{history.replaceState(null,'',`${location.pathname}${q.size?'?'+q:''}`);}catch{}write('work-query',q.toString());
    }
    document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{if(selected===b.dataset.filter)return;selected=b.dataset.filter;render();}));
    document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;render();(mode==='sphere'?sphere:document.querySelector('#work')).scrollIntoView({behavior:reduce()?'instant':'smooth'});}));
    render(false);
    const entry=document.querySelector('.work-entry');let scrollFrame=false;
    function frame(){scrollFrame=false;const p=Math.max(0,Math.min(1,-entry.getBoundingClientRect().top/(innerHeight*.65)));entry.style.setProperty('--portal',p.toFixed(3));}
    addEventListener('scroll',()=>{if(!scrollFrame){scrollFrame=true;requestAnimationFrame(frame);}},{passive:true});frame();
  }
  function project(){
    const target=document.querySelector('#project-content'),id=new URLSearchParams(location.search).get('work'),w=projects.find(w=>w.id===id);
    if(!w){target.innerHTML='<div class="not-found"><h1>没有找到这件作品。</h1><a class="inline-link" href="works.html">返回作品</a></div>';return;}
    document.title=`${w.name} · 林予`;document.querySelector('meta[name="description"]').content=w.intro;
    const query=read('work-query'),category=new URLSearchParams(query).get('category');
    const filteredProjects=collectionProjects.filter(p=>!category||p.tags.includes(category));
    const sequence=filteredProjects.includes(w)?filteredProjects:collectionProjects;
    const next=sequence[(sequence.indexOf(w)+1)%sequence.length];
    if(window.PORTFOLIO_CASESTUDIES){
      window.PORTFOLIO_CASESTUDIES.render({target,work:w,next,query,image,url,esc,size:getSize});
      lightbox(w);return;
    }
    target.innerHTML=`<section class="project-intro"><div class="project-side"><a href="works.html${query?'?'+esc(query):''}">← 返回作品</a><p>${esc(w.category)}</p></div><h1 class="project-title" data-goo>${esc(w.name)}</h1></section><div class="project-summary"><p data-goo>${esc(w.intro)}</p><small>${esc(w.note)}</small></div><div class="project-gallery">${w.gallery.map((g,i)=>`<figure class="${getSize(g.image)[0]/getSize(g.image)[1]>1.3?'wide':''}"><button type="button" class="gallery-button wave-image" data-gallery="${i}" aria-label="放大查看：${esc(g.caption)}">${image(g.image,g.caption,{eager:i===0,crop:true})}</button><figcaption>${esc(g.caption)}</figcaption></figure>`).join('')}</div><a class="next-case" href="${url(next)}"><span>下一件作品</span><h2 data-goo>${esc(next.name)}</h2>${image(next.cover,next.name,{thumb:true})}</a>`;
    lightbox(w);
  }
  function lightbox(work){
    const d=document.createElement('dialog');d.className='lightbox';d.setAttribute('aria-label',`${work.name}大图查看`);
    d.innerHTML='<div class="lightbox-top"><p></p><div><button type="button" class="zoom-toggle" aria-pressed="false">原始尺寸</button><button type="button" class="lightbox-close">关闭 ×</button></div></div><div class="lightbox-body"></div><div class="lightbox-bottom"><p class="lightbox-caption"></p><div><button type="button" class="image-prev" aria-label="上一张">←</button><button type="button" class="image-next" aria-label="下一张">→</button></div></div>';
    document.body.append(d);let i=0,original=false,opener;
    function render(){const g=work.gallery[i],body=d.querySelector('.lightbox-body');body.innerHTML=image(g.image,g.caption,{eager:true,crop:!original});body.classList.toggle('original',original);body.scrollTop=0;body.scrollLeft=0;d.querySelector('.lightbox-top p').textContent=`${work.name} (${i+1}/${work.gallery.length})`;d.querySelector('.lightbox-caption').textContent=g.caption;const z=d.querySelector('.zoom-toggle');z.textContent=original?'适应屏幕':'原始尺寸';z.setAttribute('aria-pressed',String(original));d.querySelectorAll('.lightbox-bottom button').forEach(b=>b.disabled=work.gallery.length===1);}
    function move(delta){i=(i+delta+work.gallery.length)%work.gallery.length;original=false;render();}
    d.querySelector('.lightbox-body').setAttribute('data-lenis-prevent','');
    document.querySelectorAll('[data-gallery]').forEach(b=>b.addEventListener('click',()=>{i=Number(b.dataset.gallery);opener=b;original=false;render();d.showModal();window.siteScroll?.stop();d.querySelector('.lightbox-close').focus();}));
    d.querySelector('.lightbox-close').addEventListener('click',()=>d.close());d.addEventListener('close',()=>{window.siteScroll?.start();opener?.focus({preventScroll:true});});
    d.querySelector('.image-prev').addEventListener('click',()=>move(-1));d.querySelector('.image-next').addEventListener('click',()=>move(1));d.querySelector('.zoom-toggle').addEventListener('click',()=>{original=!original;render();});
    d.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)&&work.gallery.length>1){e.preventDefault();move(e.key==='ArrowLeft'?-1:1);}});
  }
  document.addEventListener('error',event=>{if(event.target instanceof HTMLImageElement&&!event.target.dataset.failed){event.target.dataset.failed='true';const note=document.createElement('span');note.className='image-error';note.textContent='图片暂时无法加载，请刷新重试。';event.target.after(note);}},true);
  if(window.Lenis&&!reduce()){
    window.siteScroll=new window.Lenis({duration:1.2,smoothWheel:true,touchMultiplier:2,autoRaf:true,anchors:true,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t))});
  }
  navigation();if(page==='home')home();if(page==='works')works();if(page==='project')project();if(page==='about')window.PORTFOLIO_PAGES?.about({projects,image,url,esc,reduce});observeEffects();
  if(!reduce())document.body.animate([{opacity:0,filter:'blur(12px)'},{opacity:1,filter:'blur(0)'}],{duration:page==='home'&&!revisiting?800:revisiting?320:540,easing:'cubic-bezier(.76,0,.24,1)'});
  let leaving=false;
  addEventListener('pageshow',e=>{if(e.persisted){leaving=false;document.body.getAnimations().forEach(a=>a.cancel());window.siteScroll?.start();}});
  document.addEventListener('click',e=>{
    const a=e.target.closest('a');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target==='_blank'||reduce())return;
    const href=a.getAttribute('href');if(!/^(?:index|works|about|contact|project)\.html(?:[?#].*)?$/.test(href||''))return;
    if(leaving){e.preventDefault();return;}e.preventDefault();leaving=true;
    window.siteScroll?.stop();
    const seen=read('seen-'+href.split('.')[0])==='true';
    const transition=document.body.animate([{opacity:1,filter:'blur(0)'},{opacity:0,filter:'blur(12px)'}],{duration:seen?280:420,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'});
    transition.finished.finally(()=>location.href=href);
  });
})();
