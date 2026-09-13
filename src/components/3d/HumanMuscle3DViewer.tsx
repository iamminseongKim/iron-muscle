import { t, displayMuscle } from '../../i18n';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MuscleTarget } from '../../types/workout';
import { loadAnatomyModel, disposeAnatomy, AnatomyPart } from './anatomyModel';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface HumanMuscle3DViewerProps {
  primaryMuscles?: MuscleTarget[];
  secondaryMuscles?: MuscleTarget[];
  activeMuscleFilter?: MuscleTarget | null;
  onSelectMuscle?: (muscle: MuscleTarget) => void;
  height?: string;
  showControls?: boolean;
  isDark?: boolean;
}
type View = 'front' | 'back' | 'both';
export const HumanMuscle3DViewer: React.FC<HumanMuscle3DViewerProps> = ({
  primaryMuscles = [], secondaryMuscles = [], activeMuscleFilter = null,
  onSelectMuscle, height = '480px', showControls = true, isDark = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{ view: (view: View) => void; zoom: (scale: number) => void; reset: () => void; clearSelection: () => void; paint: () => void }>();
  const propsRef = useRef({ primaryMuscles, secondaryMuscles, activeMuscleFilter, onSelectMuscle, isDark });
  propsRef.current = { primaryMuscles, secondaryMuscles, activeMuscleFilter, onSelectMuscle, isDark };
  const [view, setView] = useState<View>('both');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<MuscleTarget | null>(null);

  useEffect(() => {
    const container = containerRef.current!;
    let disposed = false;
    let group: THREE.Group | undefined;
    let parts: AnatomyPart[] = [];
    let frame = 0;
    let currentView: View = 'both';
    let selectedTarget: MuscleTarget | null = null;
    let visible = true;
    let dirty = true;
    let contextLost = false;
    setStatus('loading'); setView('both'); setSelected(null);
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' }); }
    catch { setStatus('error'); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setScissorTest(true);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x666677, 2));
    const light = new THREE.DirectionalLight(0xffffff, 2.5); light.position.set(3, 5, 7); scene.add(light);
    const rearLight = new THREE.DirectionalLight(0xffffff, 1.7); rearLight.position.set(-3, 2, -5); scene.add(rearLight);
    const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
    const front = camera.clone(), back = camera.clone();
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.enablePan = false;
    controls.minDistance = 3; controls.maxDistance = 20;
    controls.minPolarAngle = Math.PI * .25; controls.maxPolarAngle = Math.PI * .75;
    let width = 1, h = 1;
    const fit = (aspect: number) => Math.max(5.6, 2.8 / aspect) / (2 * Math.tan(THREE.MathUtils.degToRad(17.5)));
    const reset = () => {
      dirty = true;
      controls.target.set(0, 0, 0);
      camera.position.set(0, 0, (currentView === 'back' ? -1 : 1) * fit(width / h));
      camera.lookAt(0, 0, 0); controls.update();
      front.position.set(0, 0, fit(width / 2 / h)); front.lookAt(0, 0, 0);
      back.position.set(0, 0, -fit(width / 2 / h)); back.lookAt(0, 0, 0);
    };
    const resize = () => {
      width = Math.max(1, container.clientWidth); h = Math.max(1, container.clientHeight);
      renderer.setSize(width, h);
      camera.aspect = width / h; camera.updateProjectionMatrix();
      [front, back].forEach(cam => { cam.aspect = width / 2 / h; cam.updateProjectionMatrix(); });
      reset();
    };
    const paint = () => {
      dirty = true;
      const p = propsRef.current;
      scene.background = new THREE.Color(p.isDark ? 0x151519 : 0xf3f5f8);
      parts.forEach(({ mesh, target, neutral }) => {
        const chosen = target && (p.onSelectMuscle ? p.activeMuscleFilter === target : selectedTarget === target);
        const primary = target && (p.primaryMuscles.includes(target) || target === 'chest_upper' && p.primaryMuscles.includes('chest'));
        const secondary = target && p.secondaryMuscles.includes(target);
        mesh.material.color.setHex(chosen ? 0x328bff : primary ? 0xff2d55 : secondary ? 0xff9500 : neutral);
        mesh.material.emissive.setHex(chosen ? 0x092040 : 0x000000);
        mesh.userData.highlight = chosen ? 'selected' : primary ? 'primary' : secondary ? 'secondary' : 'none';
      });
    };
    apiRef.current = {
      view: mode => { currentView = mode; controls.enabled = mode !== 'both'; reset(); },
      zoom: factor => {
        dirty = true;
        const cams = currentView === 'both' ? [front, back] : [camera];
        cams.forEach(cam => cam.position.multiplyScalar(THREE.MathUtils.clamp(cam.position.length() * factor, 3, 25) / cam.position.length()));
        controls.update();
      }, reset, paint, clearSelection: () => { selectedTarget = null; setSelected(null); paint(); },
    };
    controls.enabled = false;
    let pointer: { x: number; y: number } | null = null;
    let multiTouch = false;
    const pointers = new Set<number>();
    const down = (event: PointerEvent) => {
      pointers.add(event.pointerId);
      if (pointers.size > 1) multiTouch = true;
      else { multiTouch = false; pointer = { x: event.clientX, y: event.clientY }; }
    };
    const up = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      if (!pointer || multiTouch || Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 5 || !group) return;
      pointer = null;
      const rect = renderer.domElement.getBoundingClientRect();
      let x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      let cam = camera; let viewportWidth = width;
      if (currentView === 'both') { viewportWidth = width / 2; cam = x < viewportWidth ? front : back; x %= viewportWidth; }
      const ray = new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2(x / viewportWidth * 2 - 1, -y / h * 2 + 1), cam);
      const hit = ray.intersectObject(group, true)[0];
      const target = hit?.object.userData.muscleTarget as MuscleTarget | undefined;
      if (target) {
        selectedTarget = selectedTarget === target ? null : target;
        setSelected(selectedTarget); propsRef.current.onSelectMuscle?.(target); paint();
      }
    };
    const cancel = () => { pointers.clear(); pointer = null; multiTouch = false; };
    const lost = (event: Event) => { event.preventDefault(); contextLost = true; setStatus('error'); };
    const changed = () => { dirty = true; };
    controls.addEventListener('change', changed);
    renderer.domElement.addEventListener('pointerdown', down);
    renderer.domElement.addEventListener('pointerup', up);
    renderer.domElement.addEventListener('pointercancel', cancel);
    renderer.domElement.addEventListener('webglcontextlost', lost);
    const observer = new ResizeObserver(resize); observer.observe(container); resize(); paint();
    const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; dirty = true; }); intersection.observe(container);
    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (!visible || document.hidden || contextLost) return;
      controls.update();
      if (!dirty) return;
      dirty = false;
      if (currentView === 'both') {
        const half = Math.floor(width / 2);
        renderer.setViewport(0, 0, half, h); renderer.setScissor(0, 0, half, h); renderer.render(scene, front);
        renderer.setViewport(half, 0, width - half, h); renderer.setScissor(half, 0, width - half, h); renderer.render(scene, back);
      } else { renderer.setViewport(0, 0, width, h); renderer.setScissor(0, 0, width, h); renderer.render(scene, camera); }
    };
    animate();
    loadAnatomyModel().then(model => {
      if (disposed) { disposeAnatomy(model.group); return; }
      group = model.group; parts = model.parts; scene.add(group); paint(); if (!contextLost) setStatus('ready');
      container.dataset.model = 'bodyparts3d-z-anatomy';
      container.dataset.targetCount = String(parts.filter(part => part.target).length);
    }).catch(error => { console.warn('3D model load failed', error); if (!disposed) setStatus('error'); });
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect(); controls.removeEventListener('change', changed); controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', down); renderer.domElement.removeEventListener('pointerup', up);
      renderer.domElement.removeEventListener('pointercancel', cancel); renderer.domElement.removeEventListener('webglcontextlost', lost);
      if (group) disposeAnatomy(group);
      renderer.dispose(); renderer.domElement.remove(); apiRef.current = undefined;
    };
  }, [attempt]);

  const muscleSignature = `${primaryMuscles.join(',')}|${secondaryMuscles.join(',')}`;
  useEffect(() => { apiRef.current?.clearSelection(); }, [muscleSignature]);
  useEffect(() => { apiRef.current?.paint(); }, [primaryMuscles, secondaryMuscles, activeMuscleFilter, isDark]);
  const displayedTarget = onSelectMuscle ? activeMuscleFilter : selected;
  const chooseView = (mode: View) => { setView(mode); apiRef.current?.view(mode); };
  return (
    <section aria-label={t("통합 3D 근육 해부도")} className="rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 bg-[#F3F5F8] dark:bg-[#151519]">
      <div className="px-3 pt-3 flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-300">
        <span><span className="text-[#FF2D55]">●</span> {t("주동근")}</span><span><span className="text-[#FF9500]">●</span> {t("협응근")}</span><span><span className="text-[#328bff]">●</span> {t("선택 근육")}</span>
      </div>
      <div className="relative" style={{ height }}>
        <div ref={containerRef} role="img" aria-label={view === 'both' ? t('동일한 3D 인체의 전면과 후면') : t('드래그로 회전하고 두 손가락으로 확대하는 인체')} className="absolute inset-0 touch-none" />
        {status !== 'ready' && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#F3F5F8] dark:bg-[#151519] p-5 text-center text-sm text-gray-500" role="status">
          <p>{status === 'loading' ? t('3D 해부학 모델을 불러오는 중…') : t('3D 모델을 표시하지 못했어요.')}</p>
          {status === 'error' && <button type="button" onClick={() => setAttempt(value => value + 1)} className="text-[#007AFF] font-bold">{t("다시 불러오기")}</button>}
        </div>}
      </div>
      {showControls && <div className="px-3 pb-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex rounded-xl bg-black/5 dark:bg-white/5 p-1">
            {(['both', 'front', 'back'] as const).map(mode => <button type="button" key={mode} disabled={status !== 'ready'} aria-pressed={view === mode} onClick={() => chooseView(mode)} className={`px-3 py-2 text-xs rounded-lg font-bold ${view === mode ? 'bg-white dark:bg-[#333338] shadow-sm' : 'text-gray-500'}`}>{mode === 'both' ? t('앞뒤 함께') : mode === 'front' ? t('전면·회전') : t('후면·회전')}</button>)}
          </div>
          <div className="flex gap-1">
            <button type="button" aria-label={t("인체 확대")} onClick={() => apiRef.current?.zoom(.85)} className="p-2"><ZoomIn size={18} /></button>
            <button type="button" aria-label={t("인체 축소")} onClick={() => apiRef.current?.zoom(1.15)} className="p-2"><ZoomOut size={18} /></button>
            <button type="button" aria-label={t("시점 초기화")} onClick={() => apiRef.current?.reset()} className="p-2"><RotateCcw size={18} /></button>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400" role="status">{displayedTarget ? displayMuscle(displayedTarget) : view === 'both' ? t('앞뒤는 같은 모델이에요. 전면·후면을 선택해 돌려 보세요.') : t('드래그하여 회전 · 두 손가락으로 확대 · 근육을 눌러 이름 확인')}</p>
      </div>}
      <div className="px-3 pb-3 text-[10px] text-gray-500"><a href={`${import.meta.env.BASE_URL}anatomy/NOTICE.html`} target="_blank" rel="noreferrer" className="underline">{t("3D 모델 출처")} · BodyParts3D / Z-Anatomy · CC BY-SA</a></div>
    </section>
  );
};
