'use strict';
(() => {
const status=document.getElementById('status');
try {
const stage=document.getElementById('stage');
const renderer=new THREE.WebGLRenderer({canvas:document.getElementById('view'),antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=.95;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color('#eae6df');
const camera=new THREE.PerspectiveCamera(32,1,.05,30);
const controls=new THREE.OrbitControls(camera,renderer.domElement);
controls.target.set(0,.98,0);controls.enableDamping=true;
controls.minDistance=1.0;controls.maxDistance=7;controls.maxPolarAngle=Math.PI*.52;
controls.autoRotate=false;controls.autoRotateSpeed=.8;
scene.add(new THREE.HemisphereLight(0xfff8ee,0x81756b,.6));
for(const [x,y,z,color,power] of [[-3,5,4,0xfff1df,1.4],[3,3,2,0xffffff,.4],[1,5,-3,0xffffff,.7]]) {
 const l=new THREE.DirectionalLight(color,power);l.position.set(x,y,z);
 if(x===-3){l.castShadow=true;l.shadow.mapSize.set(1024,1024);l.shadow.camera.left=-2;l.shadow.camera.right=2;l.shadow.camera.top=3;l.shadow.camera.bottom=-2;l.shadow.bias=-.0003;l.shadow.normalBias=.015;}
 scene.add(l);
}
const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0xe2dcd3,roughness:1}));
floor.rotation.x=-Math.PI/2;floor.position.y=-.002;floor.receiveShadow=true;scene.add(floor);
let avatar,mixer,current,actions={},paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(paused){const button=document.getElementById('pause');button.setAttribute('aria-pressed','true');button.textContent='Sambung animasi';}
function angle(name){
 const positions={front:[0,1.05,4.1],side:[4.1,1.05,0],back:[0,1.05,-4.1],quarter:[2.2,1.3,3.7]};
 camera.position.set(...positions[name]);controls.target.set(0,.96,0);controls.update();
}
angle('quarter');
function animate(){
 if(!avatar)return;
 const name=document.getElementById('animation').value;
 if(current)current.stop();
 current=actions[name].reset().play();
 mixer.setTime(0);
 avatar.traverse(o=>{if(o.name.startsWith('Footwear'))o.visible=!['Takbir','Rukuk','Duduk','Sujud'].includes(name)});
 document.body.dataset.pose=name;
}
new THREE.GLTFLoader().load('avatar-reference.glb',g=>{
 avatar=g.scene;mixer=new THREE.AnimationMixer(avatar);
 for(const clip of g.animations)actions[clip.name]=mixer.clipAction(clip);
 avatar.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false;}});
 scene.add(avatar);animate();
 let triangles=0,meshes=0,bones=0;
 avatar.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;}if(o.isBone)bones++;});
 window.__avatarProof={scene,avatar,mixer,actions,renderer,camera,controls,angle,getState:()=>({pose:document.body.dataset.pose,paused,triangles,meshes,bones,clips:Object.keys(actions),revision:THREE.REVISION})};
 status.textContent=`Model dimuatkan · ${triangles.toLocaleString('ms-MY')} segi tiga · ${Object.keys(actions).length} gerakan percubaan`;
 document.body.dataset.ready='true';
},undefined,e=>{status.textContent='Model gagal dimuatkan. Cuba muat semula.';document.body.dataset.ready='error';console.error(e)});
for(const button of document.querySelectorAll('[data-angle]'))button.addEventListener('click',()=>angle(button.dataset.angle));
document.getElementById('animation').addEventListener('change',animate);
document.getElementById('spin').addEventListener('click',e=>{controls.autoRotate=!controls.autoRotate;e.currentTarget.setAttribute('aria-pressed',String(controls.autoRotate));e.currentTarget.textContent='Putaran: '+(controls.autoRotate?'hidup':'mati')});
document.getElementById('pause').addEventListener('click',e=>{paused=!paused;e.currentTarget.setAttribute('aria-pressed',String(paused));e.currentTarget.textContent=paused?'Sambung animasi':'Jeda animasi'});
function resize(){renderer.setSize(stage.clientWidth,stage.clientHeight,false);camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();}
addEventListener('resize',resize);resize();
const clock=new THREE.Clock();
function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.05);if(mixer&&!paused)mixer.update(dt);controls.update();renderer.render(scene,camera);}
frame();
}catch(e){status.textContent='WebGL tidak tersedia pada pelayar ini.';document.body.dataset.ready='error';console.error(e);}
})();
