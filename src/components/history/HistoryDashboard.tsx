import React, { useState } from 'react';
import { 
  Calendar, TrendingUp, Trophy, Sparkles, Clock, ChevronRight, BarChart2, Dumbbell 
} from 'lucide-react';
import { WorkoutSession } from '../../types/workout';
import { EXERCISES_DATABASE } from '../../data/exercises';
import { 
  calculateSessionVolume, calculateSessionReps, calculateAverageRPE, 
  calculateProgression, checkDeloadRecommendation 
} from '../../utils/calculations';
import { loadSavedSessions } from '../../utils/storage';

export const HistoryDashboard: React.FC = () => {
  const [history] = useState<WorkoutSession[]>(() => loadSavedSessions());
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('conventional-deadlift');

  const deloadAnalysis = checkDeloadRecommendation(history);
  const progression = calculateProgression(selectedExerciseId, history);
  const targetExercise = EXERCISES_DATABASE.find((e) => e.id === selectedExerciseId);

  const totalWorkouts = history.length;
  const cumulativeVolume = history.reduce((sum, s) => sum + calculateSessionVolume(s), 0);
  const cumulativeReps = history.reduce((sum, s) => sum + calculateSessionReps(s), 0);

  return (
    <div className="pb-32 max-w-lg mx-auto px-4 space-y-4">
      {/* 상단 누적 통계 카드 (애플 헬스케어 스타일) */}
      <div className="p-5 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">나의 트레이닝 통계</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#34C759]/10 text-[#34C759] text-[11px] font-extrabold">
            총 {totalWorkouts}회 완료
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] p-3 rounded-2xl">
            <span className="text-[10px] text-gray-400 font-bold block">운동 횟수</span>
            <span className="text-xl font-black text-[#1D1D1F] dark:text-white">{totalWorkouts} <span className="text-xs font-normal text-gray-400">회</span></span>
          </div>

          <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] p-3 rounded-2xl">
            <span className="text-[10px] text-gray-400 font-bold block">누적 볼륨</span>
            <span className="text-xl font-black text-[#FF2D55]">{cumulativeVolume.toLocaleString()} <span className="text-xs font-normal text-gray-400">kg</span></span>
          </div>

          <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] p-3 rounded-2xl">
            <span className="text-[10px] text-gray-400 font-bold block">누적 반복</span>
            <span className="text-xl font-black text-[#FF9500]">{cumulativeReps.toLocaleString()} <span className="text-xs font-normal text-gray-400">회</span></span>
          </div>
        </div>
      </div>

      {/* 🔄 디로딩 피로도 분석 */}
      <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-white">디로딩 & 피로도 주기화</h3>
              <p className="text-[11px] text-gray-400">신경계 회복 및 초회복 관리</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            deloadAnalysis.shouldDeload
              ? 'bg-red-500/10 text-[#FF2D55]'
              : 'bg-indigo-500/10 text-indigo-500'
          }`}>
            {deloadAnalysis.shouldDeload ? '⚠️ 디로딩 권장' : '⚡ 컨디션 최적'}
          </span>
        </div>

        <div className="bg-[#F9F9FB] dark:bg-[#252528] p-3.5 rounded-2xl text-xs leading-relaxed space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>최근 평균 강도:</span>
            <span className="font-bold text-[#FF9500]">평균 RPE {deloadAnalysis.recentAvgRpe} / 10</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-xs">
            {deloadAnalysis.message}
          </p>
        </div>
      </div>

      {/* 🚀 종목별 통합 성장 지표 (Cross-Brand Growth) */}
      <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#007AFF]/10 text-[#007AFF]">
              <TrendingUp size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-white">종목별 통합 근력 성장 지표</h3>
              <p className="text-[11px] text-gray-400">머신 브랜드가 달라도 종목 전체 1RM 성장 추적</p>
            </div>
          </div>
        </div>

        <div>
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white font-bold rounded-2xl p-2.5 text-xs border border-transparent outline-none cursor-pointer"
          >
            {EXERCISES_DATABASE.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.category})
              </option>
            ))}
          </select>
        </div>

        <div className="bg-[#F9F9FB] dark:bg-[#252528] p-3.5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{targetExercise?.name} 성장률</span>
            <span className={`text-sm font-black ${
              progression.growthRate > 0 ? 'text-[#34C759]' : 'text-gray-400'
            }`}>
              {progression.growthRate > 0 ? `+${progression.growthRate}% 성장 🚀` : '기록 측정 중'}
            </span>
          </div>

          {progression.records.length === 0 ? (
            <div className="py-3 text-center text-xs text-gray-400">
              해당 종목의 과거 데이터가 아직 없습니다.
            </div>
          ) : (
            <div className="space-y-1.5 pt-1">
              {progression.records.map((rec, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-white dark:bg-[#1C1C1E] rounded-xl text-xs shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-400">{rec.date}</span>
                    {rec.brand && (
                      <span className="px-1.5 py-0.5 rounded-md bg-[#FF9500]/10 text-[#FF9500] text-[10px] font-semibold">
                        {rec.brand.split(' ')[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{rec.weight}kg × {rec.reps}회</span>
                    <span className="font-bold text-[#FF2D55]">추정 1RM {rec.max1RM}kg</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 과거 운동 히스토리 목록 */}
      <div className="space-y-2.5">
        <h3 className="text-sm font-extrabold text-[#1D1D1F] dark:text-white px-1 flex items-center gap-1.5">
          <Calendar size={15} className="text-[#007AFF]" />
          과거 운동 일지 ({history.length}회)
        </h3>

        {history.map((sess) => {
          const vol = calculateSessionVolume(sess);
          const completedExercises = sess.exercises;

          return (
            <div key={sess.id} className="p-4 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl leading-none">{sess.conditionEmoji || '💪'}</span>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#1D1D1F] dark:text-white">{sess.title}</h4>
                    <span className="text-[11px] text-gray-400">{sess.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {sess.isDeload && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-[10px] font-bold">
                      디로딩
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-gray-200 text-xs font-bold">
                    {vol.toLocaleString()} kg
                  </span>
                </div>
              </div>

              {sess.notes && (
                <p className="text-xs text-gray-600 dark:text-gray-300 bg-[#F9F9FB] dark:bg-[#252528] p-2.5 rounded-2xl italic">
                  "{sess.notes}"
                </p>
              )}

              <div className="space-y-1">
                {completedExercises.map((ex, i) => {
                  const base = EXERCISES_DATABASE.find((e) => e.id === ex.exerciseId);
                  const completedSets = ex.sets.filter((s) => s.completed);
                  return (
                    <div key={i} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-[#F9F9FB] dark:bg-[#222225]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-800 dark:text-gray-200">{base?.name || ex.exerciseId}</span>
                        {ex.machineBrand && (
                          <span className="text-[10px] text-[#FF9500]">[{ex.machineBrand.split(' ')[0]}]</span>
                        )}
                      </div>
                      <span className="text-gray-400 font-semibold">{completedSets.length}세트 완료</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
