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
  resetMiqatActivity,miqatPrivate,makeRig,updateRig,loadScene,PRAYER_SEQUENCE,
  finishMiqatActivity,validate:validSave,setStep(id){S.step=ALL_STEPS.findIndex(x=>x.step.id===id)},
  current:()=>curStep()?.id,ensureWorld,updatePlayer
  ,attachPilgrim,pilgrimClip,pilgrimCache,pilgrimId

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
async function checkCharacters() {
  const report=[];
  for(const [id,gender,ihram] of [['lelaki-ihram','L',true],['perempuan-telekung','P',true],['lelaki-biasa','L',false],['perempuan-biasa','P',false]]) {
    const data=fs.readFileSync('models/'+id+'.glb');
    const gl=await new Promise((resolve,reject)=>new THREE.GLTFLoader().parse(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'',resolve,reject));
    const expected=['Idle','Walk','Takbir','Bersedekap','Rukuk','Duduk','Sujud','Salam','Groom','Throw','Sleep'];
    assert.equal(gl.animations.map(x=>x.name).sort().join(','),expected.sort().join(','));
    const mixer=new THREE.AnimationMixer(gl.scene),actions={};
    for(const clip of gl.animations) actions[clip.name]=mixer.clipAction(clip);
    let triangles=0,skins=0;
    gl.scene.traverse(o=>{if(o.isSkinnedMesh){skins++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;assert.equal(o.skeleton.bones.length,18);}});
    assert.ok(skins>0);assert.ok(triangles<35000);assert.ok(data.length<1.5*1024*1024);
    function bounds(){
      gl.scene.updateMatrixWorld(true);
      const box=new THREE.Box3();
      gl.scene.traverse(o=>{if(o.isSkinnedMesh){o.skeleton.update();for(let i=0;i<o.geometry.attributes.position.count;i++){
        const v=new THREE.Vector3().fromBufferAttribute(o.geometry.attributes.position,i);o.boneTransform(i,v);v.applyMatrix4(o.matrixWorld);box.expandByPoint(v);
      }}});return box;
    }
    actions.Idle.play();mixer.update(.25);
    const standing=bounds();assert.ok(standing.max.y>1.7&&standing.max.y<1.95);assert.ok(Math.abs(standing.min.y)<.05);
    mixer.stopAllAction();actions.Walk.reset().play();mixer.update(.15);
    const shin=gl.scene.getObjectByName('ShinL');const first=shin.getWorldPosition(new THREE.Vector3());mixer.update(.5);bounds();
    assert.ok(first.distanceTo(shin.getWorldPosition(new THREE.Vector3()))>.05,'Walking must move the knee');
    for(const name of ['Rukuk','Duduk','Sujud']){
      mixer.stopAllAction();actions[name].reset().play();mixer.update(.1);
      const box=bounds();assert.ok(box.max.y<1.3,name+' must lower body');assert.ok(box.min.y>-.12,name+' floor penetration');
      if(name==='Sujud') {
        const head=gl.scene.getObjectByName('Head').getWorldPosition(new THREE.Vector3());
        assert.ok(head.y<.3,'Head must reach ground for sujud');
        for(const side of ['L','R'])assert.ok(gl.scene.getObjectByName('Hand'+side).getWorldPosition(new THREE.Vector3()).y<.15,'Hands near floor');
      }
    }
    mixer.stopAllAction();
    a.setup(gender);a.P.gender=gender;a.P.ihram=ihram;
    const character={id,scene:gl.scene,mixer,actions,current:'',appearance:''};
    a.pilgrimCache.set(id,Promise.resolve(character));
    const rig=a.makeRig();a.R3.rig=rig;rig.characterRequest=id;a.attachPilgrim(rig,character);a.updateRig(.1);
    assert.equal(rig.avatar.visible,true);assert.equal(rig.fallback.visible,false);
    a.P.moving=true;a.updateRig(.1);assert.equal(character.current,'Walk');
    a.P.moving=false;a.updateRig(.1);assert.equal(character.current,'Idle');
    a.P.shaved=true;a.updateRig(.1);gl.scene.traverse(o=>{if(o.name.startsWith('Hair_'))assert.equal(o.visible,false)});
    a.C3.mode='eye';a.updateRig(.1);assert.equal(rig.root.visible,false);a.C3.mode='back';
    a.setStep('solat_ihram');a.S.flags.miqat_wudu=true;a.enterMiqatInterior('mosque');a.startMiqatActivity('prayer');
    for(let i=0;i<a.PRAYER_SEQUENCE.length;i++){
      a.updateMiqatActivity(1.3);a.updateRig(.1);
      assert.equal(character.current,a.pilgrimClip());
      gl.scene.traverse(o=>{if(o.name.startsWith('Footwear_'))assert.equal(o.visible,false)});
      assert.ok(Number.isFinite(bounds().max.y));w.document.getElementById('miqatNext').click();
    }
    a.leaveMiqatInterior();a.updateRig(.1);
    gl.scene.traverse(o=>{if(o.name.startsWith('Footwear_'))assert.equal(o.visible,true)});
    // Pending/failed new variant must show the playable fallback, never wrong clothing.
    a.P.ihram=!ihram;rig.characterRequest=a.pilgrimId();a.updateRig(.1);
    assert.equal(rig.fallback.visible,true);assert.equal(rig.avatar.visible,false);
    report.push({id,triangles,skins,bytes:data.length,clips:gl.animations.length});
  }
  console.log(JSON.stringify({result:'PASS',tests:'Miqat workflow, four skinned GLBs in r128, joint motion, prayer ground bounds, runtime clips, outfit fallback, privacy and footwear',characters:report}));
}
checkCharacters().catch(err=>{console.error(err);process.exitCode=1}).finally(()=>dom.window.close());
