import React, { useState } from 'react';
import { displayExercise, t } from '../../i18n';
import { EXERCISES_DATABASE } from '../../data/exercises';
import type { EquipmentType, ExecutionMode, LoadType, WorkoutSession } from '../../types/workout';
import { loadCustomExercises } from '../../utils/storage';
import { matchesExerciseSearch } from '../../utils/exerciseSearch';
import { copyText } from '../../utils/clipboard';
import { AI_ROUTINE_EXAMPLE, AI_ROUTINE_MARKDOWN_EXAMPLE, buildAiRoutinePrompt, parseImportedWorkout, sessionFromImportedWorkout } from '../../utils/aiRoutineImport';
import type { ImportedWorkout } from '../../utils/aiRoutineImport';

const equipmentLabels: Record<EquipmentType, string> = { smith: '스미스 머신', barbell: '바벨', dumbbell: '덤벨', machine: '머신', cable: '케이블', bodyweight: '맨몸', other: '기타' };
const modeLabels: Record<ExecutionMode, string> = { bilateral: '양측', unilateral: '편측', alternating: '교대' };
const loadLabels: Record<LoadType, string> = { 'plate-loaded': '플레이트', 'pin-loaded': '핀머신', barbell: '바벨', dumbbell: '덤벨', cable: '케이블', bodyweight: '맨몸', other: '기타' };
type ImportState = { kind: 'input' } | { kind: 'preview'; draft: ImportedWorkout };

