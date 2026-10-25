// Blender armature animation. Each cached scene belongs to the single player;
// never Object3D.clone a SkinnedMesh (that would share the original skeleton).
interface AnimatedPilgrim {
  id: string;
  scene: THREE.Group;
  mixer: THREE.AnimationMixer;
  actions: Record<string, THREE.AnimationAction>;
  current: string;
  appearance: string;
}
const pilgrimCache = new Map<string, Promise<AnimatedPilgrim | null>>();
function pilgrimId(): string {
  return P.gender === "P" ? (P.ihram ? "perempuan-telekung" : "perempuan-biasa") : (P.ihram ? "lelaki-ihram" : "lelaki-biasa");
}
async function fetchPilgrim(id: string): Promise<AnimatedPilgrim | null> {
  let pending = pilgrimCache.get(id);
  if (!pending) {
    pending = loadGltfLib().then(ok => new Promise<AnimatedPilgrim | null>(resolve => {
      if (!ok) return resolve(null);
      const loader = new (THREE as unknown as { GLTFLoader: new () => GltfLoaderLike }).GLTFLoader();
      loader.load("models/" + id + ".glb", gl => {
        if (!gl.animations.length) return resolve(null);
        const mixer = new THREE.AnimationMixer(gl.scene);
        const actions: Record<string, THREE.AnimationAction> = {};
        for (const clip of gl.animations) actions[clip.name] = mixer.clipAction(clip);
        gl.scene.traverse(o => {
          const m = o as THREE.Mesh;
          if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; }
        });
        resolve({id,scene:gl.scene,mixer,actions,current:"",appearance:""});
      }, undefined, err => { console.warn("Character gagal dimuat", id, err); resolve(null); });
    }));
    pilgrimCache.set(id, pending);
  }
  return pending;
}
function attachPilgrim(r: PlayerRig, character: AnimatedPilgrim): void {
  if (r.avatar) r.root.remove(r.avatar);
  r.character = character;
  r.avatar = character.scene;
  character.appearance = "";
  character.mixer.stopAllAction(); character.current = "";
  r.root.add(character.scene);
}
function requestPilgrim(r: PlayerRig): void {
  const id = pilgrimId();
  if (r.characterRequest === id) return;
  r.characterRequest = id;
  void fetchPilgrim(id).then(character => {
    // An outfit/sex change may finish loading before an earlier request.
    if (r.characterRequest !== id || !character) return;
    attachPilgrim(r, character);
  });
}
function pilgrimClip(): string {
  const prayer = miqatPrayerPose();
  if (prayer) return ({stand:"Idle",takbir:"Takbir",fold:"Bersedekap",bow:"Rukuk",sit:"Duduk",sujud:"Sujud",salam:"Salam"})[prayer];
  if (miqatActivity?.kind === "nails" || miqatActivity?.kind === "wudu") return "Groom";
  if (P.pose === "sleep") return "Sleep";
  if (P.pose === "sit") return "Duduk";
  if (P.pose === "throw") return "Throw";
  if (P.pose === "pray") return "Takbir";
  return P.moving ? "Walk" : "Idle";
}
function updatePilgrim(r: PlayerRig, dt: number): void {
  const c = r.character; if (!c) return;
  r.root.position.y = 0; // vertical motion is authored in the armature.
  const appearance = [P.skin,P.outfit,P.acc,P.ihram,P.shaved,insideMiqat].join();
  if (appearance !== c.appearance) {
    c.appearance = appearance;
    c.scene.traverse(o => {
      if (o.name.startsWith("Hair_")) o.visible = !P.shaved;
      if (o.name.startsWith("Footwear_")) o.visible = insideMiqat !== "mosque";
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      for (const material of mats) {
        const mt = material as THREE.MeshStandardMaterial;
        if (mt.name.startsWith("Skin")) mt.color.set(P.skin);
        if (mt.name.startsWith("Outfit")) mt.color.set(P.outfit);
        if (mt.name.startsWith("Scarf")) mt.color.set(P.acc);
      }
    });
  }
  const clip = pilgrimClip();
  if (clip !== c.current && c.actions[clip]) {
    if (c.current) c.actions[c.current].fadeOut(.18);
    const action = c.actions[clip];
    action.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(.18).play();
    c.current = clip;
  }
  c.mixer.update(Math.min(dt,.1));
}
