// Local GPU reveal: density and momentum travel together through a noisy flow.
// Artwork and client content stay separate from the simulation. No remote runtime.
export async function initFluidArtwork(section, works) {
  const canvas = section.querySelector('.intro-canvas');
  const allowed = matchMedia('(min-width:992px) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
  const gl = canvas.getContext('webgl2', {alpha:true, premultipliedAlpha:false, antialias:false});
  if (!gl || !gl.getExtension('EXT_color_buffer_float')) {
    canvas.dataset.flow = 'unavailable';
    return; // Decorative only: the page, navigation and portfolio remain readable.
  }
  const linear = !!gl.getExtension('OES_texture_float_linear');
  const names = ['poster-no-image', 'poster-seventh', 'poster-birds', works.find(w => w.id === 'nuo')?.cover].filter(Boolean);
  const loaded = await Promise.all(names.map(name => new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = 'assets/' + name + '.webp';
  })));
  const images = loaded.filter(Boolean);
  if (!images.length) return;

  const vertex = `#version 300 es
    layout(location=0) in vec2 position;
    out vec2 uv;
    void main(){ uv=position*.5+.5; gl_Position=vec4(position,0.,1.); }`;
  const noise = `
    float hash21(vec2 p){
      p=fract(p*vec2(127.1,311.7));
      p+=dot(p,p+19.19);
      return fract(p.x*p.y);
    }
    float noise2(vec2 p){
      vec2 i=floor(p), f=fract(p);
      f=f*f*(3.-2.*f);
      return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),
                 mix(hash21(i+vec2(0,1)),hash21(i+vec2(1,1)),f.x),f.y);
    }
    float flowNoise(vec2 p){
      return .56*noise2(p)+.29*noise2(p*2.53+7.3)+.15*noise2(p*6.17-3.8);
    }`;
  const header = '#version 300 es\nprecision highp float;\nin vec2 uv;\nout vec4 color;\n';
  const shaders = [];
  function shader(type, source) {
    const item = gl.createShader(type);
    gl.shaderSource(item, source); gl.compileShader(item);
    if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(item));
    shaders.push(item); return item;
  }
  const vs = shader(gl.VERTEX_SHADER, vertex);
  const programs = [];
  function program(source) {
    const handle = gl.createProgram();
    gl.attachShader(handle, vs); gl.attachShader(handle, shader(gl.FRAGMENT_SHADER, header + source));
    gl.linkProgram(handle);
    if (!gl.getProgramParameter(handle, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(handle));
    const uniforms = {};
    for (let i=0; i<gl.getProgramParameter(handle,gl.ACTIVE_UNIFORMS); i++) {
      const name=gl.getActiveUniform(handle,i).name;
      uniforms[name.replace('[0]','')] = gl.getUniformLocation(handle,name);
    }
    const item={handle,uniforms}; programs.push(item); return item;
  }
  const splat = program(`
    uniform sampler2D field;
    uniform vec2 point, impulse;
    uniform float aspect, strength, radius;
    void main(){
      vec2 delta=(uv-point)*vec2(aspect,1.);
      float weight=exp(-dot(delta,delta)/radius);
      vec3 state=texture(field,uv).rgb;
      float influence=clamp(weight*strength,0.,1.);
      // Replace, rather than keep adding, momentum near the cursor: turns stay fluid.
      state.gb=mix(state.gb,impulse,influence*.86);
      state.r=min(12.,state.r+weight*strength);
      color=vec4(state,1.);
    }`);
  const evolve = program(noise + `
    uniform sampler2D field;
    uniform vec2 texel;
    uniform float dt, elapsed, time;
    void main(){
      vec3 here=texture(field,uv).rgb;
      vec2 back=clamp(uv-here.gb*dt,texel,1.-texel);
      vec3 carried=texture(field,back).rgb;
      // Multi-scale domain warp moves the boundary too, not only the reveal centre.
      vec2 warp=(vec2(flowNoise(uv*11.+time*.27),
                      flowNoise(uv*11.+31.7-time*.23))-.5)*5.2*texel;
      vec3 left=texture(field,back+warp-vec2(texel.x,0)).rgb;
      vec3 right=texture(field,back+warp+vec2(texel.x,0)).rgb;
      vec3 down=texture(field,back+warp-vec2(0,texel.y)).rgb;
      vec3 up=texture(field,back+warp+vec2(0,texel.y)).rgb;
      vec3 average=(left+right+down+up)*.25;
      float density=mix(carried.r,average.r,.79);
      vec2 velocity=mix(carried.gb,average.gb,.395);
      float grain=flowNoise(uv*15.+5.1+time*.17);
      density*=exp(-1.5*(1.+.7*(grain-.5)*2.)*elapsed);
      velocity*=exp(-3.*elapsed);
      color=vec4(max(0.,density),velocity,1.);
    }`);
  const render = program(noise + `
    uniform sampler2D field, art0, art1, art2, art3;
    uniform vec4 cards[4], styles[4];
    uniform vec2 view;
    uniform vec3 background;
    uniform float time;
    vec3 layer(sampler2D art,vec4 rect,vec4 style,vec3 below){
      vec2 delta=(uv-rect.xy)*view;
      float c=cos(style.x),s=sin(style.x);
      vec2 p=mat2(c,-s,s,c)*delta/(rect.zw*view)+.5;
      if(any(lessThan(p,vec2(0)))||any(greaterThan(p,vec2(1)))) return below;
      float frameAspect=rect.z*view.x/(rect.w*view.y);
      if(style.w>frameAspect) p.x=(p.x-.5)*frameAspect/style.w+.5;
      else p.y=(p.y-.5)*style.w/frameAspect+.5;
      vec2 blur=vec2(style.z,style.z*style.w);
      vec3 ink=texture(art,p).rgb*.5;
      ink+=(texture(art,p+vec2(blur.x,0)).rgb+texture(art,p-vec2(blur.x,0)).rgb+
            texture(art,p+vec2(0,blur.y)).rgb+texture(art,p-vec2(0,blur.y)).rgb)*.125;
      return ink*style.y;
    }
    void main(){
      float density=texture(field,uv).r;
      float fade=.18*(.35+1.3*flowNoise(vec2(uv.x*9.,time*.25)));
      density*=smoothstep(0.,fade,uv.y);
      // Narrow, anti-aliased liquid edge. No blurred circular cursor overlay.
      float aa=max(.012,fwidth(density)*.75);
      float reveal=smoothstep(.395-aa,.395+aa,density);
      if(reveal<.001){ color=vec4(0); return; }
      vec3 ink=background;
      ink=layer(art0,cards[0],styles[0],ink);
      ink=layer(art1,cards[1],styles[1],ink);
      ink=layer(art2,cards[2],styles[2],ink);
      ink=layer(art3,cards[3],styles[3],ink);
      color=vec4(ink,reveal);
    }`);
  const vao=gl.createVertexArray(), buffer=gl.createBuffer();
  gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  gl.disable(gl.BLEND); gl.disable(gl.DEPTH_TEST);

  const artwork=images.map(img => {
    const texture=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
    return {texture,aspect:img.naturalWidth/img.naturalHeight};
  });
  let width=0,height=0,fieldWidth=0,fieldHeight=0,read,write;
  let frame=0,lastFrame=0,lastInput=0,visible=true,disposed=false,contextAvailable=true,head=null,target=null,seed=false,frames=0;
  const background=new Float32Array(3),rects=new Float32Array(16),styles=new Float32Array(16);
  const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  function bind(texture,unit){
    gl.activeTexture(gl.TEXTURE0+unit); gl.bindTexture(gl.TEXTURE_2D,texture);
    return unit;
  }
  function destination(item){
    gl.bindFramebuffer(gl.FRAMEBUFFER,item?.framebuffer||null);
    gl.viewport(0,0,item?fieldWidth:canvas.width,item?fieldHeight:canvas.height);
  }
  function run(pass,dest){
    gl.useProgram(pass.handle);
    gl.uniform1i(pass.uniforms.field,bind(read.texture,0));
    destination(dest);
  }
  function flip(){[read,write]=[write,read];}
  function draw(){gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
  function removeField(item){
    if(item){gl.deleteTexture(item.texture);gl.deleteFramebuffer(item.framebuffer);}
  }
  function createField(){
    const texture=gl.createTexture(),framebuffer=gl.createFramebuffer();
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,linear?gl.LINEAR:gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,linear?gl.LINEAR:gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA16F,fieldWidth,fieldHeight,0,gl.RGBA,gl.HALF_FLOAT,null);
    gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE) throw new Error('Fluid framebuffer unavailable');
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    return {texture,framebuffer};
  }
  function colorFromTheme(){
    const value=getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim();
    const hex=value.replace('#','');
    for(let i=0;i<3;i++)background[i]=parseInt(hex.slice(i*2,i*2+2),16)/255||0;
  }
  function clear(){
    if(!read)return;
    for(const item of [read,write,null]){
      destination(item);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    }
  }
  function resize(){
    const nextWidth=section.clientWidth,nextHeight=innerHeight;
    if(nextWidth===width&&nextHeight===height)return;
    width=nextWidth;height=nextHeight;
    const dpr=Math.min(devicePixelRatio,1.5);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    canvas.style.height=height+'px';
    fieldWidth=Math.min(960,Math.max(512,Math.round(width*.6)));
    fieldHeight=Math.max(128,Math.round(fieldWidth*height/width));
    removeField(read);removeField(write);
    read=createField();write=createField();
    head=target=null;seed=false;
    clear();canvas.dataset.state='idle';
  }
  function inject(x,y,vx,vy,strength){
    run(splat,write);
    const u=splat.uniforms;
    gl.uniform2f(u.point,x,y);gl.uniform2f(u.impulse,vx,vy);
    gl.uniform1f(u.aspect,width/height);
    gl.uniform1f(u.strength,strength);gl.uniform1f(u.radius,.004);
    draw();flip();
  }
  function advance(dt,time,elapsed){
    // Input is sampled once per frame. Event frequency cannot make a thick, rigid stamp.
    if(target&&time-lastInput<220){
      const before=head||target;
      const follow=1-Math.exp(-32*dt);
      const next={x:before.x+(target.x-before.x)*follow,y:before.y+(target.y-before.y)*follow};
      const dx=next.x-before.x,dy=next.y-before.y;
      const travel=Math.hypot(dx*width/height,dy);
      if(seed||travel>.00015){
        const count=Math.min(16,Math.max(1,Math.ceil(travel/.022)));
        const strength=seed?1.6:3.5*clamp(travel/.009,.65,1);
        const vx=clamp(dx/dt*1.6,-6.4,6.4),vy=clamp(dy/dt*1.6,-6.4,6.4);
        for(let i=1;i<=count;i++)inject(before.x+dx*i/count,before.y+dy*i/count,vx,vy,strength);
        seed=false;
      }
      head=next;
    }
    run(evolve,write);
    gl.uniform2f(evolve.uniforms.texel,1/fieldWidth,1/fieldHeight);
    gl.uniform1f(evolve.uniforms.dt,dt);gl.uniform1f(evolve.uniforms.elapsed,elapsed);
    gl.uniform1f(evolve.uniforms.time,time*.001);
    draw();flip();
  }
  function paint(time){
    const phase=time/24000*Math.PI*2,cardWidth=Math.min(460,Math.max(240,width*.3));
    const orbit=artwork.map((art,i)=>{
      const a=phase+i/artwork.length*Math.PI*2,depth=(Math.sin(a)+1)/2;
      return {art,a,depth};
    }).sort((a,b)=>a.depth-b.depth);
    for(let i=0;i<4;i++){
      const {art,a,depth}=orbit[i%orbit.length],size=cardWidth*(.38+depth*.62);
      rects.set([.5+Math.cos(a)*.24,.5-Math.sin(a)*.17,size/width,size*1.3/height],i*4);
      styles.set([Math.sin(a*.7)*.07,.55+depth*.45,(1-depth)*.009,art.aspect],i*4);
    }
    run(render,null);
    const u=render.uniforms;
    gl.uniform4fv(u.cards,rects);gl.uniform4fv(u.styles,styles);
    gl.uniform2f(u.view,width,height);gl.uniform3fv(u.background,background);
    gl.uniform1f(u.time,time*.001);
    orbit.forEach(({art},i)=>gl.uniform1i(u['art'+i],bind(art.texture,i+1)));
    // If one image fails, repeat a valid local asset rather than leave an incomplete sampler.
    for(let i=orbit.length;i<4;i++)gl.uniform1i(u['art'+i],bind(orbit[i%orbit.length].art.texture,i+1));
    draw();
  }
  function schedule(){
    if(!frame&&!disposed&&contextAvailable&&visible&&!document.hidden&&allowed.matches)frame=requestAnimationFrame(tick);
  }
  function tick(time){
    frame=0;
    const elapsed=Math.max(1/240,(time-lastFrame)/1000),dt=Math.min(elapsed,1/30);lastFrame=time;
    advance(dt,time,elapsed);paint(time);
    canvas.dataset.state=time-lastInput<220?'active':'settling';
    if(++frames%30===0)canvas.dataset.frames=String(frames);
    // At this point the bounded density has decayed below the visible threshold.
    // Do not clear at an arbitrary early timeout while an edge is still on screen.
    if(time-lastInput<9000)schedule();
    else {clear();head=target=null;canvas.dataset.state='idle';}
  }
  function pointer(event){
    if(event.pointerType==='touch'||document.hidden||!visible||!allowed.matches)return;
    const bounds=canvas.getBoundingClientRect();
    if(event.clientY<bounds.top||event.clientY>bounds.bottom){head=target=null;return;}
    const now=performance.now();
    const next={x:clamp((event.clientX-bounds.left)/width,0,1),y:clamp(1-(event.clientY-bounds.top)/height,0,1)};
    if(!head||now-lastInput>220){head=next;seed=true;}
    target=next;lastInput=now;
    if(!frame)lastFrame=now-16.67;
    schedule();
  }
  function leave(){head=target=null;seed=false;}
  function suspend(){
    cancelAnimationFrame(frame);frame=0;leave();clear();canvas.dataset.state='idle';
  }
  function visibility(){if(document.hidden)suspend();}
  function mediaChange(){suspend();resize();}
  function contextLost(event){
    event.preventDefault();contextAvailable=false;cancelAnimationFrame(frame);frame=0;canvas.dataset.flow='context-lost';
  }
  function contextRestored(){destroy();initFluidArtwork(section,works).catch(()=>{canvas.dataset.flow='unavailable';});}
  function destroy(){
    if(disposed)return;disposed=true;suspend();
    sizing.disconnect();intersection.disconnect();theme.disconnect();
    section.removeEventListener('pointermove',pointer);section.removeEventListener('pointerleave',leave);
    document.removeEventListener('visibilitychange',visibility);
    allowed.removeEventListener('change',mediaChange);
    window.removeEventListener('resize',resize);
    canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',contextRestored);
    removeField(read);removeField(write);
    artwork.forEach(art=>gl.deleteTexture(art.texture));
    programs.forEach(item=>gl.deleteProgram(item.handle));shaders.forEach(item=>gl.deleteShader(item));
    gl.deleteVertexArray(vao);gl.deleteBuffer(buffer);
  }
  resize();colorFromTheme();
  canvas.dataset.flow='webgl2';canvas.dataset.state='idle';
  section.addEventListener('pointermove',pointer,{passive:true});
  section.addEventListener('pointerleave',leave);
  document.addEventListener('visibilitychange',visibility);
  allowed.addEventListener('change',mediaChange);
  window.addEventListener('resize',resize,{passive:true});
  canvas.addEventListener('webglcontextlost',contextLost);
  canvas.addEventListener('webglcontextrestored',contextRestored);
  const sizing=new ResizeObserver(resize);sizing.observe(section);
  const intersection=new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    if(!visible)suspend();
  });intersection.observe(canvas);
  const theme=new MutationObserver(colorFromTheme);
  theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  window.addEventListener('pagehide',event=>event.persisted?suspend():destroy());
  return destroy;
}
