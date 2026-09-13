import { t } from '../../i18n';
import React, { useState } from 'react';
import { 
  X, Save, Trash2, Plus, Calendar, Clock, Dumbbell, 
  Sparkles, Check, Flame, MessageSquare, AlertCircle 
} from 'lucide-react';
import { WorkoutSession, WorkoutExercise, WorkoutSet, Category, EquipmentType } from '../../types/workout';
import { resolveRecordedExercise } from '../../utils/exerciseResolver';
import { AddExerciseModal } from '../workout/AddExerciseModal';

interface EditSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: WorkoutSession | null;
  onSave: (updated: WorkoutSession) => void;
}

const EMOJI_OPTIONS = ['💪', '🔥', '🚀', '🥱', '🤕', '⚡'];

export const EditSessionModal: React.FC<EditSessionModalProps> = ({
  isOpen,
  onClose,
  session,
  onSave,
}) => {
  if (!isOpen || !session) return null;

  const [date, setDate] = useState<string>(session.date);
  const [title, setTitle] = useState<string>(session.title || t('오늘의 운동'));
  const [notes, setNotes] = useState<string>(session.notes || '');
  const [conditionEmoji, setConditionEmoji] = useState<string>(session.conditionEmoji || '💪');
  const [isDeload, setIsDeload] = useState<boolean>(Boolean(session.isDeload));
  const [durationMinutes, setDurationMinutes] = useState<number>(Math.round(session.durationSeconds / 60));
  const [exercises, setExercises] = useState<WorkoutExercise[]>(session.exercises);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 세트 추가
  const handleAddSet = (exerciseIndex: number) => {
    const targetEx = exercises[exerciseIndex];
    const lastSet = targetEx.sets[targetEx.sets.length - 1];
    const newSet: WorkoutSet = {
      id: 'set-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      setNumber: targetEx.sets.length + 1,
      weight: lastSet ? lastSet.weight : 20,
      reps: lastSet ? lastSet.reps : 10,
      completed: true,
      rpe: lastSet?.rpe || 8.0,
      tempo: lastSet?.tempo,
      restSeconds: lastSet?.restSeconds || 60,
      side: lastSet?.side || (targetEx.executionMode === 'unilateral' ? 'left' : 'both'),
    };

    const newExs = [...exercises];
    newExs[exerciseIndex] = {
      ...targetEx,
      sets: [...targetEx.sets, newSet],
    };
    setExercises(newExs);
  };

  // 세트 수정
  const handleUpdateSet = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: any) => {
    const newExs = [...exercises];
    const targetEx = newExs[exerciseIndex];
    const targetSet = { ...targetEx.sets[setIndex], [field]: value };
    const newSets = [...targetEx.sets];
    newSets[setIndex] = targetSet;
    newExs[exerciseIndex] = { ...targetEx, sets: newSets };
    setExercises(newExs);
  };

  // 종목 내 모든 세트 휴식 시간 일괄 적용
  const handleBatchApplyRest = (exerciseIndex: number, seconds: number) => {
    const newExs = [...exercises];
    const targetEx = newExs[exerciseIndex];
    newExs[exerciseIndex] = {
      ...targetEx,
      sets: targetEx.sets.map((s) => ({ ...s, restSeconds: seconds })),
    };
    setExercises(newExs);
  };

  // 세트 삭제
  const handleDeleteSet = (exerciseIndex: number, setIndex: number) => {
    const newExs = [...exercises];
    const targetEx = newExs[exerciseIndex];
    const filteredSets = targetEx.sets.filter((_, idx) => idx !== setIndex).map((s, idx) => ({
      ...s,
      setNumber: idx + 1,
    }));
    newExs[exerciseIndex] = { ...targetEx, sets: filteredSets };
    setExercises(newExs);
  };

  // 종목 삭제
  const handleDeleteExercise = (exerciseIndex: number) => {
    setExercises(exercises.filter((_, idx) => idx !== exerciseIndex));
  };

  // 새 종목 추가
  const handleAddExercise = (exercise: any, equipmentType: EquipmentType, brand?: string) => {
    const newExItem: WorkoutExercise = {
      id: 'ex-' + Date.now(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      loadType: exercise.loadType,
      equipmentType,
      machineBrand: brand,
      sets: [
        {
          id: 'set-' + Date.now() + '-1',
          setNumber: 1,
          weight: 20,
          reps: 10,
          completed: true,
          rpe: 8.0,
          restSeconds: 60,
        },
      ],
    };
    setExercises([...exercises, newExItem]);
    setIsAddModalOpen(false);
  };

  // 저장 실행
  const handleSave = () => {
    const updated: WorkoutSession = {
      ...session,
      date,
      title: title.trim() || t('오늘의 운동'),
      notes: notes.trim() || undefined,
      conditionEmoji,
      isDeload,
      durationSeconds: Math.max(0, durationMinutes * 60),
      exercises,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-xl rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 flex flex-col max-h-[90vh] overflow-hidden my-auto animate-fade-in">
        
        {/* 모달 헤더 */}
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-[#F9F9FB] dark:bg-[#161618]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0F766E]/15 text-[#0F766E] flex items-center justify-center font-bold">
              ✏️
            </div>
            <div>
              <h3 className="text-base font-black text-[#1D1D1F] dark:text-white">
                {t("운동 일지 수정")}
              </h3>
              <p className="text-[11px] text-gray-400">{t("세션 상세 내용 및 기록 편집")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-black dark:hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* 모달 본문 (스크롤) */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* 1. 날짜 및 운동 소요시간 */}
          <div className="grid grid-cols-2 gap-3 bg-[#F2F2F7] dark:bg-[#2C2C2E] p-3 rounded-2xl">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <Calendar size={12} className="text-[#0F766E]" />
                {t("날짜")}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white dark:bg-[#1C1C1E] px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 font-bold text-[#1D1D1F] dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <Clock size={12} className="text-[#FF9500]" />
                {t("운동 시간(분)")}
              </label>
              <input
                type="number"
                min="0"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-white dark:bg-[#1C1C1E] px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 font-bold text-[#1D1D1F] dark:text-white outline-none"
              />
            </div>
          </div>

          {/* 2. 세션 제목 및 컨디션 이모지 */}
          <div className="space-y-2 bg-[#F2F2F7] dark:bg-[#2C2C2E] p-3 rounded-2xl">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                  {t("루틴 제목")}
                </label>
                <input
                  type="text"
                  value={title}
                  placeholder={t("예: 가슴 & 삼두 루틴")}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white dark:bg-[#1C1C1E] px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 font-bold text-[#1D1D1F] dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 text-center">
                  {t("오늘의 신체 컨디션")}
                </label>
                <div className="flex gap-1 bg-white dark:bg-[#1C1C1E] p-1 rounded-xl border border-black/10 dark:border-white/10">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setConditionEmoji(em)}
                      className={`w-6 h-6 rounded-lg text-sm flex items-center justify-center transition ${
                        conditionEmoji === em ? 'bg-black/10 dark:bg-white/20 scale-110' : 'opacity-50 hover:opacity-100'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 디로딩 체크 */}
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isDeload}
                onChange={(e) => setIsDeload(e.target.checked)}
                className="w-4 h-4 rounded text-[#0F766E] accent-[#0F766E]"
              />
              <span className="font-bold text-[11px] text-gray-600 dark:text-gray-300">
                {t("디로딩 세션으로 기록 (강도/볼륨 조절 주간)")}
              </span>
            </label>
          </div>

          {/* 3. 운동 일지 메모 */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
              <MessageSquare size={12} className="text-[#30D158]" />
              {t("운동 일지 메모 (식단, 통증, 집중도 등)")}
            </label>
            <textarea
              rows={2}
              value={notes}
              placeholder={t("오늘 운동 일지 및 특이사항 입력...")}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] p-2.5 rounded-xl border border-black/5 dark:border-white/5 text-gray-800 dark:text-gray-200 outline-none resize-none"
            />
          </div>

          {/* 4. 운동 종목 및 세트 목록 */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-[#1D1D1F] dark:text-white flex items-center gap-1.5">
                <Dumbbell size={14} className="text-[#0F766E]" />
                {t("운동 종목")} ({exercises.length})
              </span>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-2.5 py-1 bg-[#0F766E] hover:bg-[#0062CC] text-white font-bold rounded-xl flex items-center gap-1 text-[11px] transition shadow-xs"
              >
                <Plus size={13} />
                <span>{t("종목 추가")}</span>
              </button>
            </div>

            {exercises.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl text-gray-400">
                {t("기록된 운동이 없습니다")}
              </div>
            ) : (
              exercises.map((exItem, eIdx) => {
                const base = resolveRecordedExercise(exItem);
                const exName = base.name;

                return (
                  <div
                    key={exItem.id || eIdx}
                    className="p-3 bg-[#F9F9FB] dark:bg-[#222226] rounded-2xl border border-black/10 dark:border-white/10 space-y-2.5"
                  >
                    {/* 종목 헤더 */}
                    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-[#0F766E]/15 text-[#0F766E] font-black flex items-center justify-center text-[10px]">
                          {eIdx + 1}
                        </span>
                        <span className="font-black text-sm text-[#1D1D1F] dark:text-white">
                          {exName}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {exItem.loadType === 'plate-loaded' ? t('플레이트') : exItem.loadType === 'pin-loaded' ? t('핀머신') : t(exItem.equipmentType)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const current = exItem.weightUnit || 'kg';
                            const next = current === 'kg' ? 'lbs' : 'kg';
                            const newExs = [...exercises];
                            newExs[eIdx] = { ...exItem, weightUnit: next };
                            setExercises(newExs);
                          }}
                          className="px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/10 text-[10px] font-bold text-[#0F766E] hover:bg-[#0F766E]/10 transition"
                          title={t("중량 단위")}
                        >
                          {t("단위")}: {exItem.weightUnit || 'kg'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExercise(eIdx)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded-lg transition"
                          title={t("종목 삭제")}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* 휴식 시간 일괄 적용 퀵 칩 */}
                    <div className="flex items-center justify-between text-[11px] bg-white/70 dark:bg-black/30 px-2.5 py-1.5 rounded-xl border border-black/5 dark:border-white/5 flex-wrap gap-1">
                      <span className="font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1 shrink-0">
                        <Clock size={11} className="text-[#0F766E]" />
                        {t("휴식 시간")}:
                      </span>
                      <div className="flex items-center gap-1 font-bold flex-wrap">
                        {[30, 60, 90, 120, 180].map((sec) => (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => handleBatchApplyRest(eIdx, sec)}
                            className="px-2 py-0.5 rounded-lg bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-[#0F766E] hover:text-white text-gray-700 dark:text-gray-300 text-[10px] transition active:scale-95 shadow-xs"
                            title={`${sec}s`}
                          >
                            {sec}s
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 세트 헤더 */}
                    <div className="grid grid-cols-12 gap-1.5 text-[10px] font-bold text-gray-400 px-1 text-center">
                      <span className="col-span-1">#</span>
                      <span className="col-span-3">{t("무게")}({exItem.weightUnit || 'kg'})</span>
                      <span className="col-span-3">{t("횟수")}</span>
                      <span className="col-span-2">RPE</span>
                      <span className="col-span-2">{t("휴식")}(s)</span>
                      <span className="col-span-1">{t("삭제")}</span>
                    </div>

                    {/* 세트 행 리스트 */}
                    <div className="space-y-1.5">
                      {exItem.sets.map((set, sIdx) => (
                        <div
                          key={set.id || sIdx}
                          className="grid grid-cols-12 gap-1.5 items-center bg-white dark:bg-[#1C1C1E] p-1.5 rounded-xl border border-black/5 dark:border-white/5"
                        >
                          <span className="col-span-1 font-bold text-center text-gray-400">
                            {set.setNumber}
                          </span>

                          <input
                            type="number"
                            step="0.5"
                            inputMode="decimal"
                            value={set.weight}
                            onFocus={() => window.getSelection()?.removeAllRanges()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') e.currentTarget.blur();
                            }}
                            onChange={(e) => handleUpdateSet(eIdx, sIdx, 'weight', parseFloat(e.target.value) || 0)}
                            className="col-span-3 bg-[#F2F2F7] dark:bg-[#2C2C2E] px-2 py-1 rounded-lg text-center font-black text-[#1D1D1F] dark:text-white outline-none focus:ring-1 focus:ring-[#0F766E]"
                          />

                          <input
                            type="number"
                            inputMode="numeric"
                            value={set.reps}
                            onFocus={() => window.getSelection()?.removeAllRanges()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') e.currentTarget.blur();
                            }}
                            onChange={(e) => handleUpdateSet(eIdx, sIdx, 'reps', parseInt(e.target.value) || 0)}
                            className="col-span-3 bg-[#F2F2F7] dark:bg-[#2C2C2E] px-2 py-1 rounded-lg text-center font-black text-[#1D1D1F] dark:text-white outline-none focus:ring-1 focus:ring-[#0F766E]"
                          />

                          <input
                            type="number"
                            step="0.5"
                            min="6"
                            max="10"
                            placeholder="RPE"
                            value={set.rpe || ''}
                            onFocus={(e) => {
                              const t = e.currentTarget;
                              t.select();
                              setTimeout(() => t.select(), 30);
                            }}
                            onClick={(e) => e.currentTarget.select()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') e.currentTarget.blur();
                            }}
                            onChange={(e) => handleUpdateSet(eIdx, sIdx, 'rpe', parseFloat(e.target.value) || undefined)}
                            className="col-span-2 bg-[#F2F2F7] dark:bg-[#2C2C2E] px-1 py-1 rounded-lg text-center font-bold text-amber-500 outline-none"
                          />

                          <div className="col-span-2 relative flex flex-col items-center">
                            <input
                              type="number"
                              min="0"
                              step="5"
                              placeholder={t("초")}
                              value={set.restSeconds ?? ''}
                              onChange={(e) => handleUpdateSet(eIdx, sIdx, 'restSeconds', e.target.value === '' ? undefined : Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] px-1 py-1 rounded-lg text-center font-medium text-gray-700 dark:text-gray-300 outline-none focus:ring-1 focus:ring-[#0F766E]"
                            />
                            {set.restSeconds !== undefined && set.restSeconds >= 60 && (
                              <span className="text-[9px] font-bold text-[#0F766E] leading-none mt-0.5 pointer-events-none">
                                {Math.floor(set.restSeconds / 60)}{t("분")}{set.restSeconds % 60 ? ` ${set.restSeconds % 60}${t("초")}` : ''}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteSet(eIdx, sIdx)}
                            className="col-span-1 p-1 text-gray-300 hover:text-red-500 flex items-center justify-center transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* 세트 추가 버튼 */}
                    <button
                      type="button"
                      onClick={() => handleAddSet(eIdx)}
                      className="w-full py-1.5 rounded-xl border border-dashed border-black/15 dark:border-white/15 text-gray-500 hover:text-black dark:hover:text-white hover:border-black/30 text-[11px] font-bold flex items-center justify-center gap-1 transition"
                    >
                      <Plus size={12} />{t("세트 추가")}</button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 모달 푸터 버튼 */}
        <div className="p-4 border-t border-black/5 dark:border-white/5 flex items-center justify-end gap-2 bg-[#F9F9FB] dark:bg-[#161618]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 font-bold transition"
          >{t("취소")}</button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0062CC] text-white font-extrabold flex items-center gap-1.5 transition shadow-sm"
          >
            <Save size={15} />
            <span>{t("수정 완료 저장")}</span>
          </button>
        </div>

      </div>

      {/* 종목 추가 모달 */}
      <AddExerciseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSelect={handleAddExercise}
      />
    </div>
  );
};
