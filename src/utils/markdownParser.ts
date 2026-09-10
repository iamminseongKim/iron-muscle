import { Exercise, WorkoutSession, WorkoutExercise, WorkoutSet, EquipmentType, LoadType, ExecutionMode } from '../types/workout';
import { EXERCISES_DATABASE } from '../data/exercises';
import { WorkoutBackup } from './backup';

export function isMarkdownWorkout(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  return /#\s*🏋️|##\s*📅\s*세션|\|\s*세트\s*\|/i.test(text);
}

function extractTrailingParens(str: string): { base: string; trailing: string | null } {
  str = str.trim();
  if (!str.endsWith(')')) return { base: str, trailing: null };
  let depth = 0;
  for (let i = str.length - 1; i >= 0; i--) {
    if (str[i] === ')') depth++;
    else if (str[i] === '(') {
      depth--;
      if (depth === 0) {
        return {
          base: str.slice(0, i).trim(),
          trailing: str.slice(i + 1, str.length - 1).trim(),
        };
      }
    }
  }
  return { base: str, trailing: null };
}

function findMatchingExercise(cleanName: string, comments: string[]): Exercise | null {
  // 1. 세트 메모에서 종목 교정 힌트(예: "브이스쿼트임", "바이킹 프레스임", "스탠딩 레터럴 레이즈 머신임") 우선 검사
  const combinedComments = comments.filter(Boolean).join(' ');
  if (combinedComments) {
    for (const ex of EXERCISES_DATABASE) {
      if (ex.aliases?.some(a => a.length >= 2 && combinedComments.toLowerCase().includes(a.toLowerCase()))) {
        return ex;
      }
      if (combinedComments.includes(ex.name)) {
        return ex;
      }
    }
  }

  // 2. 정확한 이름 일치
  const exact = EXERCISES_DATABASE.find(e => e.name === cleanName);
  if (exact) return exact;

  // 3. 괄호 제거 후 기본 이름 일치 (예: "머신 힙 어덕션 (내전근)" -> "머신 힙 어덕션")
  const baseName = cleanName.replace(/\s*\(.*?\)\s*/g, ' ').trim();
  const baseMatch = EXERCISES_DATABASE.find(e => e.name.replace(/\s*\(.*?\)\s*/g, ' ').trim() === baseName);
  if (baseMatch) return baseMatch;

  // 4. 별칭(alias) 일치
  const aliasMatch = EXERCISES_DATABASE.find(e =>
    e.aliases?.some(a => a.toLowerCase() === baseName.toLowerCase() || a.toLowerCase() === cleanName.toLowerCase() || baseName.toLowerCase().includes(a.toLowerCase()))
  );
  if (aliasMatch) return aliasMatch;

  // 5. 부분 포함 검색
  const partialMatch = EXERCISES_DATABASE.find(e =>
    e.name.includes(baseName) || baseName.includes(e.name)
  );
  if (partialMatch) return partialMatch;

  return null;
}

