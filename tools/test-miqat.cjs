// Behavioural tests run compiled game code with a DOM and Three.js r128.
// npm install && npx -p typescript@5.9.3 tsc -p tsconfig.json && node build.mjs
// node tools/test-miqat.cjs
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const THREE = require('three');
const dom = new JSDOM(fs.readFileSync('index.html','utf8'), { url:'https://example.test/', runScripts:'outside-only', pretendToBeVisual:true });
const w = dom.window;
const noop = () => {};
const ctx = new Proxy({ measureText: () => ({width:40}), createLinearGradient:()=>({addColorStop:noop}), createRadialGradient:()=>({addColorStop:noop}), getImageData:()=>({data:new Uint8ClampedArray(16)}), createImageData:()=>({data:new Uint8ClampedArray(16)}) }, { get:(o,k)=>k in o?o[k]:noop, set:(o,k,v)=>(o[k]=v,true) });
w.HTMLCanvasElement.prototype.getContext = () => ctx;
w.HTMLMediaElement.prototype.play = () => Promise.resolve();
w.HTMLMediaElement.prototype.pause = noop;
w.matchMedia = () => ({matches:false,addEventListener:noop,removeEventListener:noop});
w.requestAnimationFrame = () => 1;
w.ResizeObserver = class { observe(){} disconnect(){} };
w.THREE = THREE;
let code = fs.readFileSync('dist/main.js','utf8');
code = code.replace(/\}\)\(\);\s*$/, `window.testApi={
  setup(gender='L'){S=newSave('Test',gender);S.step=1;started=true;modalOpen=false;overlayBusy=false;loadScene('miqat');applyOutfit();},
  get S(){return S},get activity(){return miqatActivity},get room(){return insideMiqat},
  get scene(){return scene},get target(){return stepTarget()},get pose(){return miqatPrayerPose()},
  P,R3,C3,enterMiqatInterior,leaveMiqatInterior,startMiqatActivity,updateMiqatActivity,
  resetMiqatActivity,miqatPrivate,applyMiqatPose3D,makeRig,updateRig,loadScene,PRAYER_SEQUENCE,
  finishMiqatActivity,validate:validSave,setStep(id){S.step=ALL_STEPS.findIndex(x=>x.step.id===id)},
  current:()=>curStep()?.id,ensureWorld,updatePlayer
  ,rig(model){gltfCache.set('models/jemaah-v1.glb',Promise.resolve(null));R3.rig=makeRig();R3.rig.avatar=model;R3.rig.root.add(model);return R3.rig;}
};})();`);
w.eval(code);
const a = w.testApi;
function complete(kind) { a.startMiqatActivity(kind); assert.equal(a.activity?.kind,kind); a.updateMiqatActivity(30); }
a.setup(); a.enterMiqatInterior('wash');
assert.equal(a.room,'wash');
assert.equal(a.scene.name,'Bilik mandi & persalinan');
assert.ok(a.scene.solids.length>5);
a.startMiqatActivity('dress'); assert.equal(a.activity,null,'Cannot dress before preparation');
a.startMiqatActivity('bath'); assert.equal(a.miqatPrivate(),true);
a.updateMiqatActivity(2); a.resetMiqatActivity();
assert.equal(a.S.flags.miqat_bath,undefined,'Cancelled bath must not complete');
complete('nails'); complete('bath'); complete('dress');
assert.equal(a.S.outfit,'ihram'); assert.equal(a.current(),'solat_ihram');
complete('wudu'); assert.equal(a.S.flags.miqat_wudu,true);
complete('toilet'); assert.equal(a.S.flags.miqat_wudu,false);
complete('wudu'); a.leaveMiqatInterior(); assert.equal(a.room,null);
assert.equal(a.validate(JSON.parse(JSON.stringify(a.S))),true,'Save remains valid');
a.enterMiqatInterior('mosque');
a.startMiqatActivity('prayer');
assert.equal(a.activity.kind,'prayer');
assert.equal(a.PRAYER_SEQUENCE.filter(x=>x.pose==='sujud').length,4);
for(let i=0;i<a.PRAYER_SEQUENCE.length;i++) {
  a.updateMiqatActivity(1.3);
  assert.equal(a.pose,a.PRAYER_SEQUENCE[i].pose);
  w.document.getElementById('miqatNext').click();
}
assert.equal(a.activity,null); assert.equal(a.current(),'niat_umrah');
a.leaveMiqatInterior(); assert.equal(a.room,null);
// Old saves that already reached prayer can use the indoor wudu point.
a.setup('P'); a.setStep('solat_ihram'); a.enterMiqatInterior('mosque');
a.startMiqatActivity('prayer'); assert.equal(a.activity,null);
complete('wudu'); a.startMiqatActivity('prayer'); assert.ok(a.activity);
a.loadScene('makkah'); assert.equal(a.activity,null); assert.equal(a.room,null);
// Every station target remains inside the walkable floor and outside solids.
for(const room of ['wash','mosque']) {
  a.setup(); a.enterMiqatInterior(room);
  for(const p of a.scene.interacts) for(const s of a.scene.solids) {
    if(s.t==='r') assert.ok(!(p.x>s.x && p.x<s.x+s.w && p.y>s.y && p.y<s.y+s.h),p.id+' inside wall');
  }
}
// Parse the actual exported GLB with the SAME GLTFLoader version as production.
w.TextDecoder = TextDecoder; w.TextEncoder = TextEncoder;
w.eval(fs.readFileSync('node_modules/three/examples/js/loaders/GLTFLoader.js','utf8'));
const data = fs.readFileSync('models/jemaah-v1.glb');
new THREE.GLTFLoader().parse(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'',gl=>{
  for(const name of ['UpperBody','ArmL','ArmR','LegL','LegR','Hair','HeadPivot']) assert.ok(gl.scene.getObjectByName(name),name);
  const box=new THREE.Box3().setFromObject(gl.scene); const size=box.getSize(new THREE.Vector3());
  assert.ok(size.y>1.8 && size.y<2.1,'Avatar must be human scale');
  assert.ok(Math.abs(box.min.y)<.03,'Feet must meet floor');
  let triangles=0,drawCalls=0;
  gl.scene.traverse(o=>{if(o.isMesh){triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;drawCalls++;}});
  assert.ok(triangles<25000); assert.ok(data.length<1024*1024);
  a.setup(); a.P.ihram=true;
  const rig=a.rig(gl.scene); a.updateRig(.016);
  assert.equal(rig.avatar.visible,true); assert.equal(rig.fallback.visible,false);
  a.P.gender='P'; a.updateRig(.016); assert.equal(rig.avatar.visible,false); assert.equal(rig.fallback.visible,true);
  a.P.gender='L'; a.P.shaved=true; a.updateRig(.016); assert.equal(rig.avatar.getObjectByName('Hair').visible,false);
  a.C3.mode='eye'; a.updateRig(.016); assert.equal(rig.root.visible,false);
  a.C3.mode='back'; a.P.ihram=false; a.updateRig(.016); assert.equal(rig.fallback.visible,true);
  a.P.ihram=true; a.setStep('solat_ihram'); a.S.flags.miqat_wudu=true; a.enterMiqatInterior('mosque');
  a.startMiqatActivity('prayer');
  for(let i=0;i<a.PRAYER_SEQUENCE.length;i++) { a.updateMiqatActivity(1.3); a.updateRig(.016); rig.root.updateMatrixWorld(true); assert.ok(Number.isFinite(new THREE.Box3().setFromObject(rig.root).max.y)); w.document.getElementById('miqatNext').click(); }
  console.log(JSON.stringify({result:'PASS',tests:'preparation, cancellation, wudu invalidation, two rakaat, female/old saves, room exits, collisions, GLB r128 compatibility',triangles,drawCalls,bytes:data.length,height:size.y}));
  dom.window.close();
},err=>{console.error(err);process.exitCode=1;dom.window.close();});
