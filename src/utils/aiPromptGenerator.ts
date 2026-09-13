import { WorkoutSession, WorkoutExercise } from '../types/workout';
import { resolveRecordedExercise } from './exerciseResolver';
import { calculateSessionVolume, calculateSessionReps, calculateAverageRPE } from './calculations';

export type AiExportScope = 'day' | 'week' | 'month' | 'custom' | 'all';

export type TargetBodyPart =
  | 'all'
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'arms'
  | 'core';

export interface AiExportOptions {
  scope: AiExportScope;
  selectedDate: string; // YYYY-MM-DD
  customStartDate?: string; // YYYY-MM-DD
  customEndDate?: string; // YYYY-MM-DD
  selectedBodyPart?: TargetBodyPart; // 운동 부위 ('all' | 'chest' | 'back' | 'legs' | 'shoulders' | 'biceps' | 'triceps' | 'arms' | 'core')
}

export const BODY_PART_OPTIONS: Array<{
  id: TargetBodyPart;
  label: string;
  icon: string;
}> = [
  { id: 'all', label: '전체 부위 종합 분석', icon: '🌐' },
  { id: 'chest', label: '가슴 (Chest)', icon: '🛡️' },
  { id: 'back', label: '등 (Back)', icon: '🦅' },
  { id: 'legs', label: '하체 (Legs)', icon: '🦵' },
  { id: 'shoulders', label: '어깨 (Shoulders)', icon: '🥥' },
  { id: 'biceps', label: '이두근 (Biceps)', icon: '💪' },
  { id: 'triceps', label: '삼두근 (Triceps)', icon: '⚡' },
  { id: 'arms', label: '팔 전체 (Arms)', icon: '🦾' },
  { id: 'core', label: '복근/코어 (Core)', icon: '🧱' },
];

/**
 * 특정 운동 종목이 대상 운동 부위(TargetBodyPart)에 속하는지 판별합니다.
 */
export function matchesBodyPart(ex: WorkoutExercise, bodyPart: TargetBodyPart): boolean {
  if (bodyPart === 'all') return true;

  const base = resolveRecordedExercise(ex);
  const name = (ex.exerciseName || base.name || '').toLowerCase();
  const cat = base.category;
  const cats = base.categories || [];
  const primary = base.primaryMuscles || [];

  if (bodyPart === 'chest') {
    return (
      cat === 'chest' ||
      cats.includes('chest') ||
      primary.some((m) => m === 'chest' || m === 'chest_upper') ||
      name.includes('가슴') ||
      name.includes('체스트') ||
      name.includes('벤치') ||
      name.includes('딥스')
    );
  }

  if (bodyPart === 'back') {
    return (
      cat === 'back' ||
      cats.includes('back') ||
      primary.some((m) => ['lats', 'traps', 'erectors'].includes(m)) ||
      name.includes('등') ||
      name.includes('랫풀') ||
      name.includes('풀다운') ||
      name.includes('로우') ||
      name.includes('풀업') ||
      name.includes('친업') ||
      name.includes('데드리프트')
    );
  }

  if (bodyPart === 'legs') {
    return (
      cat === 'legs' ||
      cats.includes('legs') ||
      primary.some((m) => ['quads', 'hamstrings', 'glutes', 'calves'].includes(m)) ||
      name.includes('하체') ||
      name.includes('스쿼트') ||
      name.includes('레그') ||
      name.includes('런지') ||
      name.includes('카프')
    );
  }

  if (bodyPart === 'shoulders') {
    return (
      cat === 'shoulders' ||
      cats.includes('shoulders') ||
      primary.some((m) => m.startsWith('deltoid')) ||
      name.includes('어깨') ||
      name.includes('숄더') ||
      name.includes('사레레') ||
      name.includes('오버헤드') ||
      name.includes('밀리터리') ||
      name.includes('페이스풀')
    );
  }

  if (bodyPart === 'biceps') {
    return (
      primary.includes('biceps') ||
      name.includes('이두') ||
      name.includes('바이셉') ||
      name.includes('암 컬') ||
      name.includes('암컬') ||
      (cat === 'arms' && (name.includes('컬') || name.includes('curl')))
    );
  }

  if (bodyPart === 'triceps') {
    return (
      primary.includes('triceps') ||
      name.includes('삼두') ||
      name.includes('트라이셉') ||
      name.includes('라트익') ||
      (cat === 'arms' && (name.includes('푸시다운') || name.includes('익스텐션') || name.includes('클로즈그립')))
    );
  }

  if (bodyPart === 'arms') {
    return (
      cat === 'arms' ||
      cats.includes('arms') ||
      primary.some((m) => ['biceps', 'triceps', 'forearms'].includes(m)) ||
      name.includes('팔') ||
      name.includes('이두') ||
      name.includes('삼두') ||
      name.includes('컬') ||
      name.includes('푸시다운')
    );
  }

  if (bodyPart === 'core') {
    return (
      cat === 'core' ||
      cats.includes('core') ||
      primary.some((m) => ['abs', 'obliques'].includes(m)) ||
      name.includes('복근') ||
      name.includes('코어') ||
      name.includes('크런치') ||
      name.includes('레그레이즈') ||
      name.includes('플랭크')
    );
  }

  return false;
}

