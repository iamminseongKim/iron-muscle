import React, { useState, useEffect } from 'react';
import { t } from '../../i18n';
import { EXERCISES_DATABASE } from '../../data/exercises';
import type { WorkoutSession } from '../../types/workout';
import { loadCustomExercises } from '../../utils/storage';
import { copyText } from '../../utils/clipboard';
import { AI_ROUTINE_EXAMPLE, AI_ROUTINE_MARKDOWN_EXAMPLE, buildAiRoutinePrompt, parseImportedWorkout } from '../../utils/aiRoutineImport';
import type { ImportedWorkout } from '../../utils/aiRoutineImport';
import { RoutinePreviewModal } from './RoutinePreviewModal';

export function AiRoutineImportPanel({ onStart }: { onStart: (session: WorkoutSession) => void }) {
  const [input, setInput] = useState('');
  const [previewDraft, setPreviewDraft] = useState<ImportedWorkout | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [custom, setCustom] = useState(loadCustomExercises);

  useEffect(() => {
    const refresh = () => setCustom(loadCustomExercises());
    window.addEventListener('iron_custom_exercises_change', refresh);
    return () => window.removeEventListener('iron_custom_exercises_change', refresh);
  }, []);

  const catalog = [...custom, ...EXERCISES_DATABASE.filter(item => !custom.some(entry => entry.id === item.id))];
  const field = 'w-full min-w-0 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#25222E] p-3 text-sm text-[#1D1D1F] dark:text-white placeholder-gray-400 focus:border-accent-strong focus:outline-none transition shadow-2xs';
  const button = 'min-h-[44px] rounded-xl bg-accent/10 hover:bg-accent/15 px-3 py-2 text-sm font-bold text-accent dark:text-accent-light transition';
  const primaryButton = 'min-h-[44px] rounded-xl bg-accent hover:opacity-90 active:scale-98 px-5 py-2 text-sm font-bold text-white shadow-xs transition disabled:opacity-40 cursor-pointer';
  const secondaryButton = 'min-h-[44px] rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition cursor-pointer';

  const updateInput = (value: string) => {
    setInput(value);
    setMessage('');
    setPreviewDraft(null);
    setIsPreviewOpen(false);
  };

  const handleOpenPreview = () => {
    setMessage('');
    try {
      const parsed = parseImportedWorkout(input, catalog);
      setPreviewDraft(parsed);
      setIsPreviewOpen(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('루틴 형식을 확인하세요. 예시의 표 또는 JSON 형식을 사용하세요.'));
    }
  };

  const copyPrompt = async () => {
    const success = await copyText(buildAiRoutinePrompt());
    setMessage(success ? t('AI 요청문을 복사했습니다.') : t('복사하지 못했습니다. 예시를 직접 복사하세요.'));
  };

  return (
    <section data-ai-routine className="soft-surface p-4 bg-white dark:bg-[#1E1B24] space-y-3 rounded-2xl border border-black/5 dark:border-white/5">
      <details data-ai-routine-helper className="space-y-3">
        <summary className="text-sm font-bold cursor-pointer select-none text-[#24212B] dark:text-white">
          {t('외부 AI로 루틴 준비하기')}
        </summary>
        <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {t('질문을 복사해 ChatGPT 등 외부 AI에 붙여넣고 대화한 뒤, 완성된 루틴을 가져오세요.')}
        </p>
        <button
          data-ai-routine-copy
          type="button"
          className={`${button} w-full`}
          onClick={copyPrompt}
        >
          {t('외부 AI용 질문 복사')}
        </button>
      </details>

      <details data-ai-routine-paste className="space-y-3" open={Boolean(input)}>
        <summary className="cursor-pointer text-sm font-bold select-none text-[#24212B] dark:text-white">
          {t('루틴 붙여넣기')}
        </summary>
        <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {t('저장해 둔 JSON 또는 Markdown 루틴을 붙여넣고 종목과 세트를 확인하세요.')}
        </p>
        <details className="text-xs space-y-2 text-gray-600 dark:text-gray-300">
          <summary className="cursor-pointer font-semibold">{t('지원 형식과 AI 요청문')}</summary>
          <p>{t('종목에 category, primaryMuscles, secondaryMuscles, nameEn을 추가할 수 있습니다. Markdown 근육 열은 ID를 쉼표로 구분하세요. 미등록 종목은 부위와 근육을 확인한 뒤 새 운동으로 등록할 수 있습니다.')}</p>
          <p>{t('JSON은 title과 exercises를 사용합니다. 종목마다 name, sets, reps, weight, restSeconds, weightUnit을 지정하세요. sets에는 세트별 객체 배열도 사용할 수 있습니다.')}</p>
          <p>{t('종목은 최대 50개, 종목당 세트는 최대 50개입니다. 반복수는 1~1000, 무게는 0~2000, 휴식은 0~3600초입니다. 생략하면 3세트, 10회, 0kg, 90초를 사용합니다.')}</p>
          <p>{t('선택 필드: 루틴 notes, 종목 equipmentType·executionMode·loadType·notes, 세트 rpe·tempo·comment·side. RPE는 6~10에서 0.5 단위, tempo는 eccentric·pause·concentric 각각 0~30초입니다.')}</p>
          <p>{t('executionMode는 bilateral·unilateral·alternating, loadType은 pin-loaded·plate-loaded·barbell·dumbbell·cable·bodyweight·other, equipmentType은 smith·barbell·dumbbell·machine·cable·bodyweight·other입니다. side는 left·right·both이며 단위는 종목별로 지정합니다.')} </p>
          <p>{t('Markdown 선택 열: rpe, tempo, notes, comment, executionMode, loadType, equipmentType, side, unit. tempo는 3-1-1처럼 작성하세요.')} </p>
          <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-black/5 dark:bg-white/5 p-2 font-mono text-[11px]">{AI_ROUTINE_EXAMPLE}</pre>
          <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-black/5 dark:bg-white/5 p-2 font-mono text-[11px]">{AI_ROUTINE_MARKDOWN_EXAMPLE}</pre>
          <p>{t('Markdown 표는 name, sets, reps 열이 필요합니다. weight와 rest는 선택입니다. 한국어 열 이름도 지원합니다. 범위 대신 숫자 하나를 써주세요.')}</p>
        </details>

        <label className="block text-xs font-semibold space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">{t('루틴 Markdown 또는 JSON')}</span>
            {input && (
              <button
                type="button"
                className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 font-normal transition-colors"
                onClick={() => updateInput('')}
              >
                {t('전체 삭제')}
              </button>
            )}
          </div>
          <textarea
            data-ai-routine-input
            aria-label={t('루틴 Markdown 또는 JSON')}
            rows={3}
            maxLength={100000}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            placeholder={t('저장해 둔 루틴 JSON 또는 Markdown 표를 여기에 붙여넣으세요.')}
            className={`${field} font-mono text-xs leading-relaxed resize-y`}
            value={input}
            onChange={event => updateInput(event.target.value)}
          />
        </label>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            data-ai-routine-preview-button
            type="button"
            className={primaryButton}
            onClick={handleOpenPreview}
            disabled={!input.trim()}
          >
            {t('운동 시작')}
          </button>
          {input && (
            <button
              type="button"
              className={secondaryButton}
              onClick={() => updateInput('')}
            >
              {t('전체 삭제')}
            </button>
          )}
        </div>
      </details>

      {message && (
        <p role="status" className="text-xs text-orange-600 dark:text-orange-400 font-medium">
          {t(message)}
        </p>
      )}

      {isPreviewOpen && previewDraft && (
        <RoutinePreviewModal
          isOpen={isPreviewOpen}
          draft={previewDraft}
          catalog={catalog}
          onClose={() => setIsPreviewOpen(false)}
          onStart={session => {
            try {
              onStart(session);
              setIsPreviewOpen(false);
            } catch (error) {
              const msg = error instanceof Error ? error.message : '운동을 시작하지 못했습니다.';
              setMessage(msg);
              throw error;
            }
          }}
          onUpdateDraft={updated => setPreviewDraft(updated)}
          onCustomExerciseCreated={() => {
            setCustom(loadCustomExercises());
          }}
        />
      )}
    </section>
  );
}
