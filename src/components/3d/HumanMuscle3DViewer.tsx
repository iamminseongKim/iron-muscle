import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MuscleTarget } from '../../types/workout';
import { createHumanMuscleModel, MuscleMeshPart } from './MuscleGeometryFactory';
import { MUSCLE_INFO_MAP } from '../../data/muscleMap';
import { RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

interface HumanMuscle3DViewerProps {
  primaryMuscles?: MuscleTarget[];
  secondaryMuscles?: MuscleTarget[];
  activeMuscleFilter?: MuscleTarget | null;
  onSelectMuscle?: (muscle: MuscleTarget) => void;
  height?: string;
  showControls?: boolean;
  isDark?: boolean;
}

export const HumanMuscle3DViewer: React.FC<HumanMuscle3DViewerProps> = ({
  primaryMuscles = [],
  secondaryMuscles = [],
  activeMuscleFilter = null,
  onSelectMuscle,
  height = '380px',
  showControls = true,
  isDark = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const partsRef = useRef<MuscleMeshPart[]>([]);
  const frameIdRef = useRef<number>(0);

  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleTarget | null>(null);
  const [viewAngle, setViewAngle] = useState<'front' | 'back' | 'free'>('front');

  // Three.js 씬 초기화
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const heightPx = container.clientHeight || 380;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const bgColor = isDark ? 0x1C1C1E : 0xF5F5F7;
    scene.background = new THREE.Color(bgColor);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / heightPx, 0.1, 100);
    camera.position.set(0, 1.75, 6.2);
    cameraRef.current = camera;

    // 3. Renderer (애플 스튜디오 룩)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDark ? 1.15 : 1.05;
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.95 : 1.2);
    scene.add(ambientLight);

    const dirLightFront = new THREE.DirectionalLight(0xffffff, isDark ? 1.5 : 1.8);
    dirLightFront.position.set(2, 6, 5);
    scene.add(dirLightFront);

    const dirLightBack = new THREE.DirectionalLight(isDark ? 0x88aaff : 0xdde5ed, 1.2);
    dirLightBack.position.set(-2, 4, -5);
    scene.add(dirLightBack);

    // 5. Human Model Group
    const { group, parts } = createHumanMuscleModel(isDark);
    groupRef.current = group;
    partsRef.current = parts;
    scene.add(group);

    // 6. Interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (cameraRef.current && sceneRef.current) {
        const rect = container.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / container.clientWidth) * 2 - 1,
          -((e.clientY - rect.top) / container.clientHeight) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, cameraRef.current);
        const intersects = raycaster.intersectObjects(group.children, true);
        const targetPart = parts.find((p) => intersects.length > 0 && intersects[0].object === p.mesh);
        if (targetPart && targetPart.targetKey) {
          setHoveredMuscle(targetPart.targetKey);
        } else {
          setHoveredMuscle(null);
        }
      }

      if (!isDragging || !groupRef.current) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      groupRef.current.rotation.y += deltaX * 0.009;
      groupRef.current.rotation.x = Math.max(-0.35, Math.min(0.35, groupRef.current.rotation.x + deltaY * 0.005));
      previousMousePosition = { x: e.clientX, y: e.clientY };
      setViewAngle('free');
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      cameraRef.current.position.z = Math.max(3.8, Math.min(8.2, cameraRef.current.position.z + e.deltaY * 0.003));
    };

    // Mobile Touch
    let touchStartDist = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      // 페이지 스크롤/핀치줌과 제스처가 겹치지 않도록, 우리가 직접 처리하는 동안은 브라우저 기본 동작을 막는다
      if (e.touches.length === 1 || e.touches.length === 2) {
        e.preventDefault();
      }
      if (e.touches.length === 1 && isDragging && groupRef.current) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;
        groupRef.current.rotation.y += deltaX * 0.012;
        groupRef.current.rotation.x = Math.max(-0.35, Math.min(0.35, groupRef.current.rotation.x + deltaY * 0.006));
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        setViewAngle('free');
      } else if (e.touches.length === 2 && cameraRef.current) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const diff = (dist - touchStartDist) * 0.01;
        cameraRef.current.position.z = Math.max(3.8, Math.min(8.2, cameraRef.current.position.z - diff));
        touchStartDist = dist;
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
      touchStartDist = 0;
    };

    const onClick = (e: MouseEvent) => {
      if (!cameraRef.current || !onSelectMuscle) return;
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / container.clientWidth) * 2 - 1,
        -((e.clientY - rect.top) / container.clientHeight) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(group.children, true);
      const targetPart = parts.find((p) => intersects.length > 0 && intersects[0].object === p.mesh);
      if (targetPart && targetPart.targetKey) {
        onSelectMuscle(targetPart.targetKey);
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('click', onClick);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('touchcancel', onTouchEnd);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 380;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Loop
    let clock = new THREE.Clock();
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (groupRef.current && isAutoRotate) {
        groupRef.current.rotation.y += delta * 0.45;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('click', onClick);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
      renderer.dispose();
    };
  }, [isAutoRotate, onSelectMuscle, isDark]);

  // 근육 색상 실시간 업데이트 (애플 레드 #FF2D55 / 앰버 #FF9500)
  useEffect(() => {
    partsRef.current.forEach((part) => {
      if (!part.isTargetable || !part.targetKey) return;
      const mat = part.mesh.material as THREE.MeshStandardMaterial;
      if (!mat) return;

      const isFilterActive = activeMuscleFilter === part.targetKey;
      const isPrimary = primaryMuscles.includes(part.targetKey);
      const isSecondary = secondaryMuscles.includes(part.targetKey);
      const isHovered = hoveredMuscle === part.targetKey;

      if (isFilterActive || isPrimary) {
        // 애플 시그니처 레드
        mat.color.setHex(0xFF2D55);
        mat.emissive.setHex(0x770D1E);
        mat.emissiveIntensity = 0.35;
        mat.roughness = 0.25;
      } else if (isSecondary) {
        // 애플 오렌지
        mat.color.setHex(0xFF9500);
        mat.emissive.setHex(0x663300);
        mat.emissiveIntensity = 0.25;
        mat.roughness = 0.3;
      } else if (isHovered) {
        // 애플 시스템 블루
        mat.color.setHex(0x007AFF);
        mat.emissive.setHex(0x003366);
        mat.emissiveIntensity = 0.3;
      } else {
        // 비타겟 (라이트 모드는 우아한 실버 그레이, 다크 모드는 세련된 티타늄 차콜)
        mat.color.setHex(isDark ? 0x2C2C2E : 0xD1D5DB);
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
        mat.roughness = 0.45;
      }
      mat.needsUpdate = true;
    });
  }, [primaryMuscles, secondaryMuscles, activeMuscleFilter, hoveredMuscle, isDark]);

  const setCameraView = (angle: 'front' | 'back') => {
    if (!groupRef.current) return;
    setIsAutoRotate(false);
    setViewAngle(angle);
    groupRef.current.rotation.x = 0;
    groupRef.current.rotation.y = angle === 'front' ? 0 : Math.PI;
  };

  const adjustZoom = (delta: number) => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.max(3.8, Math.min(8.2, cameraRef.current.position.z + delta));
  };

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 shadow-sm"
      style={{ height }}
    >
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />

      {/* 상단 범례 & 툴팁 */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-white/80 dark:bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-black/5 dark:border-white/10 text-xs shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF2D55] shadow-sm" />
            <span className="font-semibold text-gray-800 dark:text-gray-200 text-[11px]">주동근</span>
          </div>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF9500] shadow-sm" />
            <span className="font-semibold text-gray-700 dark:text-gray-300 text-[11px]">협응근</span>
          </div>
        </div>

        {hoveredMuscle && (
          <div className="bg-white/90 dark:bg-black/75 backdrop-blur-md border border-[#007AFF]/40 px-3.5 py-1.5 rounded-full text-xs text-[#007AFF] font-bold shadow-md animate-fade-in pointer-events-auto">
            {MUSCLE_INFO_MAP[hoveredMuscle]?.nameKo || hoveredMuscle}
          </div>
        )}
      </div>

      {/* 하단 컨트롤 패널 (애플 글래스모피즘) */}
      {showControls && (
        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-auto">
          {/* 전면/후면 스냅 */}
          <div className="flex items-center gap-1 bg-white/80 dark:bg-black/60 backdrop-blur-md p-1 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm">
            <button
              onClick={() => setCameraView('front')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                viewAngle === 'front'
                  ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              전면 (Front)
            </button>
            <button
              onClick={() => setCameraView('back')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                viewAngle === 'back'
                  ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              후면 (Back)
            </button>
          </div>

          {/* 줌 & 회전 */}
          <div className="flex items-center gap-1 bg-white/80 dark:bg-black/60 backdrop-blur-md p-1 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm">
            <button
              onClick={() => adjustZoom(-0.6)}
              className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition"
              title="확대"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => adjustZoom(0.6)}
              className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition"
              title="축소"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              className={`p-1.5 rounded-xl transition ${
                isAutoRotate
                  ? 'bg-[#FF9500]/15 text-[#FF9500]'
                  : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
              }`}
              title="360도 회전"
            >
              <RotateCw size={16} className={isAutoRotate ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