/**
 * 주어진 기간(날짜) 및 선택한 운동 부위에 해당하는 세션/운동들을 필터링합니다.
 */
export function filterSessionsForAiExport(
  sessions: WorkoutSession[],
  options: AiExportOptions
): WorkoutSession[] {
  const { scope, selectedDate, customStartDate, customEndDate, selectedBodyPart = 'all' } = options;

  let dateFiltered: WorkoutSession[] = [];

  if (scope === 'day') {
    dateFiltered = sessions.filter((s) => s.date === selectedDate);
  } else if (scope === 'week') {
    // selectedDate 기준 직전 7일
    const end = new Date(selectedDate);
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - 6);
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    dateFiltered = sessions.filter((s) => s.date >= startStr && s.date <= endStr);
  } else if (scope === 'month') {
    const monthPrefix = selectedDate.slice(0, 7); // YYYY-MM
    dateFiltered = sessions.filter((s) => s.date.startsWith(monthPrefix));
  } else if (scope === 'custom') {
    const startStr = customStartDate || selectedDate;
    const endStr = customEndDate || selectedDate;
    dateFiltered = sessions.filter((s) => s.date >= startStr && s.date <= endStr);
  } else {
    // 'all'
    dateFiltered = [...sessions];
  }

  // 날짜 내림차순 정렬 (최신순)
  dateFiltered.sort((a, b) => b.date.localeCompare(a.date));

  // 특정 부위만 필터링하는 경우
  if (selectedBodyPart && selectedBodyPart !== 'all') {
    return dateFiltered
      .map((session) => {
        const matchingExercises = (session.exercises || []).filter((ex) =>
          matchesBodyPart(ex, selectedBodyPart)
        );
        if (matchingExercises.length === 0) return null;
        return {
          ...session,
          exercises: matchingExercises,
        };
      })
      .filter((s): s is WorkoutSession => s !== null);
  }

  return dateFiltered;
}

/**
 * 기간 내 각 운동 부위별 세션 수와 세트 수를 집계합니다 (드롭다운 칩용)
 */
export function extractAvailableBodyParts(sessions: WorkoutSession[]): Array<{
  id: TargetBodyPart;
  label: string;
  icon: string;
  sessionCount: number;
  totalSets: number;
}> {
  return BODY_PART_OPTIONS.map((opt) => {
    if (opt.id === 'all') {
      const totalSets = sessions.reduce(
        (sum, s) => sum + (s.exercises || []).reduce((acc, e) => acc + (e.sets?.length || 0), 0),
        0
      );
      return { ...opt, sessionCount: sessions.length, totalSets };
    }

    let sessionCount = 0;
    let totalSets = 0;

    for (const s of sessions) {
      let hasMatchingInSession = false;
      for (const ex of s.exercises || []) {
        if (matchesBodyPart(ex, opt.id)) {
          hasMatchingInSession = true;
          totalSets += ex.sets?.length || 0;
        }
      }
      if (hasMatchingInSession) sessionCount++;
    }

    return { ...opt, sessionCount, totalSets };
  });
}

/**
 * 기간과 운동 부위에 따라 완전히 차별화된 맞춤형 AI 코칭 마크다운을 생성합니다.
 */
