import * as THREE from 'three';
import { MuscleTarget } from '../../types/workout';

export interface MuscleMeshPart {
  id: MuscleTarget | 'neutral_head' | 'neutral_torso' | 'neutral_pelvis' | 'neutral_joints';
  mesh: THREE.Mesh;
  isTargetable: boolean;
  targetKey?: MuscleTarget;
  defaultPosition: THREE.Vector3;
}

type Section = { y: number; x: number; rx: number; rz: number; z?: number };
// Smooth, continuous cross sections rather than separate cylinders and muscle balls.
function sample(sections: Section[], y: number): Section {
  const index = Math.max(0, Math.min(sections.length - 2, sections.findIndex(p => p.y >= y) - 1));
  const i = y >= sections[sections.length - 1].y ? sections.length - 2 : index;
  const a = sections[i], b = sections[i + 1];
  const t = THREE.MathUtils.clamp((y - a.y) / (b.y - a.y), 0, 1);
  // Cubic Hermite tangents keep the silhouette smooth across cross sections.
  const prev = sections[Math.max(0, i - 1)], next = sections[Math.min(sections.length - 1, i + 2)];
  const interpolate = (key: 'x' | 'rx' | 'rz' | 'z') => {
    const av = a[key] || 0, bv = b[key] || 0;
    const m0 = (bv - (prev[key] || 0)) / (b.y - prev.y) * (b.y - a.y);
    const m1 = ((next[key] || 0) - av) / (next.y - a.y) * (b.y - a.y);
    return (2*t*t*t - 3*t*t + 1)*av + (t*t*t - 2*t*t + t)*m0 + (-2*t*t*t + 3*t*t)*bv + (t*t*t - t*t)*m1;
  };
  return { y, x: interpolate('x'), rx: Math.max(.001,interpolate('rx')), rz: Math.max(.001,interpolate('rz')), z: interpolate('z') };
}

function surface(sections: Section[], y: number, angle: number, offset = 0): THREE.Vector3 {
  const s = sample(sections, y);
  return new THREE.Vector3(s.x + (s.rx + offset) * Math.sin(angle), y, (s.z || 0) + (s.rz + offset) * Math.cos(angle));
}

