(() => {
  'use strict';
  // Descriptions refer to supplied artwork, not invented processes or outcomes.
  const studies={
    'book-posters':{kind:'posters',hero:2,deck:'四种主题，四种文字与图像的关系。',heading:'让文字，成为画面的一部分。',order:[2,3,0,1],focus:[['文字的形态','竖排、重叠与虚实变化，构成不同的阅读节奏。'],['画面的对照','黑白、蓝色与金色，分别回应四组作品的主题。']]},
    'fuzhou-ip':{kind:'characters',hero:2,deck:'从福州人物与民俗中，寻找角色的辨识度。',heading:'把地域线索，转化为角色语言。',order:[2,0,1,3,4,5,6],focus:[['角色识别','官帽、服饰、胡须与头饰，保留人物和民俗的识别线索。'],['系列延展','圆润比例连接不同角色，帆布袋与冰箱贴展示应用效果示意。']]},
    'nuo':{kind:'information',hero:1,deck:'以傩面具为中心，组织文化知识的阅读层级。',heading:'从一个面具，读到一组文化线索。',order:[1,0,2],focus:[['视觉中心','面具成为信息的入口，环形构图连接不同知识分区。'],['信息组织','地图、图表、图标与线描，为文化内容建立阅读路径。']]},
    'flowers':{kind:'editorial',hero:0,deck:'用花卉、光影与留白，安排书页的呼吸。',heading:'在书页之间，留下观看的节奏。',order:[0,1,2,3,4],focus:[['阅读节奏','封面、开篇与章节页在整页图像、局部观察和文字之间切换。'],['色彩与留白','低饱和自然色将花卉影像与文字连接起来。']]},
    'cafe':{kind:'editorial',hero:0,deck:'从封面到内页，编排烘焙与咖啡的日常。',heading:'感官的吸引力，与阅读的连贯性。',order:[0,1,2,3],focus:[['栏目层级','封面、目录与内页承担不同的信息任务。'],['图文关系','奶油色、焦糖色与黑色，连接摄影、标题与正文。']]},
    'packaging':{kind:'system',hero:0,deck:'用统一纹样，连接不同的产品形态。',heading:'同一种图形语言，不同的展开方式。',order:[0,1],focus:[['系列识别','紫色与装饰纹样形成统一的系列视觉。'],['形态适配','礼盒、软管与瓶罐上的图形延展均为包装效果示意。']]},
    'radio':{kind:'scenes',hero:0,deck:'让猫狗搭档，从电台走进不同的场景。',heading:'角色不变，让场景继续延展。',order:[0,1],focus:[['角色线索','服饰、表情与搭档关系，连接系列中的两组画面。'],['场景延展','从电台到雪地，观察角色特征在不同环境中的表达。']]},
    'city-poster':{kind:'single',hero:0,deck:'以微缩建筑场景，表达福州的新年氛围。',heading:'把城市印象，组织成一张海报。',order:[0],focus:[['城市层次','建筑与街区线索构成微缩立体场景。'],['节日色彩','暖红色连接城市主题与元旦氛围，画面为 AIGC 视觉。']]},
    'coconut':{kind:'information',hero:0,deck:'用流程与图形，讲述椰壳再利用的线索。',heading:'从材料出发，看见再生的路径。',order:[0],focus:[['流程表达','以流程图示组织从废弃物到再生应用的信息。'],['材料色彩','接近椰壳与纸张的自然色调，回应材料主题。']]},
    'forest':{kind:'single',hero:0,deck:'用动物、植物与细节，构成一次户外聚会。',heading:'让角色与场景，一起讲述故事。',order:[0],focus:[['场景关系','植物、动物与角色动作，共同组织画面的叙事。'],['色彩氛围','柔和暖色连接聚会场景中的不同细节。']]},
    'mood':{kind:'interface',hero:0,deck:'围绕心情选择、日历与日记，探索记录界面。',heading:'让情绪，有一个亲切的记录入口。',order:[0],focus:[['界面线索','小熊表情作为情绪表达的媒介。'],['功能呈现','已有画面展示心情选择、日历与日记，属于界面视觉探索。']]},
    'storybook':{kind:'scenes',hero:0,deck:'围绕华文学习与成长，探索连续画面的叙事。',heading:'从一个角色，展开连续的阅读。',order:[0],focus:[['叙事场景','圆润角色与柔和色彩，连接学习和成长主题。'],['内容形式','现有素材为双语绘本页面总览，采用 AIGC 辅助视觉。']]}
  };
  function render({target,work:w,next,query,image,url,esc,size}){
    const s=studies[w.id]||{kind:'single',hero:0,deck:w.category,heading:'关于这件作品',order:w.gallery.map((_,i)=>i),focus:[]};
    const hero=w.gallery[s.hero],heroRatio=size(hero.image)[0]/size(hero.image)[1];
    target.dataset.study=s.kind;target.style.setProperty('--case-tint',w.color);
    function visual(index,{className='',eager=false,decorate=false}={}){
      const item=w.gallery[index],[width]=size(item.image);
      return `<button type="button" class="study-image ${className}" data-gallery="${index}" style="--native-width:${width}px" aria-label="放大查看：${esc(item.caption)}">${image(item.image,item.caption,{eager,crop:true})}${decorate?'<span class="study-zoom" aria-hidden="true">↗</span>':''}</button>`;
    }
    let heroArt=visual(s.hero,{className:'study-cover',eager:true,decorate:true});
    if(s.kind==='posters')heroArt=`<div class="study-poster-stack">${[3,1,2].map((i,n)=>visual(i,{className:'stack-piece stack-piece-'+n,eager:true})).join('')}</div>`;
    if(s.kind==='characters')heroArt=`<div class="study-character-pair">${[0,1].map(i=>visual(i,{className:'study-character',eager:true,decorate:true})).join('')}</div>`;
    const figures=s.order.map((index,order)=>{
      const item=w.gallery[index],[width,height]=size(item.image);
      return `<figure class="study-figure ${order===0?'study-main':''} ${width/height>1.2?'study-wide':''} ${width<700?'study-native':''}">
        ${visual(index,{className:'wave-image',decorate:true})}
        <figcaption><span>${esc(item.caption)}</span><button type="button" data-gallery="${index}" aria-label="放大查看：${esc(item.caption)}">放大查看 ↗</button></figcaption>
      </figure>`;
    }).join('');
    const nextCover=next.id==='book-posters'?'poster-no-image':next.cover;
    target.innerHTML=`<section class="study-hero">
      <a class="study-back inline-link" href="works.html${query?'?'+esc(query):''}#work">← 返回作品集</a>
      <p class="study-category">${esc(w.category)}</p>
      <h1 class="study-title" data-goo>${esc(w.name)}</h1>
      <p class="study-deck">${esc(s.deck)}</p>
      <div class="study-stage" data-format="${heroRatio>1.2?'landscape':'portrait'}">${heroArt}</div>
      <p class="study-note">${esc(w.note)}</p>
    </section>
    <section class="study-overview grid" aria-labelledby="study-context">
      <p class="study-label">创作切入</p><h2 id="study-context" data-goo>${esc(s.heading)}</h2>
      <div class="study-description"><p>${esc(w.intro)}</p><dl>${s.focus.map(([title,text])=>`<div><dt>${esc(title)}</dt><dd>${esc(text)}</dd></div>`).join('')}</dl></div>
    </section>
    <section class="study-gallery-section" aria-labelledby="study-gallery-title">
      <div class="study-gallery-heading"><h2 id="study-gallery-title">${s.order.length>1?'作品展开':'完整画面'}</h2><p>点击画面，可查看细节。</p></div>
      <div class="study-gallery">${figures}</div>
    </section>
    <a class="study-next" href="${url(next)}"><div><span>下一件作品</span><h2>${esc(next.name)}</h2><span class="study-next-arrow" aria-hidden="true">↗</span></div><figure>${image(nextCover,next.name,{thumb:false,crop:true})}</figure></a>
    <nav class="study-bottom-nav" aria-label="作品阅读导航"><a class="inline-link" href="works.html${query?'?'+esc(query):''}#work">← 返回作品集</a><a class="inline-link" href="about.html">认识林予 ↗</a></nav>`;
  }
  window.PORTFOLIO_CASESTUDIES={render};
})();