export function generateAiCoachingMarkdown(
  targetSessions: WorkoutSession[],
  options: AiExportOptions
): string {
  const { scope, selectedBodyPart = 'all' } = options;

  if (targetSessions.length === 0) {
    const partName = BODY_PART_OPTIONS.find((b) => b.id === selectedBodyPart)?.label || '해당 부위';
    return `# 🏋️‍♂️ [Iron Muscle Tracker] 운동 기록 없음\n선택한 기간에 [${partName}] 운동 기록이 없습니다. 기간이나 부위를 변경해 보세요.`;
  }

  const totalVol = targetSessions.reduce((sum, s) => sum + calculateSessionVolume(s), 0);
  const totalReps = targetSessions.reduce((sum, s) => sum + calculateSessionReps(s), 0);
  const totalSets = targetSessions.reduce(
    (sum, s) => sum + (s.exercises || []).reduce((acc, e) => acc + (e.sets?.length || 0), 0),
    0
  );

  const dates = targetSessions.map((s) => s.date).sort();
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  const currentPart = BODY_PART_OPTIONS.find((b) => b.id === selectedBodyPart)!;
  const isPartSpecific = selectedBodyPart !== 'all';

  let md = `# 🏋️‍♂️ [Iron Muscle Tracker] AI 전문 코칭 일지\n\n`;

  // 분석 모드 표기
  if (isPartSpecific) {
    md += `> **분석 모드**: ${currentPart.icon} **[${currentPart.label}] 부위 집중 분석**\n`;
  } else if (scope === 'day') {
    md += `> **분석 모드**: 📅 **당일(1일) 세션 피로도 및 회복 집중 피드백**\n`;
  } else if (scope === 'week') {
    md += `> **분석 모드**: 📊 **주간(최근 7일) 분할 빈도 및 볼륨 밸런스 점검**\n`;
  } else if (scope === 'month') {
    md += `> **분석 모드**: 📈 **월간(1개월) 점진적 과부하 및 1RM 성장 추이**\n`;
  } else {
    md += `> **분석 모드**: 🏆 **장기 주기화(Periodization) 및 정체기 돌파 종합 분석**\n`;
  }

  md += `> **분석 기간**: ${startDate === endDate ? startDate : `${startDate} ~ ${endDate}`} (총 ${targetSessions.length}회 세션 / ${totalSets}세트)\n`;
  md += `> **누적 볼륨**: ${totalVol.toLocaleString()} kg | **총 반복수**: ${totalReps.toLocaleString()} 회\n\n`;

  md += `### ⚠️ 중량 기록 및 장비별 측정 원칙 (AI 코치 필수 준수)\n`;
  md += `1. **덤벨(Dumbbell) 운동**: 기록된 무게는 **한쪽(편측, Per-Hand) 무게**입니다. (예: 덤벨 프레스 20kg은 양손 총 40kg 부하를 다룬 것임).\n`;
  md += `2. **스미스머신(Smith Machine) 운동**: 머신 자체 봉 무게를 **제외한 순수 추가 원판(Plate) 무게만 기록**된 값입니다.\n\n`;
  md += `---\n\n`;

  // 세션별 운동 표
  targetSessions.forEach((s, sIdx) => {
    const vol = calculateSessionVolume(s);
    const avgRpe = calculateAverageRPE(s);
    const durMins = Math.round(s.durationSeconds / 60);

    md += `## 📅 세션 ${sIdx + 1}: ${s.date} (${s.title || '오늘의 운동'})\n`;
    md += `- **소요 시간**: ${durMins}분 | **컨디션**: ${s.conditionEmoji || '💪'} | **볼륨**: ${vol.toLocaleString()}kg | **평균 RPE**: ${avgRpe || '-'}\n`;
    if (s.isDeload) md += `- **특이사항**: 🔄 디로딩(Deload) 세션\n`;
    if (s.notes) md += `- **세션 메모**: "${s.notes}"\n`;
    md += `\n`;

    s.exercises.forEach((ex, eIdx) => {
      const base = resolveRecordedExercise(ex);
      const name = ex.exerciseName || base.name;
      const loadLabel = ex.loadType === 'plate-loaded' ? '플레이트(원판)' : ex.loadType === 'pin-loaded' ? '핀머신' : ex.equipmentType;
      const modeLabel = ex.executionMode === 'unilateral' ? '원암(편측)' : '투암(양측)';
      const groupLabel = ex.groupLabel ? ` [${ex.groupLabel}]` : '';

      const isDumbbell = ex.equipmentType === 'dumbbell' || base?.equipment === 'dumbbell' || name.includes('덤벨');
      const isSmith = (ex.equipmentType === 'machine' || base?.equipment === 'machine') && (name.includes('스미스') || base?.nameEn.toLowerCase().includes('smith'));
      const weightStandardNote = isDumbbell ? ' [💡 한쪽 무게 기준]' : isSmith ? ' [💡 봉 제외 원판만]' : '';

      md += `### ${eIdx + 1}. ${name}${groupLabel}${weightStandardNote} (${loadLabel} / ${modeLabel})\n`;
      if (ex.machineBrand) md += `- **기구 브랜드**: ${ex.machineBrand}${ex.machineSetting ? ` (세팅: ${ex.machineSetting})` : ''}\n`;

      const exUnit = ex.weightUnit || 'kg';
      md += `| 세트 | 중량(${exUnit}) | 횟수 | 1RM 추정 | RPE | 템포 | 휴식시간 | 편측 | 메모/태그 |\n`;
      md += `|---|---|---|---|---|---|---|---|---|\n`;

      ex.sets.forEach((set) => {
        const e1rm = Math.round(set.weight * (1 + set.reps / 30));
        const tempoStr = set.tempo ? `${set.tempo.eccentric}-${set.tempo.pause}-${set.tempo.concentric}s` : '-';
        const restStr = set.restSeconds ? `${set.restSeconds}초` : '-';
        const sideStr = set.side === 'left' ? '좌(L)' : set.side === 'right' ? '우(R)' : set.side === 'both' ? '양쪽' : '-';
        const tagsStr = [...(set.tags || []), set.comment].filter(Boolean).join(', ') || '-';

        md += `| #${set.setNumber} | ${set.weight}${exUnit} | ${set.reps}회 | ${e1rm}${exUnit} | ${set.rpe || '-'} | ${tempoStr} | ${restStr} | ${sideStr} | ${tagsStr} |\n`;
      });
      md += `\n`;
    });
    md += `---\n\n`;
  });

  // ============================================================
  // 🤖 상황별 맞춤형 AI 코칭 프롬프트 가이드 생성
  // ============================================================
  md += `## 🤖 AI 코치 분석 및 피드백 요청 (상황별 맞춤 프롬프트)\n`;

  if (selectedBodyPart === 'chest') {
    // 🛡️ 가슴 특화 프롬프트
    md += `위의 **[가슴(Chest)]** 훈련 일지(총 ${targetSessions.length}회 세션, ${totalSets}세트)를 바탕으로 전문 보디빌딩 코치 관점에서 다음 4가지 핵심 질문에 대해 심층 피드백을 처방해 주세요:\n\n`;
    md += `1. **대흉근 상부/중부/하부 각도 밸런스**: 인클라인 프레스(상부), 플랫 프레스(중부), 딥스/플라이(하부 및 고립)의 세트 비율이 윗가슴 채우기와 가슴 전체 볼륨에 최적으로 분배되었는가?\n`;
    md += `2. **프레스 중량 및 점진적 과부하 달성도**: 덤벨(한쪽 기준)과 바벨/머신 프레스의 1RM 추정치와 최고 작업 중량이 우상향하고 있는가? 정체 원인(삼두/어깨 개입 과다 여부 등)을 진단해 주세요.\n`;
    md += `3. **이완 템포(신장성 수축)와 휴식 시간 평가**: 가슴 근육 최대 이완(Stretch) 구간에서의 템포(초)와 세트 간 쉰 시간이 가슴 근비대에 부합했는가?\n`;
    md += `4. **가슴 집중 보완을 위한 4주 증량 프로그램 처방**: 다음 4주간 주차별 목표 중량(kg)과 권장 세트/반복수(Reps), 추천 보조 종목을 표 형태로 처방해 주세요.\n`;
  } else if (selectedBodyPart === 'back') {
    // 🦅 등 특화 프롬프트
    md += `위의 **[등(Back)]** 훈련 일지(총 ${targetSessions.length}회 세션, ${totalSets}세트)를 바탕으로 전문 코치 관점에서 다음 4가지 핵심 질문에 대해 정밀하게 조언해 주세요:\n\n`;
    md += `1. **등 너비(광배) vs 두께(승모/능형근) 밸런스**: 수직 당기기(랫풀다운/풀업)와 수평 로우(바벨로우/시티드로우)의 세트 비율이 프레임 확장과 입체감에 균형 잡혀 있는가?\n`;
    md += `2. **이두근 개입 최소화 및 등 타깃도**: 기록된 중량과 횟수, 템포를 볼 때 등 근육으로 온전히 무게를 받쳐 당기고 있는가? 악력/전완 피로를 줄이기 위한 스트랩 및 그립 권장사항은?\n`;
    md += `3. **척추기립근 및 허리 피로도 관리**: 데드리프트나 로우 계열 수행 시 기립근과 코어 피로 누적이 과도하지 않은가?\n`;
    md += `4. **넓고 입체감 있는 등을 위한 4주 루틴 처방**: 다음 4주 동안 시도해야 할 메인 풀 종목의 목표 중량과 추천 보조 종목을 구체적으로 처방해 주세요.\n`;
  } else if (selectedBodyPart === 'legs') {
    // 🦵 하체 특화 프롬프트
    md += `위의 **[하체(Legs)]** 훈련 일지(총 ${targetSessions.length}회 세션, ${totalSets}세트)를 바탕으로 스트렝스/보디빌딩 코치 관점에서 다음 4가지 질문에 답변해 주세요:\n\n`;
    md += `1. **전면(대퇴사두) vs 후면(햄스트링/둔근) 밸런스**: 스쿼트/레그프레스/익스텐션과 힌지(데드리프트)/레그컬의 비율이 무릎 안정성과 하체 균형에 최적인가?\n`;
    md += `2. **하체 다관절 고중량의 신경계(CNS) 피로도**: 고중량 세트에서의 RPE와 세트 간 휴식 시간(충분한 2~3분 휴식 여부)이 파워와 근비대에 적합했는가?\n`;
    md += `3. **관절 안정성 및 템포 평가**: 스쿼트 등 하강 구간에서의 템포(통제된 네거티브)와 부상 방지 팁.\n`;
    md += `4. **하체 스트렝스 & 볼륨 증진을 위한 4주 주기화 프로그램**: 다음 4주간 스쿼트/레그프레스 목표 중량과 추천 세트 수를 처방해 주세요.\n`;
  } else if (selectedBodyPart === 'shoulders') {
    // 🥥 어깨 특화 프롬프트
    md += `위의 **[어깨(Shoulders)]** 훈련 일지(총 ${targetSessions.length}회 세션, ${totalSets}세트)를 바탕으로 전문 코치 관점에서 다음 4가지 질문에 피드백을 주세요:\n\n`;
    md += `1. **전면 / 측면 / 후면 삼각근의 3D 입체 밸런스**: 오버헤드 프레스(전면), 사레레(측면), 페이스풀/리어델트(후면)의 세트 구성이 대포알 어깨 형성에 균형 잡혀 있는가?\n`;
    md += `2. **승모근 개입 방지 및 어깨 관절 충돌 예방**: 중량이 과도하여 승모근으로 보상 동작이 일어나지 않았는가? 견갑대 통제 조언.\n`;
    md += `3. **측면/후면 고립 볼륨과 반복수**: 레이즈 계열에서의 고반복(12~20회) 및 RPE 자극 효율성 평가.\n`;
    md += `4. **어깨 프레임 확장을 위한 4주 집중 루틴 및 타겟 중량 처방**.\n`;
  } else if (selectedBodyPart === 'biceps' || selectedBodyPart === 'triceps' || selectedBodyPart === 'arms') {
    // 💪 팔 특화 프롬프트
    const armName = selectedBodyPart === 'biceps' ? '이두근' : selectedBodyPart === 'triceps' ? '삼두근' : '팔 전체(이두/삼두)';
    md += `위의 **[${armName}]** 훈련 일지(총 ${targetSessions.length}회 세션, ${totalSets}세트)를 바탕으로 전문 코치 관점에서 다음 4가지 질문에 답변해 주세요:\n\n`;
    md += `1. **${armName} 집중 타깃과 볼륨 적정성**: 주동근에 충분한 고립 자극이 전달되었는가? 복합 다관절 운동(가슴/등) 후 수행된 팔 볼륨이 과도하거나 부족하지 않은가?\n`;
    md += `2. **이완/수축 템포 및 최고 수축(Peak Contraction) 평가**: 컬 및 익스텐션/푸시다운 시 반동 없는 통제와 템포가 유지되었는가?\n`;
    md += `3. **팔꿈치/손목 관절 부담 관리**: 과도한 중량으로 인한 엘보우 통증 예방 팁과 그립 권장사항.\n`;
    md += `4. **팔 둘레 1인치 성장을 위한 4주 슈퍼세트/드롭세트 집중 루틴 처방**.\n`;
  } else if (selectedBodyPart === 'core') {
    // 🧱 복근/코어 특화 프롬프트
    md += `위의 **[복근/코어(Core)]** 훈련 일지를 바탕으로 다음 4가지 질문에 피드백을 주세요:\n\n`;
    md += `1. **복직근 상/하부 및 외복사근 밸런스**: 굴곡(크런치)과 하체 거상(레그레이즈), 비틀기 운동의 비율 평가.\n`;
    md += `2. **복압 및 코어 안정성**: 고중량 메인 리프트 시 척추를 보호할 수 있는 브레이싱(Bracing) 능력 연계 조언.\n`;
    md += `3. **반복수 및 점진적 부하**: 맨몸 반복수와 중량 추가 코어 운동의 조화.\n`;
    md += `4. **선명한 복근 완성을 위한 4주 코어 트레이닝 가이드**.\n`;
  } else {
    // 🌐 전체 부위 종합 분석 (기간 scope에 따른 세분화)
    if (scope === 'day') {
      // 📅 당일(1일) 집중 피드백
      md += `오늘(${startDate}) 하루 수행한 운동 일지를 바탕으로 전문 코치 관점에서 다음 4가지 핵심 질문에 대해 피드백을 주세요:\n\n`;
      md += `1. **오늘 세션 강도 및 RPE 적절성**: 세트 후반부 RPE와 실패 지점 도달 빈도를 볼 때 오늘 운동 강도가 적절했는가? 오버트레이닝이나 자극 부족은 없었는가?\n`;
      md += `2. **세트 간 휴식 시간 및 템포 평가**: 기록된 실제 휴식 시간(초)과 템포가 다관절 복합운동과 고립운동 특성에 부합했는가?\n`;
      md += `3. **종목 배치 순서 및 구성 피드백**: 선피로, 메인 리프트, 마무리 고립운동의 배치 순서와 효율성에 대한 코칭 조언을 주세요.\n`;
      md += `4. **내일/다음 세션을 위한 회복 및 식단 가이드**: 오늘 소모된 피로도를 감안하여 오늘 밤 영양 보충과 다음 분할 훈련 시 유의점을 처방해 주세요.\n`;
    } else if (scope === 'week') {
      // 📊 주간(최근 7일) 분할 밸런스 분석
      md += `최근 1주일간(${startDate} ~ ${endDate}) 수행한 주간 훈련 데이터를 바탕으로 다음 4가지 사항을 종합 평가해 주세요:\n\n`;
      md += `1. **주간 부위별 분할 빈도 및 볼륨 밸런스**: 가슴, 등, 하체, 어깨, 팔 등 각 부위의 주당 세트 수와 빈도가 균형 잡혀 있는가? 특정 부위 과소/과대 훈련이 있는가?\n`;
      md += `2. **주간 피로 누적도 및 회복 적정성**: 주간 총 볼륨(${totalVol.toLocaleString()}kg)과 세션별 평균 RPE를 볼 때 초과회복(Supercompensation) 주기가 적절한가?\n`;
      md += `3. **움직임 패턴(Movement Plane) 다양성**: 수직 당기기, 수평 로우, 프레스, 힌지, 스쿼트 등 핵심 기능적 움직임이 고르게 수행되었는가?\n`;
      md += `4. **다음 주차 점진적 과부하 목표**: 다음 주에 중량이나 세트를 올려야 할 핵심 종목과 볼륨을 유지해야 할 종목을 나누어 처방해 주세요.\n`;
    } else {
      // 📈 월간 / 장기 종합 주기화 분석
      md += `${startDate} ~ ${endDate} 기간 동안의 장기 트레이닝 기록을 바탕으로 다음 4가지 핵심 질문에 대해 심층 분석해 주세요:\n\n`;
      md += `1. **점진적 과부하(Progressive Overload) 장기 달성도**: 주요 리프트 종목들의 1RM 추정치와 실질 작업 부하가 꾸준한 우상향 곡선을 그렸는가?\n`;
      md += `2. **플래토(정체기) 진단 및 원인 규명**: 무게나 반복수가 수주간 멈춰 있는 정체 종목이 있는가? 원인이 신경계 피로, 볼륨 부족, 휴식 시간 문제 중 무엇인가?\n`;
      md += `3. **디로딩(Deload) 필요 시점 판정**: 장기 누적 볼륨(${totalVol.toLocaleString()}kg)과 RPE 추이를 볼 때 지금 디로딩이 필요한지 진단해 주세요.\n`;
      md += `4. **다음 달 주기화(Periodization) 블록 처방**: 다음 달을 위한 구체적인 주기화(근비대 블록 vs 스트렝스 블록) 방향과 목표 중량을 제시해 주세요.\n`;
    }
  }

  return md;
}
