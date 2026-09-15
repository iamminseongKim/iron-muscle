import { MeshoptDecoder } from 'meshoptimizer/meshopt_decoder.module.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MuscleTarget } from '../../types/workout';

// Anatomical names come from the pinned BodyParts3D / Z-Anatomy meshes.
export function muscleTargetForName(raw: string): MuscleTarget | undefined {
  const name = raw.toLowerCase().replace(/_/g, ' ');
  if (/pectoralis major/.test(name)) return name.includes('clavicular') ? 'chest_upper' : 'chest';
  if (/deltoid/.test(name)) return name.includes('clavicular') ? 'deltoid_front' : name.includes('spinal') ? 'deltoid_rear' : 'deltoid_side';
  if (/latissimus dorsi/.test(name)) return 'lats';
  if (/trapezius/.test(name)) return 'traps';
  if (/biceps brachii|brachialis/.test(name)) return 'biceps';
  if (/triceps brachii/.test(name)) return 'triceps';
  if (/rectus abdominis/.test(name)) return 'abs';
  if (/external oblique|internal oblique|transversus abdominis/.test(name)) return 'obliques';
  if (/iliocostalis|longissimus|spinalis|multifidus/.test(name)) return 'erectors';
  if (/gluteus/.test(name)) return 'glutes';
  if (/rectus femoris|vastus/.test(name)) return 'quads';
  if (/biceps femoris|semitendinosus|semimembranosus/.test(name)) return 'hamstrings';
  if (/gastrocnemius|soleus/.test(name)) return 'calves';
  if (/carpi|digitorum (superficialis|profundus)|brachioradialis|pronator|supinator/.test(name)) return 'forearms';
  return undefined;
}

export interface AnatomyPart { mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>; target?: MuscleTarget; neutral: number }
export function disposeAnatomy(group: THREE.Object3D) {
  group.traverse(object => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => material.dispose());
    }
  });
}

export async function loadAnatomyModel(): Promise<{ group: THREE.Group; parts: AnatomyPart[] }> {
  await MeshoptDecoder.ready;
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const loadModel = (name: string) => {
    return loader.loadAsync(`${import.meta.env.BASE_URL}anatomy/${name}.glb`);
  };
  // allSettled ensures a successful half-load is disposed if the other file fails.
  const results = await Promise.allSettled([
    loadModel('anatomy'),
    loadModel('skeleton'),
  ]);
  if (results.some(result => result.status === 'rejected')) {
    results.forEach(result => { if (result.status === 'fulfilled') disposeAnatomy(result.value.scene); });
    throw new Error(`Anatomy model load failed: ${results.filter(result => result.status === 'rejected').map(result => (result as PromiseRejectedResult).reason).join('; ')}`);
  }
  const roots = results.map(result => (result as PromiseFulfilledResult<Awaited<ReturnType<typeof loader.loadAsync>>>).value.scene);
  const box = new THREE.Box3().setFromObject(roots[0]);
  const center = box.getCenter(new THREE.Vector3());
  const scale = 5 / box.getSize(new THREE.Vector3()).z;
  const transform = new THREE.Matrix4().makeRotationX(-Math.PI / 2)
    .multiply(new THREE.Matrix4().makeScale(scale, scale, scale))
    .multiply(new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z));
  const buckets = new Map<string, THREE.BufferGeometry[]>();
  roots.forEach((root, index) => {
    root.updateMatrixWorld(true);
    root.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      // Omit the thoracolumbar fascia sheet so the erector region remains inspectable.
      if (/layer.of.thoracolumbar.fascia/i.test(object.name)) return;
      const target = index === 0 ? muscleTargetForName(object.name) : undefined;
      const connective = /tendon|ligament|fascia|retinaculum|tract|aponeurosis/i.test(object.name);
      const key = index === 1 ? 'bone' : connective ? 'connective' : target || 'neutral';
      
      let baseGeo = object.geometry;
      // 복직근(식스팩) 앞면을 덮어 시각화 및 터치 선택을 가로막는 외복사근 전면 건막 판(aponeurosis) 절제
      if (target === 'obliques' && baseGeo.index) {
        const pos = baseGeo.attributes.position;
        const indexAttr = baseGeo.index;
        const newIndices: number[] = [];
        for (let i = 0; i < indexAttr.count; i += 3) {
          const ia = indexAttr.getX(i);
          const ib = indexAttr.getX(i + 1);
          const ic = indexAttr.getX(i + 2);
          const mx = (pos.getX(ia) + pos.getX(ib) + pos.getX(ic)) / 3;
          const my = (pos.getY(ia) + pos.getY(ib) + pos.getY(ic)) / 3;
          const mz = (pos.getZ(ia) + pos.getZ(ib) + pos.getZ(ic)) / 3;
          const isFrontRectusCover = Math.abs(mx) < 68 && my < -140 && mz >= 770 && mz <= 1200;
          if (!isFrontRectusCover) {
            newIndices.push(ia, ib, ic);
          }
        }
        baseGeo = baseGeo.clone();
        baseGeo.setIndex(newIndices);
      }

      const geometry = baseGeo.clone().applyMatrix4(object.matrixWorld).applyMatrix4(transform);
      if (baseGeo !== object.geometry) baseGeo.dispose();
      // All meshes use the same attribute schema for one draw call per target group.
      Object.keys(geometry.attributes).forEach(name => { if (name !== 'position' && name !== 'normal') geometry.deleteAttribute(name); });
      if (!geometry.getAttribute('normal')) geometry.computeVertexNormals();
      const list = buckets.get(key) || [];
      list.push(geometry); buckets.set(key, list);
    });
    disposeAnatomy(root);
  });
  const group = new THREE.Group();
  const parts: AnatomyPart[] = [];
  buckets.forEach((geometries, key) => {
    const geometry = mergeGeometries(geometries);
    geometries.forEach(geometry => geometry.dispose());
    if (!geometry) throw new Error(`Cannot merge ${key}`);
    const neutral = key === 'bone' || key === 'connective' ? 0xcfc7b8 : 0xa9a2a0;
    const material = new THREE.MeshStandardMaterial({ color: neutral, roughness: .7, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    const target = ['bone', 'connective', 'neutral'].includes(key) ? undefined : key as MuscleTarget;
    mesh.name = key;
    mesh.userData.muscleTarget = target;
    group.add(mesh); parts.push({ mesh, target, neutral });
  });
  return { group, parts };
}
