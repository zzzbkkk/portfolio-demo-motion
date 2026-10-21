import * as THREE from './vendor/three.module.js';

// Independent planes, not curved tiles: source artworks retain their proportions.
export async function createGlobe(stage, initialWorks, {onHover}={}) {
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  stage.append(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(48,1,.1,30),group=new THREE.Group();
  camera.position.z=5.7;scene.add(group);
  const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2(),cache=new Map();
  const cameraDirection=new THREE.Vector3(),world=new THREE.Vector3(),front=new THREE.Vector3(),inverse=new THREE.Quaternion();
  let meshes=[],frame=0,visible=false,dead=false,auto=!reduce.matches,last=0,drag=null,suppress=false,hovered=null,pinned=null,revision=0;
  let velocity=0,resumeAt=0,activeUntil=0,rotation=.25,tilt=-.08,started=0;
  const preview=document.createElement('div');preview.className='sphere-selection';preview.hidden=true;stage.append(preview);
  function clearSelection(){pinned=null;preview.hidden=true;preview.replaceChildren();stage.removeAttribute('data-selected');resumeAt=performance.now()+1000;schedule();stage.focus({preventScroll:true});}
  const cropMap={'ip-black':[388,303,696,662],'ip-white':[459,81,691,920],'ip-lin':[111,163,850,1167],'ip-yaba':[265,234,506,675],'ip-fufu':[668,444,1065,799]};
  function texture(entry){
    if(cache.has(entry.image))return cache.get(entry.image);
    const promise=(async()=>{
      const img=new Image();img.decoding='async';
      await new Promise((yes,no)=>{img.onload=yes;img.onerror=no;img.src='assets/'+entry.image+'.webp';});
      const crop=cropMap[entry.image]||[0,0,img.naturalWidth,img.naturalHeight],aspect=THREE.MathUtils.clamp(crop[2]/crop[3],.6,1.8);
      const canvas=document.createElement('canvas');canvas.width=512;canvas.height=Math.round(512/aspect);
      const ctx=canvas.getContext('2d');ctx.fillStyle=entry.work.color;ctx.fillRect(0,0,canvas.width,canvas.height);
      const scale=Math.min(canvas.width/crop[2],canvas.height/crop[3]),w=crop[2]*scale,h=crop[3]*scale;
      ctx.drawImage(img,...crop,(canvas.width-w)/2,(canvas.height-h)/2,w,h);
      const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
      map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
      return {map,aspect,canvas};
    })();cache.set(entry.image,promise);return promise;
  }
  async function setWorks(works){
    const request=++revision,entries=[];
    works.forEach(w=>entries.push({work:w,image:w.id==='book-posters'?'poster-no-image':w.cover}));
    works.forEach(w=>w.gallery.slice(0,2).forEach(g=>{if(!entries.some(e=>e.image===g.image))entries.push({work:w,image:g.image});}));
    const chosen=entries.slice(0,32);while(chosen.length&&chosen.length<18)chosen.push({...chosen[chosen.length%entries.length]});
    // Limit decoding concurrency so filtering never locks up the main thread.
    const maps=new Array(chosen.length);let cursor=0;
    await Promise.all(Array.from({length:3},async()=>{while(cursor<chosen.length){const i=cursor++;maps[i]=await texture(chosen[i]);}}));
    if(dead||request!==revision)return;
    meshes.forEach(m=>{group.remove(m);m.geometry.dispose();m.material.dispose();});meshes=[];
    pinned=null;preview.hidden=true;preview.replaceChildren();stage.removeAttribute('data-selected');
    const count=Math.ceil(chosen.length*2.5),points=[];
    for(let i=0;i<count;i++){const y=1-2*(i+.5)/count,rad=Math.sqrt(1-y*y),a=i*Math.PI*(3-Math.sqrt(5));if(Math.abs(y)<.55)points.push(new THREE.Vector3(Math.cos(a)*rad,y,Math.sin(a)*rad));}
    chosen.forEach((entry,i)=>{
      const t=maps[i],normal=points[i%points.length];
      const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.52,.52/t.aspect),new THREE.MeshBasicMaterial({map:t.map,side:THREE.DoubleSide,transparent:true,opacity:0}));
      mesh.position.copy(normal).multiplyScalar(1.85);mesh.lookAt(normal.clone().multiplyScalar(3));
      mesh.userData={...entry,normal,base:mesh.quaternion.clone(),texture:t,index:i};
      group.add(mesh);meshes.push(mesh);
    });
    started=0;stage.querySelector('.globe-loading')?.remove();
    stage.dataset.engine='floating-webgl';stage.dataset.workCount=String(works.length);stage.dataset.tileCount=String(meshes.length);
    hovered=null;schedule();render();
  }
  function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.z=5.7/Math.min(1,camera.aspect);camera.updateProjectionMatrix();render();}
  function render(){if(dead)return;group.rotation.set(tilt,rotation,0);renderer.render(scene,camera);}
  function schedule(){if(!frame&&visible&&!dead&&!document.hidden)frame=requestAnimationFrame(tick);}
  function tick(now){
    frame=0;if(!started)started=now;const dt=last?Math.min(now-last,40):16;last=now;
    if(!drag&&!pinned){rotation+=velocity;velocity*=Math.pow(.94,dt/16.67);if(auto&&!reduce.matches&&!hovered&&now>resumeAt)rotation+=dt*.00018;}
    group.rotation.set(tilt,rotation,0);group.updateMatrixWorld(true);inverse.copy(group.quaternion).invert();
    meshes.forEach(mesh=>{
      const d=mesh.userData,t=reduce.matches?1:Math.max(0,Math.min(1,(now-started-d.index*15)/1400)),ease=1-Math.pow(1-t,4);
      const breathe=reduce.matches?0:Math.sin(now*.00065+d.normal.y*1.5)*.08;
      mesh.position.copy(d.normal).multiplyScalar((1.85+breathe)*ease);
      const target=mesh===hovered&&!pinned?1.24:1;mesh.scale.lerp(new THREE.Vector3(target*ease,target*ease,target*ease),.16);
      mesh.getWorldPosition(world);cameraDirection.copy(camera.position).sub(world).normalize();
      front.copy(d.normal).applyQuaternion(group.quaternion);
      const opacity=(front.dot(cameraDirection)>.18?1:.1)*(pinned?.65:1)*ease;
      mesh.material.opacity+=(opacity-mesh.material.opacity)*.14;
      mesh.quaternion.slerp(mesh===hovered?inverse:d.base,.13);
    });
    renderer.render(scene,camera);stage.dataset.rotation=rotation.toFixed(3);
    if(auto||drag||Math.abs(velocity)>.0001||now-started<2300||now<activeUntil||hovered||pinned)schedule();
  }
  function hit(e){
    const r=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
    raycaster.setFromCamera(mouse,camera);
    return raycaster.intersectObjects(meshes,false).find(h=>h.object.material.opacity>.4)?.object||null;
  }
  function setHover(next){if(next===hovered)return;hovered=next;stage.style.cursor=next?'pointer':'grab';onHover?.(next?.userData.work||null);resumeAt=performance.now()+1000;activeUntil=resumeAt;schedule();}
  function down(e){if(e.button!==0||e.target.closest('.sphere-selection'))return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,rotation,tilt,moved:false};velocity=0;}
  function move(e){
    if(e.target.closest('.sphere-selection')||pinned)return;
    if(drag){
      const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
      if(!drag.moved&&Math.hypot(dx,dy)>7){if(e.pointerType==='touch'&&Math.abs(dy)>Math.abs(dx)*1.2){drag=null;return;}drag.moved=true;stage.setPointerCapture(e.pointerId);}
      if(drag.moved){setHover(null);rotation=drag.rotation+dx*.008;tilt=THREE.MathUtils.clamp(drag.tilt+dy*.004,-.6,.6);velocity=THREE.MathUtils.clamp((e.clientX-drag.lastX)*.008,-.09,.09);drag.lastX=e.clientX;schedule();}
    }else if(e.pointerType!=='touch')setHover(hit(e));
  }
  function up(e){if(!drag)return;suppress=drag.moved;drag=null;resumeAt=performance.now()+1000;if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);schedule();}
  function click(e){
    if(e.target.closest('.sphere-selection'))return;if(suppress){suppress=false;return;}if(pinned){clearSelection();return;}
    const mesh=hit(e);if(!mesh)return;pinned=mesh;velocity=0;const {work,texture:t}=mesh.userData;
    preview.replaceChildren();const close=document.createElement('button');close.className='sphere-close';close.type='button';close.textContent='关闭 ×';close.addEventListener('click',e=>{e.stopPropagation();clearSelection();});
    const figure=document.createElement('div');figure.className='sphere-preview';figure.style.background=work.color;
    const img=new Image();img.src=t.canvas.toDataURL('image/webp');img.alt=work.name;figure.append(img);
    const meta=document.createElement('div');meta.className='sphere-selection-meta';
    const name=document.createElement('p');name.textContent=work.name;
    const link=document.createElement('a');link.href='project.html?work='+encodeURIComponent(work.id);link.textContent='查看作品 ↗';meta.append(name,link);
    preview.append(close,figure,meta);preview.hidden=false;stage.dataset.selected=work.id;close.focus({preventScroll:true});
    if(!reduce.matches)preview.animate([{opacity:0,transform:'translate(-50%,-45%) scale(.82)',filter:'blur(10px)'},{opacity:1,transform:'translate(-50%,-50%) scale(1)',filter:'blur(0)'}],{duration:800,easing:'cubic-bezier(.25,1,.5,1)'});
    schedule();
  }
  function keys(e){if(e.key==='Escape'&&pinned){clearSelection();return;}if(e.target!==stage)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();rotation+=e.key==='ArrowLeft'?-.4:.4;}else if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();tilt=THREE.MathUtils.clamp(tilt+(e.key==='ArrowUp'?-.15:.15),-.6,.6);}else return;render();schedule();}
  stage.tabIndex=0;stage.setAttribute('role','group');stage.setAttribute('aria-label','悬浮作品空间，可拖动旋转，点击图片展开预览。也可使用方向键或下方目录。');
  stage.addEventListener('pointerdown',down);stage.addEventListener('pointermove',move);stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);stage.addEventListener('click',click);stage.addEventListener('keydown',keys);stage.addEventListener('pointerleave',()=>setHover(null));
  const observer=new IntersectionObserver(e=>{visible=e[0].isIntersecting;last=0;if(visible)schedule();else{cancelAnimationFrame(frame);frame=0;}},{threshold:.05});observer.observe(stage);
  const resizer=new ResizeObserver(resize);resizer.observe(stage);
  function visibility(){last=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();}
  document.addEventListener('visibilitychange',visibility);
  reduce.addEventListener('change',()=>{auto=!reduce.matches;schedule();});
  resize();await setWorks(initialWorks);
  return {setWorks,toggle(){auto=!auto&&!reduce.matches;schedule();return auto;},turn(direction){rotation+=direction*.45;resumeAt=performance.now()+1000;render();schedule();},
    dispose(){dead=true;cancelAnimationFrame(frame);observer.disconnect();resizer.disconnect();document.removeEventListener('visibilitychange',visibility);meshes.forEach(m=>{m.geometry.dispose();m.material.dispose();});cache.forEach(p=>p.then(t=>t.map.dispose()));renderer.dispose();renderer.domElement.remove();preview.remove();}
  };
}
