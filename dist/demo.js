
(() => {
  const english=document.documentElement.lang==='en';
  const body=document.body;
  body.dataset.demonstration='true';
  if(document.querySelector('.demo-imprint'))return;
  const note=document.createElement('aside');
  note.className='demo-imprint';
  note.setAttribute('aria-label',english?'Demonstration notice':'演示说明');
  const text=document.createElement('p');
  text.textContent=body.dataset.demoType==='product'
    ? (english?'Website design demonstration. Identity, background and document links are illustrative.':'网站制作演示。身份、经历与资料入口已示例化，不对应真实求职者。')
    :'网站设计与开发案例。身份资料已脱敏，作品素材由原作者提供；人像为 AI 生成示例。';
  const link=document.createElement('a');
  const base=document.querySelector('meta[name="demo-root"]')?.content||'';
  link.href=base+'demo.html';
  link.textContent=english?'About this demo ↗':'演示说明 ↗';
  note.append(text,link);
  (document.querySelector('#site')||body).append(note);
})();