export function AiRoutineImportPanel({ onStart }: { onStart: (session: WorkoutSession) => void }) {
  const [input, setInput] = useState('');
  const [state, setState] = useState<ImportState>({ kind: 'input' });
  const [message, setMessage] = useState('');
  const [queries, setQueries] = useState<Record<number, string>>({});
  const custom = loadCustomExercises();
  const catalog = [...custom, ...EXERCISES_DATABASE.filter(item => !custom.some(entry => entry.id === item.id))];
  const field = 'w-full min-w-0 rounded-xl border border-black/15 dark:border-white/20 bg-white dark:bg-[#302B37] p-3 text-sm';
  const button = 'min-h-[44px] rounded-xl bg-accent/10 px-3 py-2 text-sm font-bold text-accent dark:text-accent-light';
  const updateInput = (value: string) => { setInput(value); setState({ kind: 'input' }); setMessage(''); setQueries({}); };
  const preview = () => {
    try { setState({ kind: 'preview', draft: parseImportedWorkout(input, catalog) }); setMessage(''); }
    catch (error) { setState({ kind: 'input' }); setMessage(error instanceof Error ? error.message : 'AI 루틴 형식을 확인하세요. 예시의 표 또는 JSON 형식을 사용하세요.'); }
  };
  const copyPrompt = async () => setMessage(await copyText(buildAiRoutinePrompt()) ? 'AI 요청문을 복사했습니다.' : '복사하지 못했습니다. 예시를 직접 복사하세요.');
  return <section data-ai-routine className="soft-surface p-4 bg-white dark:bg-[#1E1B24] space-y-3">
    <h3 className="text-sm font-bold">{t('외부 AI로 루틴 준비하기')}</h3>
    <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{t('질문을 복사해 ChatGPT 등 외부 AI에 붙여넣고 대화한 뒤, 완성된 루틴을 가져오세요.')}</p>
    <button data-ai-routine-copy type="button" className={`${button} w-full`} onClick={copyPrompt}>{t('외부 AI용 질문 복사')}</button>
    <details data-ai-routine-paste className="space-y-3">
    <summary className="cursor-pointer text-sm font-bold">{t('AI 루틴 붙여넣기')}</summary>
    <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{t('AI가 만든 JSON 또는 Markdown 표를 붙여넣고 종목과 세트를 확인하세요.')}</p>
    <details className="text-xs space-y-2">
      <summary className="cursor-pointer font-semibold">{t('지원 형식과 AI 요청문')}</summary>
      <p>{t('JSON은 title과 exercises를 사용합니다. 종목마다 name, sets, reps, weight, restSeconds, weightUnit을 지정하세요. sets에는 세트별 객체 배열도 사용할 수 있습니다.')}</p>
      <p>{t('종목은 최대 50개, 종목당 세트는 최대 50개입니다. 반복수는 1~1000, 무게는 0~2000, 휴식은 0~3600초입니다. 생략하면 3세트, 10회, 0kg, 90초를 사용합니다.')}</p>
      <p>{t('선택 필드: 루틴 notes, 종목 equipmentType·executionMode·loadType·notes, 세트 rpe·tempo·comment·side. RPE는 6~10에서 0.5 단위, tempo는 eccentric·pause·concentric 각각 0~30초입니다.')}</p>
      <p>{t('executionMode는 bilateral·unilateral·alternating, loadType은 pin-loaded·plate-loaded·barbell·dumbbell·cable·bodyweight·other, equipmentType은 smith·barbell·dumbbell·machine·cable·bodyweight·other입니다. side는 left·right·both이며 단위는 종목별로 지정합니다.')} </p>
      <p>{t('Markdown 선택 열: rpe, tempo, notes, comment, executionMode, loadType, equipmentType, side, unit. tempo는 3-1-1처럼 작성하세요.')} </p>
      <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-black/5 dark:bg-white/5 p-2">{AI_ROUTINE_EXAMPLE}</pre>
      <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-black/5 dark:bg-white/5 p-2">{AI_ROUTINE_MARKDOWN_EXAMPLE}</pre>
      <p>{t('Markdown 표는 name, sets, reps 열이 필요합니다. weight와 rest는 선택입니다. 한국어 열 이름도 지원합니다. 범위 대신 숫자 하나를 써주세요.')}</p>
    </details>
    <label className="block text-xs font-semibold space-y-2">
      <span>{t('루틴 Markdown 또는 JSON')}</span>
      <textarea data-ai-routine-input aria-label={t('루틴 Markdown 또는 JSON')} rows={7} maxLength={100000} className={field} value={input} onChange={event => updateInput(event.target.value)} />
    </label>
    <div className="flex flex-wrap gap-2">
      <button data-ai-routine-preview-button type="button" className={button} onClick={preview} disabled={!input.trim()}>{t('구성 확인')}</button>
      <button type="button" className={button} onClick={() => updateInput(AI_ROUTINE_EXAMPLE)}>{t('JSON 예시 넣기')}</button>
      <button type="button" className={button} onClick={() => updateInput(AI_ROUTINE_MARKDOWN_EXAMPLE)}>{t('Markdown 예시 넣기')}</button>
    </div>
    {state.kind === 'preview' && <section data-ai-routine-preview className="space-y-3 border-t border-black/10 dark:border-white/10 pt-3" aria-label={t('가져오기 미리보기')}>
      <h3 className="font-bold break-words">{state.draft.title === 'AI 루틴' ? t('AI 루틴') : state.draft.title}</h3>
      {state.draft.notes && <p className="whitespace-pre-wrap break-words text-xs">{t('메모')} · {state.draft.notes}</p>}
      <ol className="space-y-3">
        {state.draft.exercises.map((row, index) => {
          const selected = catalog.find(item => item.id === row.exerciseId);
          const equipmentType = row.equipmentType || selected?.equipment;
          const loadType = row.loadType || selected?.loadType || (equipmentType === 'machine' || equipmentType === 'smith' ? 'plate-loaded' : undefined);
          const query = queries[index] || '';
          const options = catalog.filter(item => item.id === row.exerciseId || matchesExerciseSearch(item, query));
          return <li key={index} className="space-y-2 rounded-xl bg-black/5 dark:bg-white/5 p-3">
            <p className="break-words text-sm font-semibold">{index + 1}. {row.sourceName}</p>
            {!row.exerciseId && <p className="text-xs text-orange-600 dark:text-orange-400">{t('일치하는 종목을 확인할 수 없습니다. 직접 선택하세요.')}</p>}
            <label className="block text-xs space-y-1"><span>{t('종목 검색')}</span><input className={field} value={query} onChange={event => setQueries(previous => ({ ...previous, [index]: event.target.value }))} /></label>
            <label className="block text-xs space-y-1"><span>{t('적용할 종목')}</span><select data-ai-exercise-select className={field} value={row.exerciseId || ''} onChange={event => {
              const exerciseId = event.target.value || null;
              setState({ kind: 'preview', draft: { ...state.draft, exercises: state.draft.exercises.map((item, i) => i === index ? { ...item, exerciseId } : item) } });
            }}><option value="">{t('종목을 선택하세요.')}</option>{options.map(item => <option key={item.id} value={item.id}>{displayExercise(item)}</option>)}</select></label>
            <p className="text-xs">{t(modeLabels[row.executionMode])}{equipmentType && ` · ${t(equipmentLabels[equipmentType])}`}{loadType && ` · ${t(loadLabels[loadType])}`}</p>
            {row.notes && <p className="whitespace-pre-wrap break-words text-xs">{t('메모')} · {row.notes}</p>}
            <p className="text-xs font-semibold">{row.sets.length} {t('세트')} · {row.weightUnit}</p>
            <ol className="text-xs text-gray-600 dark:text-gray-300 space-y-1">{row.sets.map((set, i) => <li key={i}>{i + 1}. {set.weight}{row.weightUnit} · {set.reps} {t('회')} · {t('권장 휴식')} {set.restSeconds >= 60 ? `${Math.floor(set.restSeconds / 60)}${t('분')} ` : ''}{set.restSeconds % 60 > 0 || set.restSeconds === 0 ? `${set.restSeconds % 60}${t('초')}` : ''}{set.rpe !== undefined && ` · RPE ${set.rpe}`}{set.tempo && ` · ${t('템포')} ${set.tempo.eccentric}-${set.tempo.pause}-${set.tempo.concentric}`}{set.side && ` · ${t(set.side === 'left' ? '왼쪽' : set.side === 'right' ? '오른쪽' : '양쪽')}`}{set.comment && <p className="whitespace-pre-wrap break-words">{set.comment}</p>}</li>)}</ol>
          </li>;
        })}
      </ol>
      <p className="text-xs text-gray-500 dark:text-gray-400">{t('모든 세트는 미완료로 시작합니다. 무게와 횟수는 시작 후 수정할 수 있습니다.')}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{t('기본은 양측 기록입니다. 한팔·한발 종목도 좌우를 합쳐 기록하며, 원하면 시작 후 운동 설정에서 좌우 개별 기록으로 바꿀 수 있습니다.')}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{t('권장 휴식은 타이머의 기본값입니다. 직접 조절하거나 종료할 수 있으며 실제 쉰 시간은 따로 기록됩니다.')}</p>
      <button data-ai-routine-start type="button" className={`${button} w-full disabled:opacity-40`} disabled={state.draft.exercises.some(row => !row.exerciseId)} onClick={() => {
        try { onStart(sessionFromImportedWorkout(state.draft, catalog)); }
        catch (error) { setMessage(error instanceof Error ? error.message : '모든 종목을 선택하세요.'); }
      }}>{t('이 루틴으로 운동 시작')}</button>
    </section>}
    </details>
    {message && <p role="status" className="text-sm text-orange-600 dark:text-orange-400">{t(message)}</p>}
  </section>;
}
