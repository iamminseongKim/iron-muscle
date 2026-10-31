import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Dumbbell, AlertTriangle } from 'lucide-react';
import { displayMuscle, t } from '../../i18n';
import type { EquipmentType, ExecutionMode, Exercise, LoadType, WorkoutSession } from '../../types/workout';
import { sessionFromImportedWorkout } from '../../utils/aiRoutineImport';
import type { ImportedWorkout } from '../../utils/aiRoutineImport';
import { loadCustomExercises } from '../../utils/storage';
import { CreateCustomExerciseModal } from './CreateCustomExerciseModal';
import { SearchableExerciseSelect } from './SearchableExerciseSelect';

const equipmentLabels: Record<EquipmentType, string> = { smith: '스미스 머신', barbell: '바벨', dumbbell: '덤벨', machine: '머신', cable: '케이블', bodyweight: '맨몸', other: '기타' };
const modeLabels: Record<ExecutionMode, string> = { bilateral: '양측', unilateral: '편측', alternating: '교대' };
const loadLabels: Record<LoadType, string> = { 'plate-loaded': '플레이트', 'pin-loaded': '핀머신', barbell: '바벨', dumbbell: '덤벨', cable: '케이블', bodyweight: '맨몸', other: '기타' };

interface RoutinePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: ImportedWorkout;
  catalog: Exercise[];
  onStart: (session: WorkoutSession) => void;
  onUpdateDraft: (updated: ImportedWorkout) => void;
  onCustomExerciseCreated: (exercise: Exercise) => void;
}

