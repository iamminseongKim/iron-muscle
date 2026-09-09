import React, { useState } from 'react';
import { Sparkles, Flame } from 'lucide-react';
import { MuscleTarget } from '../../types/workout';

interface AnatomyDualViewerProps {
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  selectedMuscle?: string | null;
  onMuscleClick?: (muscleId: MuscleTarget) => void;
  showFatigueSlider?: boolean;
  isDark?: boolean;
}

export const AnatomyDualViewer: React.FC<AnatomyDualViewerProps> = ({
  primaryMuscles = [],
  secondaryMuscles = [],
  selectedMuscle = null,
  onMuscleClick,
  showFatigueSlider = true,
  isDark = true,
}) => {
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
  const [fatigueLevel, setFatigueLevel] = useState<number>(35); // 0-100%

  // Check muscle status with flexible matching
  const matchMuscle = (id: string, list: string[]) => {
    return list.some((m) => {
      if (m === id) return true;
      if (m.startsWith(id) || id.startsWith(m)) return true;
      if (id === 'erectors' && (m.includes('erector') || m.includes('back'))) return true;
      if (id.startsWith('deltoid') && (m === 'shoulders' || m === 'deltoids')) return true;
      if (id === 'chest' && m.startsWith('chest')) return true;
      return false;
    });
  };

  const isPrimary = (id: string) => matchMuscle(id, primaryMuscles);
  const isSecondary = (id: string) => matchMuscle(id, secondaryMuscles);

  const isSelected = (id: string) =>
    selectedMuscle === id ||
    (selectedMuscle && (selectedMuscle.startsWith(id) || id.startsWith(selectedMuscle)));

  const isHovered = (id: string) =>
    hoveredMuscle === id ||
    (hoveredMuscle && (hoveredMuscle.startsWith(id) || id.startsWith(hoveredMuscle)));

  // Color calculation matching vibrant aesthetics
  const getFillColor = (id: string) => {
    if (isSelected(id) || isHovered(id)) return '#30D158'; // Neon Emerald
    if (isPrimary(id)) return '#FF375F'; // Electric Crimson (Primary)
    if (isSecondary(id)) return '#FF9F0A'; // Neon Amber / Gold (Secondary)

    // Base fatigue influence
    if (fatigueLevel > 60) return isDark ? '#3A2E33' : '#E8D2D5';
    return isDark ? '#2C2C2E' : '#E5E5EA'; // Crisp clear silhouette body
  };

  const getStrokeColor = (id?: string) => {
    if (id && (isSelected(id) || isHovered(id))) return '#30D158';
    if (id && isPrimary(id)) return '#FF375F';
    if (id && isSecondary(id)) return '#FF9F0A';
    return isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.18)';
  };

  const defaultStroke = isDark ? 'rgba(255, 255, 255, 0.32)' : 'rgba(0, 0, 0, 0.18)';
  const defaultBodyColor = isDark ? '#2C2C2E' : '#E5E5EA';

  const getGlowFilter = (id: string) => {
    if (isSelected(id) || isHovered(id)) return 'drop-shadow(0 0 8px rgba(48, 209, 88, 0.9))';
    if (isPrimary(id)) return 'drop-shadow(0 0 10px rgba(255, 55, 95, 0.85))';
    if (isSecondary(id)) return 'drop-shadow(0 0 7px rgba(255, 159, 10, 0.75))';
    return 'none';
  };

  return (
    <div className={`w-full rounded-3xl p-4 transition-colors relative overflow-hidden shadow-2xl ${
      isDark ? 'bg-[#121214] text-white border border-white/10' : 'bg-white text-gray-900 border border-black/10'
    }`}>
      {/* Dynamic Background Glow Effect */}
      <div className="absolute -top-20 -left-20 w-56 h-56 bg-[#FF375F]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-[#0A84FF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info & Legend */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#FF375F] to-[#FF9F0A] flex items-center justify-center shadow-sm">
            <Sparkles size={11} className="text-white" />
          </div>
          <span className="text-xs font-bold tracking-wide">
            정밀 듀얼 해부도
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-[10px]">
          <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full bg-[#FF375F] shadow-xs" />
            주동근
          </span>
          <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full bg-[#FF9F0A] shadow-xs" />
            협응근
          </span>
          <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full bg-[#30D158] shadow-xs" />
            선택
          </span>
        </div>
      </div>

      {/* Side-by-Side Dual Silhouette Display */}
      <div className={`grid grid-cols-2 gap-2 backdrop-blur-md rounded-2xl p-2 border ${
        isDark ? 'bg-[#1C1C1E]/60 border-white/5' : 'bg-[#F2F2F7] border-black/5'
      }`}>
        {/* ================= FRONT VIEW (전면) ================= */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-gray-400 mb-1 tracking-wider uppercase">
            전면 (Front View)
          </span>
          <div className="relative w-full aspect-[1/2] max-h-[380px] flex items-center justify-center">
            <svg
              viewBox="0 0 200 420"
              className="w-full h-full filter contrast-125 drop-shadow-md"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Head & Neck */}
              <ellipse cx="100" cy="38" rx="19" ry="24" fill={defaultBodyColor} stroke={defaultStroke} strokeWidth={1} />
              <path d="M92 60 L108 60 L106 72 L94 72 Z" fill={defaultBodyColor} stroke={defaultStroke} strokeWidth={1} />

              {/* Traps (Front) */}
              <path
                d="M82 68 L92 60 L100 70 L86 78 Z"
                fill={getFillColor('traps')}
                stroke={defaultStroke}
                strokeWidth={1}
                style={{ filter: getGlowFilter('traps'), cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={() => setHoveredMuscle('traps')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onMuscleClick?.('traps')}
              />
              <path
                d="M118 68 L108 60 L100 70 L114 78 Z"
                fill={getFillColor('traps')}
                stroke={defaultStroke}
                strokeWidth={1}
                style={{ filter: getGlowFilter('traps'), cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={() => setHoveredMuscle('traps')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onMuscleClick?.('traps')}
              />

              {/* Deltoids (전면/측면 어깨) */}
              <g
                style={{ filter: getGlowFilter('deltoid_front'), cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={() => setHoveredMuscle('deltoid_front')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onMuscleClick?.('deltoid_front')}
              >
                <path
                  d="M58 76 Q72 70 76 84 Q66 104 54 94 Q50 82 58 76 Z"
                  fill={getFillColor('deltoid_front')}
                  stroke={defaultStroke}
                  strokeWidth={1.5}
                />
                <path
                  d="M142 76 Q128 70 124 84 Q134 104 146 94 Q150 82 142 76 Z"
                  fill={getFillColor('deltoid_front')}
                  stroke={defaultStroke}
                  strokeWidth={1.5}
                />
              </g>

              {/* Pectorals (대흉근) */}
              <g
                style={{ filter: getGlowFilter('chest'), cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={() => setHoveredMuscle('chest')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onMuscleClick?.('chest')}
              >
                {/* Left Chest */}
                <path
                  d="M74 80 L98 80 L98 116 Q76 122 66 104 Q64 88 74 80 Z"
                  fill={getFillColor('chest')}
                  stroke={defaultStroke}
                  strokeWidth={1.5}
                />
                {/* Right Chest */}
                <path
                  d="M126 80 L102 80 L102 116 Q124 122 134 104 Q136 88 126 80 Z"
                  fill={getFillColor('chest')}
                  stroke={defaultStroke}
                  strokeWidth={1.5}
                />
              </g>

              {/* Biceps (상완이두근) */}
              <g
                style={{ filter: getGlowFilter('biceps'), cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={() => setHoveredMuscle('biceps')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onMuscleClick?.('biceps')}
              >
                <path
                  d="M50 96 Q58 104 52 136 Q42 130 42 106 Q44 98 50 96 Z"
                  fill={getFillColor('biceps')}
                  stroke={defaultStroke}
                  strokeWidth={1.5}
                />
                <path
                  d="M150 96 Q142 104 148 136 Q158 130 158 106 Q156 98 150 96 Z"
                  fill={getFillColor('biceps')}
                  stroke={defaultStroke}
                  strokeWidth={1.5}
                />
              </g>

              {/* Forearms (전완근) */}
              <path
                d="M40 136 Q48 140 42 178 Q30 174 34 142 Z"
                fill={getFillColor('forearms')}
                stroke={defaultStroke}
                strokeWidth={1}
                style={{ filter: getGlowFilter('forearms'), cursor: 'pointer' }}
                onClick={() => onMuscleClick?.('forearms')}
              />
              <path
                d="M160 136 Q152 140 158 178 Q170 174 166 142 Z"
                fill={getFillColor('forearms')}
                stroke={defaultStroke}
                strokeWidth={1}
                style={{ filter: getGlowFilter('forearms'), cursor: 'pointer' }}
                onClick={() => onMuscleClick?.('forearms')}
              />

              {/* Abdominals (복근 6팩) */}
              <g
                style={{ filter: getGlowFilter('abs'), cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={() => setHoveredMuscle('abs')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onMuscleClick?.('abs')}
              >
                {/* Upper 2 */}
                <rect x="88" y="118" width="10" height="12" rx="2" fill={getFillColor('abs')} stroke={defaultStroke} strokeWidth={1} />
                <rect x="102" y="118" width="10" height="12" rx="2" fill={getFillColor('abs')} stroke={defaultStroke} strokeWidth={1} />
                {/* Middle 2 */}
                <rect x="87" y="132" width="11" height="13" rx="2" fill={getFillColor('abs')} stroke={defaultStroke} strokeWidth={1} />
                <rect x="102" y="132" width="11" height="13" rx="2" fill={getFillColor('abs')} stroke={defaultStroke} strokeWidth={1} />
                {/* Lower 2 */}
                <path d="M86 148 L98 148 L97 166 L88 162 Z" fill={getFillColor('abs')} stroke={defaultStroke} strokeWidth={1} />
                <path d="M102 148 L114 148 L112 162 L103 166 Z" fill={getFillColor('abs')} stroke={defaultStroke} strokeWidth={1} />
              </g>

              {/* Obliques (외복사근) */}
              <path
                d="M72 120 Q84 134 84 160 L74 166 Q66 140 72 120 Z"
                fill={getFillColor('obliques')}
                stroke={defaultStroke}
                strokeWidth={1}
                style={{ filter: getGlowFilter('obliques'), cursor: 'pointer' }}
                onClick={() => onMuscleClick?.('obliques')}
              />
              <path
                d="M128 120 Q116 134 116 160 L126 166 Q134 140 128 120 Z"
                fill={getFillColor('obliques')}
                stroke={defaultStroke}
                strokeWidth={1}
                style={{ filter: getGlowFilter('obliques'), cursor: 'pointer' }}
                onClick={() => onMuscleClick?.('obliques')}
              />

              {/* Pelvis / Hips */}
              <path d="M72 168 Q100 178 128 168 L122 194 Q100 198 78 194 Z" fill="#242426" stroke={defaultStroke} strokeWidth={1} />

              {/* Quadriceps (대퇴사두근) */}
              <g
                style={{ filter: getGlowFilter('quads'), cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={() => setHoveredMuscle('quads')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onMuscleClick?.('quads')}
              >
                {/* Left Quad */}
                <path
                  d="M66 198 Q50 240 68 285 Q88 290 92 270 Q94 220 78 196 Z"
                  fill={getFillColor('quads')}
                  stroke={defaultStroke}
                  strokeWidth={1.5}
                />
                {/* Right Quad */}
                <path
                  d="M134 198 Q150 240 132 285 Q112 290 108 270 Q106 220 122 196 Z"
                  fill={getFillColor('quads')}
                  stroke={defaultStroke}
                  strokeWidth={1.5}
                />
              </g>

              {/* Knees */}
              <circle cx="78" cy="298" r="8" fill="#3A3A3C" />
              <circle cx="122" cy="298" r="8" fill="#3A3A3C" />

              {/* Calves Front / Tibialis (종아리 전면) */}
              <g
                style={{ filter: getGlowFilter('calves'), cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={() => setHoveredMuscle('calves')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onMuscleClick?.('calves')}
              >
                <path
                  d="M68 306 Q60 340 70 380 L84 380 Q92 340 86 306 Z"
                  fill={getFillColor('calves')}
                  stroke={defaultStroke}
                  strokeWidth={1.5}
                />
                <path
                  d="M132 306 Q140 340 130 380 L116 380 Q108 340 114 306 Z"
                  fill={getFillColor('calves')}
                  stroke={defaultStroke}
                  strokeWidth={1.5}
                />
              </g>

              {/* Feet */}
              <path d="M66 382 L60 404 Q76 408 86 400 L84 382 Z" fill={defaultBodyColor} stroke={defaultStroke} strokeWidth={1} />
              <path d="M134 382 L140 404 Q124 408 114 400 L116 382 Z" fill={defaultBodyColor} stroke={defaultStroke} strokeWidth={1} />
            </svg>
          </div>
        </div>

        {/* ================= BACK VIEW (후면) ================= */}
        <div className="flex flex-col items-center border-l border-white/10 pl-4">
          <span className="text-xs font-semibold text-gray-400 mb-1 tracking-wider uppercase">
            후면 (Back View)
          </span>
          <div className="relative w-full aspect-[1/2] max-h-[380px] flex items-center justify-center">
            <svg
              viewBox="0 0 200 420"
              className="w-full h-full filter contrast-125 drop-shadow-md"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Head Back */}
              <ellipse cx="100" cy="38" rx="19" ry="24" fill={defaultBodyColor} stroke={defaultStroke} strokeWidth={1} />

              {/* Trapezius (승모근 상부, 중부, 하부 다이아몬드) */}
              <path
                d="M100 56 L124 74 L100 130 L76 74 Z"
                fill={getFillColor('traps')}
                stroke={defaultStroke}
                strokeWidth={1.5}
                style={{ filter: getGlowFilter('traps'), cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={() => setHoveredMuscle('traps')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onMuscleClick?.('traps')}
              />

              {/* Deltoids Rear (후면 삼각근) */}
              <g
                style={{ filter: getGlowFilter('deltoid_rear'), cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={() => setHoveredMuscle('deltoid_rear')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onMuscleClick?.('deltoid_rear')}
              >
                <path
                  d="M56 78 Q74 74 72 96 Q56 108 48 92 Z"
                  fill={getFillColor('deltoid_rear')}
                  stroke={defaultStroke}
                  strokeWidth={1.5}
                />
                <path
                  d="M144 78 Q126 74 128 96 Q144 108 152 92 Z"
                  fill={getFillColor('deltoid_rear')}
                  stroke={defaultStroke}
                  strokeWidth={1.5}
                />
              </g>

              {/* Triceps (상완삼두근 장두 & 외측두) */}
              <g
                style={{ filter: getGlowFilter('triceps'), cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={() => setHoveredMuscle('triceps')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onMuscleClick?.('triceps')}
              >
                <path
                  d="M46 94 Q54 104 48 134 Q36 130 38 106 Z"
                  fill={getFillColor('triceps')}
                  stroke={defaultStroke}
                  strokeWidth={1.5}
                />
                <path
                  d="M154 94 Q146 104 152 134 Q164 130 162 106 Z"
                  fill={getFillColor('triceps')}
                  stroke={defaultStroke}
                  strokeWidth={1.5}
                />
              </g>

              {/* Forearms Back */}
              <path
                d="M36 134 Q46 138 40 178 Q28 174 32 140 Z"
                fill={getFillColor('forearms')}
                stroke={defaultStroke}
                strokeWidth={1}
                style={{ filter: getGlowFilter('forearms'), cursor: 'pointer' }}
                onClick={() => onMuscleClick?.('forearms')}
              />
              <path
                d="M164 134 Q154 138 160 178 Q172 174 168 140 Z"
                fill={getFillColor('forearms')}
                stroke={defaultStroke}
                strokeWidth={1}
                style={{ filter: getGlowFilter('forearms'), cursor: 'pointer' }}
                onClick={() => onMuscleClick?.('forearms')}
              />

              {/* Latissimus Dorsi (광배근 V-Taper) */}
              <g
                style={{ filter: getGlowFilter('lats'), cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={() => setHoveredMuscle('lats')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onMuscleClick?.('lats')}
              >
                <path
                  d="M74 94 Q100 120 100 155 Q80 172 70 166 Q58 136 64 100 Z"
                  fill={getFillColor('lats')}
                  stroke={defaultStroke}
                  strokeWidth={1.5}
                />
                <path
                  d="M126 94 Q100 120 100 155 Q120 172 130 166 Q142 136 136 100 Z"
                  fill={getFillColor('lats')}
                  stroke={defaultStroke}
                  strokeWidth={1.5}
                />
              </g>

              {/* Erector Spinae (척추기립근 하부) */}
              <path
                d="M93 145 L107 145 L106 182 L94 182 Z"
                fill={getFillColor('erectors')}
                stroke={defaultStroke}
                strokeWidth={1}
                style={{ filter: getGlowFilter('erectors'), cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={() => setHoveredMuscle('erectors')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onMuscleClick?.('erectors')}
              />

              {/* Glutes (둔근 / 엉덩이) */}
              <g
                style={{ filter: getGlowFilter('glutes'), cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={() => setHoveredMuscle('glutes')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onMuscleClick?.('glutes')}
              >
                <path
                  d="M66 182 Q100 180 100 216 Q72 232 64 212 Q60 196 66 182 Z"
                  fill={getFillColor('glutes')}
                  stroke={defaultStroke}
                  strokeWidth={1.5}
                />
                <path
                  d="M134 182 Q100 180 100 216 Q128 232 136 212 Q140 196 134 182 Z"
                  fill={getFillColor('glutes')}
                  stroke={defaultStroke}
                  strokeWidth={1.5}
                />
              </g>

              {/* Hamstrings (햄스트링) */}
              <g
                style={{ filter: getGlowFilter('hamstrings'), cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={() => setHoveredMuscle('hamstrings')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onMuscleClick?.('hamstrings')}
              >
                <path
                  d="M66 220 Q96 226 94 286 Q82 290 68 286 Q54 250 66 220 Z"
                  fill={getFillColor('hamstrings')}
                  stroke={defaultStroke}
                  strokeWidth={1.5}
                />
                <path
                  d="M134 220 Q104 226 106 286 Q118 290 132 286 Q146 250 134 220 Z"
                  fill={getFillColor('hamstrings')}
                  stroke={defaultStroke}
                  strokeWidth={1.5}
                />
              </g>

              {/* Calves Back (비복근 하트 모양) */}
              <g
                style={{ filter: getGlowFilter('calves'), cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={() => setHoveredMuscle('calves')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onMuscleClick?.('calves')}
              >
                <path
                  d="M66 298 Q52 325 64 360 Q76 376 80 376 Q90 340 88 298 Z"
                  fill={getFillColor('calves')}
                  stroke={defaultStroke}
                  strokeWidth={1.5}
                />
                <path
                  d="M134 298 Q148 325 136 360 Q124 376 120 376 Q110 340 112 298 Z"
                  fill={getFillColor('calves')}
                  stroke={defaultStroke}
                  strokeWidth={1.5}
                />
              </g>

              {/* Feet Back */}
              <path d="M68 382 L64 402 Q78 406 86 398 L84 382 Z" fill={defaultBodyColor} stroke={defaultStroke} strokeWidth={1} />
              <path d="M132 382 L136 402 Q122 406 114 398 L116 382 Z" fill={defaultBodyColor} stroke={defaultStroke} strokeWidth={1} />
            </svg>
          </div>
        </div>
      </div>

      {/* Fatigue Slider (Matching user reference screenshot) */}
      {showFatigueSlider && (
        <div className="mt-2 pt-3 border-t border-white/10">
          <div className="flex justify-between items-center text-xs mb-1.5 text-gray-400">
            <span className="font-medium text-gray-300 flex items-center gap-1.5">
              <Flame size={13} className="text-[#FF9F0A]" />
              신체 피로도 시뮬레이션 (피로 누적도)
            </span>
            <span className="font-bold text-[#FF375F] font-mono">{fatigueLevel}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={fatigueLevel}
            onChange={(e) => setFatigueLevel(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#FF375F]"
          />
        </div>
      )}
    </div>
  );
};
