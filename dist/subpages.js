(() => {
  'use strict';
  const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
  const ease='cubic-bezier(.25,1,.5,1)';
  const finish=animation=>animation.finished.catch(()=>{});
  function scrollToElement(target,reduce){
    if(reduce())target.scrollIntoView({behavior:'instant'});
    else if(window.siteScroll)window.siteScroll.scrollTo(target,{duration:1.1});
    else target.scrollIntoView({behavior:'smooth'});
  }
  function works({projects,orderedProjects=projects,image,url,esc,reduce,globe,read,write}){
    const params=new URLSearchParams(location.search),allowed=['all','brand','editorial','illustration','aigc'];
    let category=allowed.includes(params.get('category'))?params.get('category'):'all';
    let mode=params.get('view')==='sphere'?'sphere':'cards',current=[],version=0,observer,filtered=false;
    const displayOrder=orderedProjects;
    const entry=document.querySelector('.work-entry'),area=document.querySelector('#work'),cards=document.querySelector('#work-cards'),sphere=document.querySelector('#work-sphere'),stage=sphere.querySelector('[data-globe]');
    const crops={'ip-lin':[111,163,850,1167]},sizes=window.PORTFOLIO_DATA.imageSizes;
    const labels={editorial:'编辑与版式',brand:'视觉设计',illustration:'插画与 IP',aigc:'AIGC'};
    const fromLeft=el=>matchMedia('(min-width:768px)').matches?el.offsetLeft<cards.clientWidth*.25:Number(el.dataset.order)%2===0;
    function sync(){
      document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
      document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));
      document.querySelector('#work-count').textContent=`${current.length} 件作品`;
      document.querySelector('#sphere-index').innerHTML=current.map(w=>`<a href="${url(w)}">${esc(w.name)}</a>`).join('');
      const query=new URLSearchParams();if(category!=='all')query.set('category',category);if(mode==='sphere')query.set('view','sphere');
      history.replaceState(null,'',location.pathname+(query.size?'?'+query:'')+location.hash);
      write('work-query',query.toString());
    }
    function revealCard(el,delay=0){
      if(el.dataset.entered||reduce())return;el.dataset.entered='true';
      const left=fromLeft(el);
      const distance=filtered?(left?-35:35)+'px':(left?-100:100)+'vw';
      el.animate([{transform:`translateX(${distance})`,opacity:0},{transform:'none',opacity:1}],{duration:filtered?420:800,delay,easing:ease,fill:'backwards'});
    }
    function buildCards(){
      observer?.disconnect();cards.replaceChildren();
      current.forEach((w,i)=>{
        const cover=w.id==='book-posters'?'poster-no-image':w.cover,crop=crops[cover],size=sizes[cover],ratio=crop?crop[2]/crop[3]:size[0]/size[1];
        const a=document.createElement('a');a.className='case-card';a.href=url(w);a.dataset.id=w.id;a.dataset.order=String(i);a.dataset.format=ratio>1.2?'landscape':'portrait';
        a.dataset.emphasis=category==='all'&&(w.id==='book-posters'||w.id==='radio')?'feature':'standard';
        a.setAttribute('aria-label',`查看${w.name}，${w.category}`);
        a.style.setProperty('--work-color',w.color);a.style.setProperty('--art-ratio',String(ratio));
        a.innerHTML=`<div class="case-picture"><div class="case-mat">${image(cover,w.name,{thumb:false,crop:true})}</div></div><div class="case-meta"><span class="case-no">${String(displayOrder.indexOf(w)+1).padStart(2,'0')}</span><h2>${esc(w.name)}</h2><span>${labels[w.tags[0]]||'视觉设计'}</span></div><span class="case-explore">查看作品 ↗</span>`;
        if(w.id==='book-posters'&&category==='all'){
          const mat=a.querySelector('.case-mat');mat.classList.add('collection-posters');
          mat.innerHTML=image('poster-birds','',{eager:true})+image('poster-seventh','',{eager:true})+image('poster-no-image',w.name,{eager:true});
        }
        a.addEventListener('pointermove',e=>{
          if(reduce()||e.pointerType==='touch'||!matchMedia('(min-width:768px) and (pointer:fine)').matches)return;
          const r=a.getBoundingClientRect();a.style.setProperty('--rx',`${(1-(e.clientY-r.top)/r.height*2)*12}deg`);a.style.setProperty('--ry',`${((e.clientX-r.left)/r.width*2-1)*18}deg`);
        });
        a.addEventListener('pointerleave',()=>{a.style.setProperty('--rx','0deg');a.style.setProperty('--ry','0deg');});
        cards.append(a);
      });
      observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){observer.unobserve(e.target);revealCard(e.target,Number(e.target.dataset.order)%2*80);}}),{threshold:.1,rootMargin:'0px 0px -30% 0px'});
      cards.querySelectorAll('.case-card').forEach(a=>observer.observe(a));
    }
    async function switchMode(next,scroll=true){
      const request=++version,previous=mode;mode=next;sync();
      cards.getAnimations().forEach(a=>a.cancel());sphere.getAnimations().forEach(a=>a.cancel());
      cards.querySelectorAll('.case-card').forEach(a=>a.getAnimations().forEach(anim=>anim.cancel()));
      const incoming=mode==='cards'?cards:sphere,outgoing=mode==='cards'?sphere:cards;
      if(previous===mode){[incoming,outgoing].forEach(el=>{el.style.position='';el.style.inset='';el.style.width='';});incoming.hidden=false;outgoing.hidden=true;if(mode==='sphere')await globe(stage,current);if(scroll)scrollToElement(mode==='sphere'?sphere:area,reduce);return;}
      incoming.hidden=false;incoming.style.position='absolute';incoming.style.inset='0 0 auto';incoming.style.width='100%';
      if(mode==='sphere')globe(stage,current);
      if(scroll)scrollToElement(mode==='sphere'?sphere:area,reduce);
      const animations=[];
      if(!reduce()){
        if(mode==='sphere'){
          cards.querySelectorAll('.case-card').forEach((a,i)=>animations.push(finish(a.animate([{transform:'none',opacity:1},{transform:`translateX(${fromLeft(a)?-110:110}vw) rotate(${fromLeft(a)?-4:4}deg)`,opacity:0}],{duration:700,delay:Math.min(Math.floor(i/2),2)*45,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'}))));
          animations.push(finish(sphere.animate([{opacity:0,transform:'scale(.82)',filter:'blur(10px)'},{opacity:1,transform:'none',filter:'blur(0)'}],{duration:900,easing:ease})));
        }else{
          animations.push(finish(sphere.animate([{opacity:1,transform:'none'},{opacity:0,transform:'scale(.72)'}],{duration:600,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'})));
          cards.querySelectorAll('.case-card').forEach((a,i)=>{a.dataset.entered='true';animations.push(finish(a.animate([{transform:`translateX(${fromLeft(a)?-110:110}vw)`,opacity:0},{transform:'none',opacity:1}],{duration:950,delay:Math.min(Math.floor(i/2),2)*40,easing:ease})));});
        }
      }
      await Promise.all(animations);if(request!==version)return;
      outgoing.hidden=true;outgoing.getAnimations().forEach(a=>a.cancel());
      outgoing.querySelectorAll('.case-card').forEach(a=>a.getAnimations().forEach(anim=>anim.cancel()));
      incoming.style.position='';incoming.style.inset='';incoming.style.width='';
      if(mode==='cards')cards.querySelectorAll('.case-card').forEach(a=>{const r=a.getBoundingClientRect();if(r.top>innerHeight){delete a.dataset.entered;observer.observe(a);}});
      window.siteScroll?.resize();
    }
    function filter(next){
      if(category===next)return;category=next;version++;
      filtered=true;current=displayOrder.filter(w=>category==='all'||w.tags.includes(category));
      cards.getAnimations().forEach(a=>a.cancel());sphere.getAnimations().forEach(a=>a.cancel());
      [cards,sphere].forEach(el=>{el.style.position='';el.style.inset='';el.style.width='';});
      buildCards();cards.hidden=mode!=='cards';sphere.hidden=mode!=='sphere';sync();
      if(mode==='sphere')globe(stage,current);
      if(area.getBoundingClientRect().top< -100)scrollToElement(area,reduce);
    }
    document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>filter(b.dataset.filter)));
    document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>switchMode(b.dataset.mode)));
    current=displayOrder.filter(w=>category==='all'||w.tags.includes(category));buildCards();cards.hidden=mode!=='cards';sphere.hidden=mode!=='sphere';sync();
    if(mode==='sphere')globe(stage,current);
    let pending=false;
    function position(){
      pending=false;const distance=Math.max(1,entry.offsetHeight-innerHeight-90),p=reduce()?0:clamp(-entry.getBoundingClientRect().top/distance);
      entry.style.setProperty('--portal',p.toFixed(4));entry.classList.toggle('is-open',p>.8);
    }
    addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(position);}},{passive:true});
    addEventListener('resize',position);position();
    return {switchMode};
  }
  function about({projects,image,url,esc,reduce}){
    const practice=[
      {title:'编排与叙事',work:'book-posters',image:'poster-no-image',text:'在海报、书籍与杂志中，通过文字、图像和留白，组织内容的阅读顺序。'},
      {title:'图形与文化',work:'nuo',image:'nuo-cover',text:'从傩文化与椰壳再生等主题中整理信息，用图形和版式建立清晰的层级。'},
      {title:'角色与想象',work:'fuzhou-ip',image:'ip-lin',text:'从城市人物、地域文化和自然场景中提取线索，进行 IP 形象与插画创作。'},
      {title:'AIGC 与数字媒介',work:'radio',image:'aigc-radio',text:'《猫狗电台》关注角色在不同场景中的延展；情绪记录界面则围绕小熊表情、心情选择与日历展开。'}
    ];
    const list=document.querySelector('.practice-list'),images=document.querySelector('.practice-images'),caption=document.querySelector('#practice-caption');
    practice.forEach((item,i)=>{
      const w=projects.find(w=>w.id===item.work),row=document.createElement('div');row.className='practice-row';
      row.innerHTML=`<button type="button" class="practice-button" aria-expanded="${i===0}" aria-controls="practice-detail-${i}"><span class="practice-index">0${i+1}</span><span class="practice-name">${item.title}</span><span class="practice-arrow" aria-hidden="true">↗</span></button><div class="practice-detail" id="practice-detail-${i}"${i?' hidden':''}><div class="practice-mobile-image" style="--preview-color:${w.color}">${image(item.image,w.name,{crop:true})}</div><p>${item.text}</p><a class="inline-link" href="${url(w)}">查看相关作品 ↗</a></div>`;
      list.append(row);
      const frame=document.createElement('div');frame.className='practice-frame';frame.style.setProperty('--preview-color',w.color);frame.hidden=i!==0;
      frame.innerHTML=image(item.image,w.name,{crop:true});images.append(frame);
    });
    const buttons=[...list.querySelectorAll('.practice-button')],details=[...list.querySelectorAll('.practice-detail')],frames=[...images.children];
    let selected=0;caption.textContent='01 / '+projects.find(w=>w.id===practice[0].work).name;
    function select(index){
      if(index===selected)return;const old=selected;selected=index;
      buttons.forEach((b,i)=>b.setAttribute('aria-expanded',String(i===index)));
      details.forEach((d,i)=>d.hidden=i!==index);
      frames.forEach((f,i)=>{f.getAnimations().forEach(a=>a.cancel());f.hidden=i!==index&&i!==old;});
      const w=projects.find(w=>w.id===practice[index].work);caption.textContent=`0${index+1} / ${w.name}`;
      if(reduce()){frames[old].hidden=true;frames[index].hidden=false;return;}
      finish(frames[old].animate([{opacity:1,filter:'blur(0)',transform:'rotate(-3deg)'},{opacity:0,filter:'blur(18px)',transform:'rotate(-8deg) scale(.9)'}],{duration:550,easing:ease})).then(()=>{if(selected!==old)frames[old].hidden=true;});
      frames[index].hidden=false;
      frames[index].animate([{opacity:0,filter:'blur(20px)',transform:'translateY(35px) rotate(8deg) scale(.9)'},{opacity:1,filter:'blur(0)',transform:'translateY(0) rotate(-3deg) scale(1)'}],{duration:850,easing:ease});
    }
    buttons.forEach((b,i)=>{
      b.addEventListener('click',()=>select(i));b.addEventListener('focus',()=>select(i));
      b.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'&&matchMedia('(min-width:768px) and (pointer:fine)').matches)select(i);});
      b.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();buttons[(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length].focus();}});
    });
    const hero=document.querySelector('.bio-hero');let pending=false;
    function position(){pending=false;const range=Math.max(1,hero.offsetHeight-innerHeight),p=reduce()?0:clamp(-hero.getBoundingClientRect().top/range);hero.style.setProperty('--bio-progress',p.toFixed(4));}
    addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(position);}},{passive:true});
    addEventListener('resize',position);
    hero.addEventListener('pointermove',e=>{if(reduce()||e.pointerType==='touch')return;hero.style.setProperty('--bio-tilt',`${((e.clientX/innerWidth)-.5)*5}deg`);},{passive:true});
    hero.addEventListener('pointerleave',()=>hero.style.setProperty('--bio-tilt','0deg'));position();
  }
  window.PORTFOLIO_PAGES={works,about};
})();