export const RoutinePreviewModal: React.FC<RoutinePreviewModalProps> = ({
  isOpen,
  onClose,
  draft,
  catalog: externalCatalog,
  onStart,
  onUpdateDraft,
  onCustomExerciseCreated,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [registration, setRegistration] = useState<{
    index: number;
    name: string;
    review: NonNullable<React.ComponentProps<typeof CreateCustomExerciseModal>['importReview']>;
  } | null>(null);

  const fullCatalog = useMemo(() => {
    const customList = loadCustomExercises();
    return [...customList, ...externalCatalog.filter(item => !customList.some(entry => entry.id === item.id))];
  }, [externalCatalog, registration]);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage('');
    closeButtonRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasUnmapped = draft.exercises.some(row => !row.exerciseId || !fullCatalog.some(item => item.id === row.exerciseId));

  const handleStartWorkout = () => {
    try {
      const session = sessionFromImportedWorkout(draft, fullCatalog);
      onStart(session);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('모든 종목을 선택하세요.'));
    }
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="routine-preview-modal-title"
        className="keyboard-aware-modal fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-md animate-fade-in"
        style={{
          paddingTop: 'max(20px, env(safe-area-inset-top, 20px))',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
        }}
      >
        <div
          data-ai-routine-preview
          className="bg-white dark:bg-[#1E1B24] rounded-3xl w-full max-w-lg max-h-[88dvh] overflow-hidden flex flex-col shadow-2xl border border-black/10 dark:border-white/10"
        >
          {/* Header */}
          <div className="shrink-0 p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <Dumbbell size={18} />
              </div>
              <div className="min-w-0">
                <h3 id="routine-preview-modal-title" className="font-extrabold text-base text-[#1D1D1F] dark:text-white truncate">
                  {t('루틴 구성 확인')}
                </h3>
                <p className="text-xs text-gray-400 truncate">
                  {draft.title === 'AI 루틴' ? t('AI 루틴') : draft.title} · {draft.exercises.length}{t('종목')}
                </p>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
              aria-label={t('닫기')}
            >
              <X size={18} />
            </button>
          </div>

          {/* Program Badges & Notes */}
          {(draft.programId || draft.programWeek !== undefined || draft.trainingPhase || draft.sessionGoal || draft.notes) && (
            <div className="shrink-0 px-4 py-2.5 bg-gray-50/80 dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                {draft.programId && (
                  <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent font-bold">
                    {draft.programId}
                  </span>
                )}
                {draft.programWeek !== undefined && (
                  <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent font-bold">
                    {draft.programWeek}{t('주차')}
                  </span>
                )}
                {draft.trainingPhase && (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 font-bold">
                    {t(draft.trainingPhase)}
                  </span>
                )}
                {draft.sessionGoal && (
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    · {draft.sessionGoal}
                  </span>
                )}
              </div>
              {draft.notes && (
                <p className="text-gray-500 dark:text-gray-400 whitespace-pre-wrap break-words">
                  {t('메모')} · {draft.notes}
                </p>
              )}
            </div>
          )}

          {/* Scrollable Exercise List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y-0">
            {draft.exercises.map((row, index) => {
              const selected = fullCatalog.find(item => item.id === row.exerciseId);
              const equipmentType = row.equipmentType || selected?.equipment;
              const loadType = row.loadType || selected?.loadType || (equipmentType === 'machine' || equipmentType === 'smith' ? 'plate-loaded' : undefined);

              return (
                <div
                  key={index}
                  className="rounded-2xl border border-black/8 dark:border-white/10 bg-gray-50/80 dark:bg-white/[0.03] p-3.5 space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-sm text-[#1D1D1F] dark:text-white break-words">
                      <span className="text-accent mr-1.5">{index + 1}.</span>
                      {row.sourceName}
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent shrink-0">
                      {row.sets.length}{t('세트')}
                    </span>
                  </div>

                  {!row.exerciseId && (
                    <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-2.5 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-semibold">
                        <AlertTriangle size={14} />
                        <span>{t('일치하는 종목을 확인할 수 없습니다. 직접 선택하세요.')}</span>
                      </div>
                      {row.proposal && (
                        <div data-ai-muscle-proposal className="text-[11px] space-y-0.5 text-gray-600 dark:text-gray-300">
                          <p>{t('근육 정보 확인')}</p>
                          <p>{t('주동근')} · {row.proposal.primaryMuscles?.map(displayMuscle).join(', ') || t('미지정')}</p>
                          <p>{t('보조근')} · {row.proposal.secondaryMuscles?.map(displayMuscle).join(', ') || t('미지정')}</p>
                        </div>
                      )}
                      <button
                        data-ai-register-exercise
                        type="button"
                        className="w-full py-2 px-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition cursor-pointer"
                        onClick={() => setRegistration({
                          index,
                          name: row.sourceName,
                          review: {
                            kind: 'ai-import',
                            proposal: row.proposal,
                            equipmentType: row.equipmentType,
                            loadType: row.loadType,
                          },
                        })}
                      >
                        {t('새 운동으로 등록')}
                      </button>
                    </div>
                  )}

                  {selected && (
                    <div data-confirmed-muscles className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5 bg-white/70 dark:bg-black/20 p-2.5 rounded-xl border border-black/5 dark:border-white/5">
                      <p className="font-semibold text-gray-700 dark:text-gray-300">
                        {t('선택한 종목의 근육')}
                      </p>
                      <p>{t('주동근')} · {selected.primaryMuscles.map(displayMuscle).join(', ') || t('미지정')}</p>
                      <p>{t('보조근')} · {selected.secondaryMuscles.map(displayMuscle).join(', ') || t('미지정')}</p>
                    </div>
                  )}

                  {/* Custom Searchable Exercise Select */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      {t('적용할 종목')}
                    </label>
                    <SearchableExerciseSelect
                      value={row.exerciseId}
                      exercises={fullCatalog}
                      sourceName={row.sourceName}
                      dataAiExerciseSelect={true}
                      onChange={exerciseId => {
                        onUpdateDraft({
                          ...draft,
                          exercises: draft.exercises.map((item, i) => i === index ? { ...item, exerciseId } : item),
                        });
                      }}
                    />
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <span>{t(modeLabels[row.executionMode])}</span>
                    {equipmentType && <span> · {t(equipmentLabels[equipmentType])}</span>}
                    {loadType && <span> · {t(loadLabels[loadType])}</span>}
                    {row.notes && <p className="mt-1 text-gray-600 dark:text-gray-300">{t('메모')} · {row.notes}</p>}
                  </div>

                  {/* 세트 리스트 요약 */}
                  <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-1">
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {row.sets.length} {t('세트')} · {row.weightUnit}
                    </div>
                    <ol className="text-xs text-gray-600 dark:text-gray-300 space-y-1 pl-1">
                      {row.sets.map((set, i) => (
                        <li key={i}>
                          {i + 1}. {set.weight}{row.weightUnit} · {set.reps} {t('회')} · {t('권장 휴식')} {set.restSeconds >= 60 ? `${Math.floor(set.restSeconds / 60)}${t('분')} ` : ''}{set.restSeconds % 60 > 0 || set.restSeconds === 0 ? `${set.restSeconds % 60}${t('초')}` : ''}{set.rpe !== undefined && ` · RPE ${set.rpe}`}{set.tempo && ` · ${t('템포')} ${set.tempo.eccentric}-${set.tempo.pause}-${set.tempo.concentric}`}{set.side && ` · ${t(set.side === 'left' ? '왼쪽' : set.side === 'right' ? '오른쪽' : '양쪽')}`}{set.comment && <p className="whitespace-pre-wrap break-words">{set.comment}</p>}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              );
            })}
          </div>

          {errorMessage && (
            <div className="px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Footer */}
          <div className="shrink-0 p-4 border-t border-black/5 dark:border-white/10 flex items-center justify-end gap-2.5 bg-gray-50/50 dark:bg-[#1A1720]">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-sm font-semibold text-gray-700 dark:text-gray-300 transition cursor-pointer"
            >
              {t('취소')}
            </button>
            <button
              data-ai-routine-start
              type="button"
              disabled={hasUnmapped}
              onClick={handleStartWorkout}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-accent hover:opacity-90 active:scale-98 text-sm font-bold text-white shadow-xs transition disabled:opacity-40 cursor-pointer"
            >
              {t('이 루틴으로 운동 시작')}
            </button>
          </div>
        </div>
      </div>

      {registration && (
        <CreateCustomExerciseModal
          isOpen
          initialName={registration.name}
          importReview={registration.review}
          onClose={() => setRegistration(null)}
          onCreated={created => {
            onCustomExerciseCreated(created);
            onUpdateDraft({
              ...draft,
              exercises: draft.exercises.map((row, index) =>
                index === registration.index
                  ? { ...row, exerciseId: created.id, equipmentType: created.equipment, loadType: created.loadType }
                  : row
              ),
            });
            setRegistration(null);
          }}
        />
      )}
    </>
  );
};
