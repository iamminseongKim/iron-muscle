import { WorkoutSet, WorkoutSession, Tempo, WeightUnit } from '../types/workout';

export const KG_TO_LBS = 2.20462;

// kg <-> lbs 변환 함수 (0.5 단위 깔끔 반올림)
export function convertWeight(weight: number, from: WeightUnit, to: WeightUnit): number {
  if (!weight || from === to) return weight;
  if (from === 'kg' && to === 'lbs') {
    const raw = weight * KG_TO_LBS;
    return Math.round(raw * 2) / 2;
  }
  if (from === 'lbs' && to === 'kg') {
    const raw = weight / KG_TO_LBS;
    return Math.round(raw * 2) / 2;
  }
  return weight;
}

// 1. 추정 1RM 계산 (Brzycki 공식 및 RPE 반영)
export function calculate1RM(weight: number, reps: number, rpe?: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1 && (!rpe || rpe === 10)) return Math.round(weight);

  // RPE 기반 여유 반복수(RIR) 보정
  const rir = rpe ? Math.max(0, 10 - rpe) : 0;
  const effectiveReps = reps + rir;

  if (effectiveReps >= 37) return Math.round(weight * 1.5);
  // Brzycki Formula
  const oneRm = weight * (36 / (37 - effectiveReps));
  return Math.round(oneRm * 10) / 10;
}

// 2. TUT (Time Under Tension - 긴장 지속시간) 계산 (초 단위)
export function calculateSetTUT(reps: number, tempo?: Tempo): number {
  if (!tempo || reps <= 0) return 0;
  const secPerRep = (tempo.eccentric || 2) + (tempo.pause || 0) + (tempo.concentric || 1);
  return reps * secPerRep;
}

// 3. TUT 기반 근비대 과부하 지표 (무게 * 총 긴장시간)
export function calculateTUTLoad(weight: number, reps: number, tempo?: Tempo): number {
  const tut = calculateSetTUT(reps, tempo);
  return Math.round(weight * tut);
}

// 4. 세션 총 볼륨 (kg 기준 통일) 계산
export function calculateSessionVolume(session: WorkoutSession): number {
  let totalVolume = 0;
  session.exercises.forEach(ex => {
    const isLbs = ex.weightUnit === 'lbs';
    ex.sets.forEach(s => {
      if (s.completed && s.weight > 0 && s.reps > 0) {
        const weightInKg = isLbs ? s.weight / KG_TO_LBS : s.weight;
        totalVolume += weightInKg * s.reps;
      }
    });
  });
  return Math.round(totalVolume);
}

// 5. 세션 총 횟수 (Reps)
export function calculateSessionReps(session: WorkoutSession): number {
  let totalReps = 0;
  session.exercises.forEach(ex => {
    ex.sets.forEach(s => {
      if (s.completed && s.reps > 0) {
        totalReps += s.reps;
      }
    });
  });
  return totalReps;
}

// 6. 세션 평균 RPE 계산
export function calculateAverageRPE(session: WorkoutSession): number | null {
  const rpes: number[] = [];
  session.exercises.forEach(ex => {
    ex.sets.forEach(s => {
      if (s.completed && s.rpe) {
        rpes.push(s.rpe);
      }
    });
  });
  if (rpes.length === 0) return null;
  const avg = rpes.reduce((a, b) => a + b, 0) / rpes.length;
  return Math.round(avg * 10) / 10;
}

// 7. 특정 운동의 최고 기록 (1RM, 1세트 최고 볼륨, 최대 무게)
export function getExerciseRecords(sets: WorkoutSet[]) {
  let maxWeight = 0;
  let max1RM = 0;
  let maxSetVolume = 0;
  let totalSets = 0;
  let totalVolume = 0;

  sets.forEach(set => {
    if (set.completed && set.weight > 0 && set.reps > 0) {
      totalSets += 1;
      const vol = set.weight * set.reps;
      totalVolume += vol;
      if (vol > maxSetVolume) maxSetVolume = vol;
      if (set.weight > maxWeight) maxWeight = set.weight;
      const est1RM = calculate1RM(set.weight, set.reps, set.rpe);
      if (est1RM > max1RM) max1RM = est1RM;
    }
  });

  return { maxWeight, max1RM, maxSetVolume, totalSets, totalVolume };
}

// 8. 종목별 통합 성장 분석 (여러 세션에 걸친 1RM 성장률 %)
export function calculateProgression(exerciseId: string, history: WorkoutSession[]) {
  const records: { date: string; max1RM: number; brand?: string; weight: number; reps: number }[] = [];

  history.forEach(session => {
    session.exercises.forEach(ex => {
      if (ex.exerciseId === exerciseId) {
        let best1RM = 0;
        let bestWeight = 0;
        let bestReps = 0;
        ex.sets.forEach(s => {
          if (s.completed) {
            const oneRm = calculate1RM(s.weight, s.reps, s.rpe);
            if (oneRm > best1RM) {
              best1RM = oneRm;
              bestWeight = s.weight;
              bestReps = s.reps;
            }
          }
        });
        if (best1RM > 0) {
          records.push({
            date: session.date,
            max1RM: best1RM,
            brand: ex.machineBrand,
            weight: bestWeight,
            reps: bestReps
          });
        }
      }
    });
  });

  records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let growthRate = 0;
  if (records.length >= 2) {
    const first = records[0].max1RM;
    const last = records[records.length - 1].max1RM;
    growthRate = Math.round(((last - first) / first) * 1000) / 10;
  }

  return { records, growthRate };
}

// 9. 디로딩(Deload) 권장 분석
export function checkDeloadRecommendation(history: WorkoutSession[]): {
  shouldDeload: boolean;
  recentAvgRpe: number;
  message: string;
} {
  const recentSessions = history.slice(-8);
  if (recentSessions.length < 4) {
    return { shouldDeload: false, recentAvgRpe: 7.5, message: '훈련 데이터 수집 중입니다. 꾸준히 기록을 남겨보세요!' };
  }

  let totalRpe = 0;
  let count = 0;
  recentSessions.forEach(s => {
    const r = calculateAverageRPE(s);
    if (r) {
      totalRpe += r;
      count++;
    }
  });

  const recentAvg = count > 0 ? totalRpe / count : 7.5;
  const isHighFatigue = recentAvg >= 8.5;

  return {
    shouldDeload: isHighFatigue,
    recentAvgRpe: Math.round(recentAvg * 10) / 10,
    message: isHighFatigue
      ? '최근 훈련 강도(평균 RPE ' + Math.round(recentAvg * 10) / 10 + ')가 매우 높습니다! 신경계 회복과 근비대 초회복을 위해 이번 주는 중량/볼륨을 50~60%로 줄인 디로딩 주간을 강력히 권장합니다.'
      : '현재 훈련 강도가 적절한 피로도 범위 내에서 진행되고 있습니다. 좋은 컨디션을 유지하며 점진적 과부하를 이어가세요!'
  };
}