export function parseMarkdownWorkout(raw: string): WorkoutBackup {
  if (!raw || typeof raw !== 'string') throw new Error('마크다운 텍스트가 비어 있습니다.');
  if (raw.length > 10_000_000) throw new Error('마크다운 파일은 10MB 이하만 지원합니다.');

  // 세션 단위 분할: "## 📅 세션" 기준으로 분할
  const sessionChunks = raw.split(/(?=##\s*📅\s*세션)/g).filter(c => /##\s*📅\s*세션/.test(c));
  if (sessionChunks.length === 0) {
    throw new Error('마크다운에서 운동 세션을 찾을 수 없습니다. ("## 📅 세션" 형식을 확인하세요.)');
  }

  const sessions: WorkoutSession[] = [];
  const customExercises: Exercise[] = [];

  sessionChunks.forEach((chunk, sIdx) => {
    // 1. 세션 헤더 파싱
    // ## 📅 세션 1: 2026-09-09 (하체 루틴)
    const headerMatch = chunk.match(/##\s*📅\s*세션\s*\d*[:\s]*([0-9]{4}-[0-9]{2}-[0-9]{2})(?:\s*\((.*?)\))?/);
    if (!headerMatch) return;

    const date = headerMatch[1];
    const title = headerMatch[2]?.trim() || '오늘의 운동';

    // 소요 시간: "- **소요 시간**: 1분"
    const durMatch = chunk.match(/-\s*\*\*소요 시간\*\*:\s*(\d+)분/);
    const durationSeconds = durMatch ? parseInt(durMatch[1], 10) * 60 : 60;

    // 컨디션: "- **컨디션**: 💪"
    const condMatch = chunk.match(/-\s*\*\*컨디션\*\*:\s*([^\s|]+)/);
    const conditionEmoji = condMatch ? condMatch[1].trim() : '💪';

    // 특이사항 / 디로딩
    const isDeload = /-\s*\*\*특이사항\*\*:\s*.*?디로딩/.test(chunk);

    // 운동 메모/소감: "- **운동 메모/소감**: "..."
    const notesMatch = chunk.match(/-\s*\*\*운동 메모\/소감\*\*:\s*"([^"]*)"/) || chunk.match(/-\s*\*\*운동 메모\/소감\*\*:\s*([^\n]+)/);
    const notes = notesMatch ? notesMatch[1].trim() : undefined;

    const sessionId = `md-${date.replace(/-/g, '')}-${sIdx + 1}-${Date.now().toString(36)}`;

    // 2. 종목 단위 분할: "### N." 기준
    const exerciseChunks = chunk.split(/(?=###\s+\d+\.)/g).filter(c => /###\s+\d+\./.test(c));
    const exercises: WorkoutExercise[] = [];

    exerciseChunks.forEach((exChunk, eIdx) => {
      // ### 1. 머신 힙 어덕션 (내전근) [슈퍼세트 A-1] (핀머신 / 투암(양측))
      const firstLineMatch = exChunk.match(/###\s+\d+\.\s+([^\n]+)/);
      if (!firstLineMatch) return;

      const headerLine = firstLineMatch[1].trim();

      // 기구 브랜드 / 세팅: "- **기구 브랜드**: 프리모션 (세팅: ...)"
      const brandMatch = exChunk.match(/-\s*\*\*기구 브랜드\*\*:\s*([^\n(]+)(?:\(세팅:\s*([^)]+)\))?/);
      const machineBrand = brandMatch ? brandMatch[1].trim() : undefined;
      const machineSetting = brandMatch && brandMatch[2] ? brandMatch[2].trim() : undefined;

      // 그룹 (슈퍼세트 / 컴파운드세트 / 자이언트세트)
      const groupMatch = headerLine.match(/\[(.*?(?:슈퍼세트|컴파운드|자이언트).*?)\]/);
      let groupLabel: string | undefined;
      let groupType: 'superset' | 'compound' | 'giant' | undefined;
      let groupId: string | undefined;
      let groupColor: string | undefined;

      if (groupMatch) {
        groupLabel = groupMatch[1].trim();
        if (groupLabel.includes('슈퍼세트')) {
          groupType = 'superset';
          groupColor = '#007AFF';
        } else if (groupLabel.includes('컴파운드')) {
          groupType = 'compound';
          groupColor = '#FF9500';
        } else {
          groupType = 'giant';
          groupColor = '#AF52DE';
        }
        const groupLetterMatch = groupLabel.match(/[A-Za-z0-9]+/);
        const groupKey = groupLetterMatch ? groupLetterMatch[0] : 'group';
        groupId = `${groupType}-${date.replace(/-/g, '')}-${groupKey}`;
      }

      // 대괄호 제거 후 후미 괄호(장비/모드) 분리
      const withoutBrackets = headerLine.replace(/\[.*?\]/g, '').trim();
      const { base: cleanName, trailing: tagText } = extractTrailingParens(withoutBrackets);

      let parsedLoadType: LoadType | undefined;
      let parsedExecutionMode: ExecutionMode | undefined;
      let parsedEquip: EquipmentType | undefined;

      if (tagText) {
        if (tagText.includes('핀머신') || tagText.includes('핀로드')) {
          parsedLoadType = 'pin-loaded';
          parsedEquip = 'machine';
        } else if (tagText.includes('플레이트') || tagText.includes('원판')) {
          parsedLoadType = 'plate-loaded';
          parsedEquip = 'machine';
        } else if (tagText.includes('바벨') || tagText.includes('barbell')) {
          parsedEquip = 'barbell';
        } else if (tagText.includes('덤벨') || tagText.includes('dumbbell')) {
          parsedEquip = 'dumbbell';
        } else if (tagText.includes('케이블') || tagText.includes('cable')) {
          parsedEquip = 'cable';
        } else if (tagText.includes('맨몸') || tagText.includes('bodyweight')) {
          parsedEquip = 'bodyweight';
        } else if (tagText.includes('machine')) {
          parsedEquip = 'machine';
        }

        if (tagText.includes('원암') || tagText.includes('편측')) parsedExecutionMode = 'unilateral';
        else if (tagText.includes('투암') || tagText.includes('양측')) parsedExecutionMode = 'bilateral';
        else if (tagText.includes('교대')) parsedExecutionMode = 'alternating';
      }

      // 세트 테이블 파싱
      // | #1 | 40kg | 15회 | 60kg | 6 | - | 30초 | 양쪽 | 메모 |
      const setLines = exChunk.split('\n').filter(line => /^\s*\|\s*#\d+\s*\|/.test(line));
      const sets: WorkoutSet[] = [];
      const setComments: string[] = [];
      let detectedWeightUnit: 'kg' | 'lbs' = 'kg';

      setLines.forEach((sLine, setIdx) => {
        const cols = sLine.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
        const setNum = parseInt(cols[0]?.replace(/[^0-9]/g, '') || String(setIdx + 1), 10);
        const weightRaw = cols[1] || '0';
        if (weightRaw.toLowerCase().includes('lbs')) detectedWeightUnit = 'lbs';
        const weight = parseFloat(weightRaw.replace(/[^0-9.]/g, '')) || 0;

        const repsRaw = cols[2] || '0';
        const reps = parseInt(repsRaw.replace(/[^0-9]/g, ''), 10) || 0;

        const rpeRaw = cols[4];
        const rpe = rpeRaw && rpeRaw !== '-' ? parseFloat(rpeRaw) : undefined;

        let tempo: { eccentric: number; pause: number; concentric: number } | undefined;
        const tempoRaw = cols[5];
        if (tempoRaw && tempoRaw !== '-') {
          const tMatch = tempoRaw.match(/(\d+)-(\d+)-(\d+)/);
          if (tMatch) {
            tempo = {
              eccentric: parseInt(tMatch[1], 10),
              pause: parseInt(tMatch[2], 10),
              concentric: parseInt(tMatch[3], 10),
            };
          }
        }

        const restRaw = cols[6];
        let restSeconds: number | undefined;
        if (restRaw && restRaw !== '-') {
          const rNum = parseInt(restRaw.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(rNum)) restSeconds = rNum;
        }

        const sideRaw = cols[7];
        let side: 'left' | 'right' | 'both' | undefined;
        if (sideRaw && sideRaw !== '-') {
          if (sideRaw.includes('좌') || sideRaw.includes('L')) side = 'left';
          else if (sideRaw.includes('우') || sideRaw.includes('R')) side = 'right';
          else if (sideRaw.includes('양')) side = 'both';
        }

        const commentRaw = cols[8];
        const comment = commentRaw && commentRaw !== '-' ? commentRaw : undefined;
        if (comment) setComments.push(comment);

        sets.push({
          id: `set-${date}-${sIdx + 1}-${eIdx + 1}-${setNum}`,
          setNumber: setNum,
          weight,
          reps,
          completed: true,
          rpe: rpe !== undefined && !isNaN(rpe) && rpe <= 10 ? rpe : undefined,
          tempo,
          restSeconds,
          side,
          comment,
        });
      });

      // 운동 종목 매칭 & 세트 메모 기반 스마트 보정
      const matchedEx = findMatchingExercise(cleanName, setComments);

      let finalExerciseId: string;
      let finalEquip: EquipmentType = parsedEquip || 'machine';
      let finalLoadType: LoadType | undefined = parsedLoadType;

      if (matchedEx) {
        finalExerciseId = matchedEx.id;
        finalEquip = matchedEx.equipment || finalEquip;
        finalLoadType = parsedLoadType || matchedEx.loadType;
      } else {
        const customId = `custom-${cleanName.replace(/\s+/g, '-').toLowerCase()}`;
        finalExerciseId = customId;
        const newCustom: Exercise = {
          id: customId,
          name: cleanName,
          nameEn: cleanName,
          category: 'legs',
          categories: ['legs'],
          equipment: finalEquip,
          loadType: finalLoadType,
          primaryMuscles: [],
          secondaryMuscles: [],
          description: '마크다운 일지에서 복원된 사용자 운동입니다.',
          instructions: [],
          tips: [],
        };
        if (!customExercises.some(c => c.id === customId)) {
          customExercises.push(newCustom);
        }
      }

      exercises.push({
        id: `ex-${date}-${sIdx + 1}-${eIdx + 1}`,
        exerciseId: finalExerciseId,
        exerciseName: cleanName,
        equipmentType: finalEquip,
        loadType: finalLoadType,
        executionMode: parsedExecutionMode,
        weightUnit: detectedWeightUnit,
        machineBrand,
        machineSetting,
        sets,
        groupId,
        groupType,
        groupLabel,
        groupColor,
      });
    });

    sessions.push({
      id: sessionId,
      title,
      date,
      startTime: `${date}T00:00:00.000Z`,
      durationSeconds,
      completed: true,
      conditionEmoji,
      isDeload,
      notes,
      exercises,
    });
  });

  return {
    format: 'iron-muscle-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    sessions,
    customExercises,
    activeSession: null,
  };
}