function gridGeometry(point: (u: number, v: number) => THREE.Vector3, cols = 48, rows = 64): THREE.BufferGeometry {
  const vertices: number[] = [], indices: number[] = [];
  for (let row = 0; row <= rows; row++) for (let col = 0; col <= cols; col++) {
    const p = point(col / cols, row / rows);
    vertices.push(p.x, p.y - 2.34, p.z);
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const a = r * (cols + 1) + c, b = a + cols + 1;
    indices.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function createHumanMuscleModel(isDark = false): { group: THREE.Group; parts: MuscleMeshPart[] } {
  const group = new THREE.Group(), parts: MuscleMeshPart[] = [];
  const neutral = isDark ? 0x8793a3 : 0xb9c3ce;
  const add = (geometry: THREE.BufferGeometry, target?: MuscleTarget) => {
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: neutral, roughness: 0.8, metalness: 0, side: THREE.DoubleSide }));
    group.add(mesh);
    parts.push({ id: target || 'neutral_torso', mesh, isTargetable: Boolean(target), targetKey: target, defaultPosition: mesh.position.clone() });
    return mesh;
  };
  const body = (profile: Section[]) => add(gridGeometry((u, v) => surface(profile, THREE.MathUtils.lerp(profile[0].y, profile[profile.length - 1].y, v), u * Math.PI * 2)));
  // Muscle regions sit on the body surface. Small raised edges preserve readable anatomy
  // without breaking the silhouette; front and back remain separate raycast targets.
  const region = (profile: Section[], target: MuscleTarget, low: number, high: number, angle: number, width: number) => {
    add(gridGeometry((u, v) => {
      const taper = 0.18 + 0.82 * Math.pow(Math.sin(Math.PI * v), 0.45);
      return surface(profile, THREE.MathUtils.lerp(low, high, v), angle + (u - 0.5) * width * taper, 0.014 + 0.008 * Math.sin(Math.PI * u) * Math.sin(Math.PI * v));
    }, 24, 36), target);
  };
  const torso: Section[] = [
    {y:1.91,x:0,rx:0.20,rz:0.17}, {y:2.08,x:0,rx:0.39,rz:0.23},
    {y:2.32,x:0,rx:0.42,rz:0.245}, {y:2.58,x:0,rx:0.35,rz:0.22},
    {y:2.84,x:0,rx:0.365,rz:0.235}, {y:3.14,x:0,rx:0.47,rz:0.275},
    {y:3.43,x:0,rx:0.565,rz:0.285}, {y:3.66,x:0,rx:0.57,rz:0.245},
    {y:3.80,x:0,rx:0.43,rz:0.195}, {y:3.94,x:0,rx:0.16,rz:0.15},
    {y:4.16,x:0,rx:0.135,rz:0.13},
  ];
  body(torso);
  // Project curved anatomical outlines onto the torso (front +Z, rear -Z).
  const patch = (target: MuscleTarget, points: number[][], side: number, back = false) => {
    const outline = new THREE.CatmullRomCurve3(points.map(([x,y]) => new THREE.Vector3(x * side,y,0)), true, 'centripetal');
    const boundary = outline.getPoints(64).slice(0,-1);
    const center = boundary.reduce((sum,p) => sum.add(p),new THREE.Vector3()).multiplyScalar(1/boundary.length);
    const project = (x: number,y: number,raise: number) => {
      const sec = sample(torso,y);
      const z = Math.sqrt(Math.max(0,1 - (x / sec.rx) ** 2)) * sec.rz + raise;
      return new THREE.Vector3(x,y,back ? -z : z);
    };
    add(gridGeometry((u,v) => {
      const p = outline.getPoint(u);
      return project(THREE.MathUtils.lerp(center.x,p.x,v), THREE.MathUtils.lerp(center.y,p.y,v), 0.005 + 0.012 * (1-v*v));
    },64,12),target);
  };
  for (const side of [-1,1]) {
    patch('chest_upper',[[.025,3.68],[.22,3.74],[.49,3.65],[.39,3.55],[.04,3.55]],side);
    patch('chest',[[.025,3.53],[.25,3.54],[.49,3.59],[.46,3.32],[.19,3.26],[.035,3.32]],side);
    patch('obliques',[[.22,3.12],[.40,3.14],[.33,2.76],[.33,2.44],[.17,2.30],[.19,2.68]],side);
    patch('lats',[[.16,3.46],[.49,3.52],[.45,3.14],[.32,2.66],[.14,2.52]],side,true);
    patch('traps',[[.035,3.91],[.16,3.89],[.48,3.72],[.32,3.45],[.07,3.13]],side,true);
    patch('erectors',[[.045,3.15],[.13,3.11],[.15,2.61],[.07,2.31],[.04,2.66]],side,true);
    for (let row=0;row<4;row++) {
      const y = 3.14 - row*.205;
      patch('abs',[[.025,y],[.16,y+.01],[.175,y-.12],[.035,y-.145]],side);
    }
    // Arms in a relaxed A pose, shoulder → elbow → wrist continuously joined.
    const arm: Section[] = [
      {y:2.11,x:side*1.02,rx:.075,rz:.072}, {y:2.30,x:side*.99,rx:.09,rz:.09},
      {y:2.55,x:side*.94,rx:.13,rz:.125}, {y:2.76,x:side*.88,rx:.125,rz:.12},
      {y:2.91,x:side*.835,rx:.115,rz:.115}, {y:3.12,x:side*.79,rx:.15,rz:.155},
      {y:3.36,x:side*.71,rx:.185,rz:.175}, {y:3.61,x:side*.62,rx:.205,rz:.20},
      {y:3.77,x:side*.56,rx:.12,rz:.13}, {y:3.82,x:side*.52,rx:.025,rz:.025},
    ];
    body(arm);
    region(arm,'deltoid_front',3.37,3.77,side*.48,1.10);
    region(arm,'deltoid_side',3.35,3.78,side*1.57,1.0);
    region(arm,'deltoid_rear',3.35,3.76,side*2.65,1.05);
    region(arm,'biceps',2.98,3.40,0,1.9);
    region(arm,'triceps',2.96,3.43,Math.PI,2.1);
    region(arm,'forearms',2.17,2.89,0,2.8);
    region(arm,'forearms',2.17,2.89,Math.PI,2.8);
    const hand: Section[] = [
      {y:1.80,x:side*1.085,rx:.045,rz:.025}, {y:1.86,x:side*1.07,rx:.083,rz:.04},
      {y:2.0,x:side*1.045,rx:.095,rz:.052}, {y:2.12,x:side*1.02,rx:.075,rz:.07},
    ];
    body(hand);
    // Thumb tucked alongside the palm, with a rounded tip.
    body([{y:1.91,x:side*.956,rx:.015,rz:.02,z:.015},{y:2.0,x:side*.946,rx:.038,rz:.038,z:.018},{y:2.10,x:side*.98,rx:.035,rz:.045}]);
    const leg: Section[] = [
      {y:.19,x:side*.32,rx:.08,rz:.09}, {y:.40,x:side*.32,rx:.085,rz:.105},
      {y:.70,x:side*.32,rx:.145,rz:.155,z:-.02}, {y:.93,x:side*.31,rx:.14,rz:.145},
      {y:1.12,x:side*.30,rx:.115,rz:.13,z:.025}, {y:1.30,x:side*.29,rx:.15,rz:.17},
      {y:1.61,x:side*.27,rx:.205,rz:.215}, {y:1.92,x:side*.235,rx:.235,rz:.24},
      {y:2.12,x:side*.22,rx:.22,rz:.22}, {y:2.27,x:side*.20,rx:.11,rz:.12},
    ];
    body(leg);
    region(leg,'quads',1.23,2.08,0,2.8);
    region(leg,'hamstrings',1.22,2.02,Math.PI,2.7);
    region(leg,'calves',.39,1.04,Math.PI,2.9);
    region(leg,'glutes',1.94,2.26,Math.PI,2.6);
    // Neutral shins and rounded feet retain the natural leg silhouette.
    const foot = new THREE.SphereGeometry(1,32,24);
    foot.scale(.105,.105,.23);
    foot.translate(side*.32,.115-2.34,.11);
    add(foot);
  }
  // Sculpted head: narrower jaw, rounded cranium, subtle nose and ears.
  body([{y:4.05,x:0,rx:.085,rz:.11,z:.03},{y:4.16,x:0,rx:.155,rz:.155,z:.025},{y:4.34,x:0,rx:.195,rz:.18},{y:4.49,x:0,rx:.185,rz:.175,z:-.008},{y:4.62,x:0,rx:.12,rz:.12},{y:4.67,x:0,rx:.002,rz:.002}]);
  const ellipsoid = (x:number,y:number,z:number,rx:number,ry:number,rz:number) => {
    const geo = new THREE.SphereGeometry(1,24,16);
    geo.scale(rx,ry,rz); geo.translate(x,y-2.34,z); add(geo);
  };
  ellipsoid(0,4.30,.175,.032,.065,.038);
  for (const side of [-1,1]) ellipsoid(side*.19,4.30,0,.034,.07,.04);
  return {group,parts};
}
