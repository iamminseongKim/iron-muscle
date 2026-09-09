import * as THREE from 'three';
import { MuscleTarget } from '../../types/workout';

export interface MuscleMeshPart {
  id: MuscleTarget | 'neutral_head' | 'neutral_torso' | 'neutral_pelvis' | 'neutral_joints';
  mesh: THREE.Mesh;
  isTargetable: boolean;
  targetKey?: MuscleTarget;
  defaultPosition: THREE.Vector3;
}

// 절차적 해부학 근육 섬유(Muscle Fibers) 텍스처 생성
function createAnatomyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 512, 512);

    // 미세한 근섬유 결(Striation) 라인 드로잉
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 512; i += 4) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.bezierCurveTo(170, i + Math.sin(i * 0.05) * 8, 340, i - Math.sin(i * 0.05) * 8, 512, i);
      ctx.stroke();
    }

    // 앰비언트 그라데이션
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 4);
  return texture;
}

export function createHumanMuscleModel(isDark = false): { group: THREE.Group; parts: MuscleMeshPart[] } {
  const group = new THREE.Group();
  const parts: MuscleMeshPart[] = [];
  const anatomyTexture = createAnatomyTexture();

  // 기본 재질 생성 헬퍼
  const createMaterial = (color: number, roughness = 0.35, metalness = 0.15) => {
    return new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      map: anatomyTexture,
      bumpMap: anatomyTexture,
      bumpScale: 0.02,
    });
  };

  const neutralColor = isDark ? 0x2C2C2E : 0xD1D5DB;
  const neutralMat = createMaterial(neutralColor);

  // 1. 머리 & 목 (유려한 곡선)
  const headGeo = new THREE.SphereGeometry(0.32, 32, 24);
  headGeo.scale(1, 1.25, 1.05);
  const headMesh = new THREE.Mesh(headGeo, neutralMat);
  headMesh.position.set(0, 3.45, 0);
  group.add(headMesh);
  parts.push({ id: 'neutral_head', mesh: headMesh, isTargetable: false, defaultPosition: headMesh.position });

  const neckGeo = new THREE.CylinderGeometry(0.16, 0.2, 0.35, 24);
  const neckMesh = new THREE.Mesh(neckGeo, neutralMat);
  neckMesh.position.set(0, 2.95, 0);
  group.add(neckMesh);

  // 2. 가슴 (대흉근) - 자연스러운 부채꼴 볼륨 (Capsule / Smooth scale)
  const makePec = (isLeft: boolean, isUpper = false) => {
    const geo = new THREE.SphereGeometry(isUpper ? 0.22 : 0.28, 24, 20);
    geo.scale(isUpper ? 1.3 : 1.2, 0.75, 0.85);

    const mesh = new THREE.Mesh(geo, neutralMat.clone());
    const x = isLeft ? -0.25 : 0.25;
    const y = isUpper ? 2.68 : 2.45;
    const z = 0.22;
    mesh.position.set(x, y, z);
    mesh.rotation.z = isLeft ? 0.12 : -0.12;
    mesh.rotation.y = isLeft ? -0.2 : 0.2;
    mesh.rotation.x = -0.1;
    group.add(mesh);

    const targetKey: MuscleTarget = isUpper ? 'chest_upper' : 'chest';
    parts.push({ id: targetKey, mesh, isTargetable: true, targetKey, defaultPosition: mesh.position });
  };
  makePec(true, false);
  makePec(false, false);
  makePec(true, true);
  makePec(false, true);

  // 3. 복직근 (식스팩 - 둥근 엠보싱) & 외복사근
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      const geo = new THREE.SphereGeometry(0.11, 16, 16);
      geo.scale(1.1, 0.8, 0.7);
      const mesh = new THREE.Mesh(geo, neutralMat.clone());
      const x = col === 0 ? -0.11 : 0.11;
      const y = 2.12 - row * 0.18;
      const z = 0.21;
      mesh.position.set(x, y, z);
      group.add(mesh);
      parts.push({ id: 'abs', mesh, isTargetable: true, targetKey: 'abs', defaultPosition: mesh.position });
    }
  }

  // 외복사근 (좌/우 옆구리 라인)
  const makeOblique = (isLeft: boolean) => {
    const geo = new THREE.CylinderGeometry(0.11, 0.13, 0.52, 20);
    const mesh = new THREE.Mesh(geo, neutralMat.clone());
    const x = isLeft ? -0.34 : 0.34;
    mesh.position.set(x, 1.94, 0.12);
    mesh.rotation.z = isLeft ? -0.22 : 0.22;
    group.add(mesh);
    parts.push({ id: 'obliques', mesh, isTargetable: true, targetKey: 'obliques', defaultPosition: mesh.position });
  };
  makeOblique(true);
  makeOblique(false);

  // 4. 승모근 (상부/중부 다이아몬드 곡면)
  const makeTrap = (isLeft: boolean) => {
    const geo = new THREE.ConeGeometry(0.32, 0.65, 16);
    geo.scale(1, 1, 0.6);
    const mesh = new THREE.Mesh(geo, neutralMat.clone());
    const x = isLeft ? -0.2 : 0.2;
    mesh.position.set(x, 2.82, -0.14);
    mesh.rotation.z = isLeft ? -0.45 : 0.45;
    mesh.rotation.x = 0.25;
    group.add(mesh);
    parts.push({ id: 'traps', mesh, isTargetable: true, targetKey: 'traps', defaultPosition: mesh.position });
  };
  makeTrap(true);
  makeTrap(false);

  // 5. 광배근 (등 좌/우 날개 - 유려한 V-Taper)
  const makeLat = (isLeft: boolean) => {
    const geo = new THREE.CylinderGeometry(0.24, 0.12, 0.68, 20);
    geo.scale(1.2, 1, 0.6);
    const mesh = new THREE.Mesh(geo, neutralMat.clone());
    const x = isLeft ? -0.36 : 0.36;
    mesh.position.set(x, 2.32, -0.14);
    mesh.rotation.z = isLeft ? -0.28 : 0.28;
    mesh.rotation.y = isLeft ? 0.35 : -0.35;
    group.add(mesh);
    parts.push({ id: 'lats', mesh, isTargetable: true, targetKey: 'lats', defaultPosition: mesh.position });
  };
  makeLat(true);
  makeLat(false);

  // 6. 척추기립근
  const makeErector = (isLeft: boolean) => {
    const geo = new THREE.CylinderGeometry(0.07, 0.09, 0.62, 16);
    const mesh = new THREE.Mesh(geo, neutralMat.clone());
    const x = isLeft ? -0.11 : 0.11;
    mesh.position.set(x, 1.95, -0.16);
    group.add(mesh);
    parts.push({ id: 'erectors', mesh, isTargetable: true, targetKey: 'erectors', defaultPosition: mesh.position });
  };
  makeErector(true);
  makeErector(false);

  // 7. 어깨 (삼각근 전면/측면/후면 - 볼륨 캡)
  const makeDeltoids = (isLeft: boolean) => {
    const baseX = isLeft ? -0.66 : 0.66;
    const baseY = 2.72;

    // 전면 삼각근
    const frontGeo = new THREE.SphereGeometry(0.17, 20, 16);
    frontGeo.scale(1, 1.25, 0.9);
    const frontMesh = new THREE.Mesh(frontGeo, neutralMat.clone());
    frontMesh.position.set(baseX * 0.9, baseY - 0.04, 0.13);
    group.add(frontMesh);
    parts.push({ id: 'deltoid_front', mesh: frontMesh, isTargetable: true, targetKey: 'deltoid_front', defaultPosition: frontMesh.position });

    // 측면 삼각근
    const sideGeo = new THREE.SphereGeometry(0.19, 20, 16);
    sideGeo.scale(0.85, 1.35, 1);
    const sideMesh = new THREE.Mesh(sideGeo, neutralMat.clone());
    sideMesh.position.set(baseX, baseY, 0);
    group.add(sideMesh);
    parts.push({ id: 'deltoid_side', mesh: sideMesh, isTargetable: true, targetKey: 'deltoid_side', defaultPosition: sideMesh.position });

    // 후면 삼각근
    const rearGeo = new THREE.SphereGeometry(0.17, 20, 16);
    rearGeo.scale(1, 1.25, 0.9);
    const rearMesh = new THREE.Mesh(rearGeo, neutralMat.clone());
    rearMesh.position.set(baseX * 0.9, baseY - 0.04, -0.13);
    group.add(rearMesh);
    parts.push({ id: 'deltoid_rear', mesh: rearMesh, isTargetable: true, targetKey: 'deltoid_rear', defaultPosition: rearMesh.position });
  };
  makeDeltoids(true);
  makeDeltoids(false);

  // 8. 상완 (이두근 / 삼두근 / 전완근)
  const makeUpperArm = (isLeft: boolean) => {
    const x = isLeft ? -0.74 : 0.74;
    const y = 2.22;

    // 이두근
    const bicepGeo = new THREE.SphereGeometry(0.14, 20, 16);
    bicepGeo.scale(0.85, 1.4, 0.9);
    const bicepMesh = new THREE.Mesh(bicepGeo, neutralMat.clone());
    bicepMesh.position.set(x, y, 0.07);
    group.add(bicepMesh);
    parts.push({ id: 'biceps', mesh: bicepMesh, isTargetable: true, targetKey: 'biceps', defaultPosition: bicepMesh.position });

    // 삼두근 (말발굽)
    const tricepGeo = new THREE.SphereGeometry(0.16, 20, 16);
    tricepGeo.scale(0.9, 1.5, 1);
    const tricepMesh = new THREE.Mesh(tricepGeo, neutralMat.clone());
    tricepMesh.position.set(x, y, -0.07);
    group.add(tricepMesh);
    parts.push({ id: 'triceps', mesh: tricepMesh, isTargetable: true, targetKey: 'triceps', defaultPosition: tricepMesh.position });

    // 전완근
    const forearmGeo = new THREE.CylinderGeometry(0.12, 0.08, 0.55, 20);
    const forearmMesh = new THREE.Mesh(forearmGeo, neutralMat.clone());
    forearmMesh.position.set(x * 1.04, 1.6, 0.02);
    forearmMesh.rotation.z = isLeft ? 0.08 : -0.08;
    group.add(forearmMesh);
    parts.push({ id: 'forearms', mesh: forearmMesh, isTargetable: true, targetKey: 'forearms', defaultPosition: forearmMesh.position });
  };
  makeUpperArm(true);
  makeUpperArm(false);

  // 9. 둔근 (엉덩이 - 둥글고 입체적인 볼륨)
  const makeGlute = (isLeft: boolean) => {
    const geo = new THREE.SphereGeometry(0.27, 24, 20);
    geo.scale(1, 1.15, 1.25);
    const mesh = new THREE.Mesh(geo, neutralMat.clone());
    const x = isLeft ? -0.23 : 0.23;
    mesh.position.set(x, 1.36, -0.15);
    group.add(mesh);
    parts.push({ id: 'glutes', mesh, isTargetable: true, targetKey: 'glutes', defaultPosition: mesh.position });
  };
  makeGlute(true);
  makeGlute(false);

  // 10. 허벅지 (대퇴사두근 & 햄스트링)
  const makeThigh = (isLeft: boolean) => {
    const x = isLeft ? -0.26 : 0.26;
    const y = 0.84;

    // 대퇴사두근 (앞허벅지 - 외측광근 곡률)
    const quadGeo = new THREE.CylinderGeometry(0.23, 0.16, 0.72, 24);
    quadGeo.scale(1.15, 1, 0.9);
    const quadMesh = new THREE.Mesh(quadGeo, neutralMat.clone());
    quadMesh.position.set(x, y, 0.07);
    quadMesh.rotation.z = isLeft ? 0.04 : -0.04;
    group.add(quadMesh);
    parts.push({ id: 'quads', mesh: quadMesh, isTargetable: true, targetKey: 'quads', defaultPosition: quadMesh.position });

    // 햄스트링 (뒷허벅지)
    const hamGeo = new THREE.CylinderGeometry(0.2, 0.14, 0.68, 24);
    const hamMesh = new THREE.Mesh(hamGeo, neutralMat.clone());
    hamMesh.position.set(x, y, -0.09);
    hamMesh.rotation.z = isLeft ? 0.04 : -0.04;
    group.add(hamMesh);
    parts.push({ id: 'hamstrings', mesh: hamMesh, isTargetable: true, targetKey: 'hamstrings', defaultPosition: hamMesh.position });

    // 무릎 관절
    const kneeGeo = new THREE.SphereGeometry(0.13, 16, 16);
    const kneeMesh = new THREE.Mesh(kneeGeo, neutralMat);
    kneeMesh.position.set(x, 0.42, 0.03);
    group.add(kneeMesh);

    // 종아리 (비복근/가자미근 - 하트형 볼륨)
    const calfGeo = new THREE.SphereGeometry(0.16, 20, 16);
    calfGeo.scale(0.9, 1.8, 0.85);
    const calfMesh = new THREE.Mesh(calfGeo, neutralMat.clone());
    calfMesh.position.set(x, 0.02, -0.03);
    group.add(calfMesh);
    parts.push({ id: 'calves', mesh: calfMesh, isTargetable: true, targetKey: 'calves', defaultPosition: calfMesh.position });

    // 발
    const footGeo = new THREE.BoxGeometry(0.16, 0.09, 0.32);
    const footMesh = new THREE.Mesh(footGeo, neutralMat);
    footMesh.position.set(x, -0.34, 0.07);
    group.add(footMesh);
  };
  makeThigh(true);
  makeThigh(false);

  return { group, parts };
}
