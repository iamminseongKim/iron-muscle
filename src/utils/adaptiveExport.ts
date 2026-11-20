import { displayExercise, displayMuscle, getLanguage, t } from '../i18n';
import type { Language } from '../i18n';
import messages from '../i18n/exportMessages.json';
import adaptiveMessages from '../i18n/adaptiveMessages.json';
import type { WorkoutSession, WorkoutSet } from '../types/workout';
import { resolveRecordedExercise } from './exerciseResolver';
import { actualRpe, isWorkingSet } from './adaptiveTraining';
import { resolveWorkoutInterval } from './workoutIntervals';
import { getGroupRoundNumber } from './workoutGroups';
import { compareExercise, summarizeAdaptiveSession } from './adaptiveAnalysis';
import { calculate1RM } from './calculations';

const cell = (value: unknown) => String(value).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
const tempo = (value: WorkoutSet['tempo']) => value ? `${value.eccentric}-${value.pause}-${value.concentric}` : null;
export function adaptiveExport(sessions: WorkoutSession[], language: Language = getLanguage(), history: WorkoutSession[] = sessions): string {
  const m = messages[language];
  const a = adaptiveMessages[language];
  const value = (raw: unknown) => raw === undefined || raw === null || raw === '' ? a.missing : cell(raw);
  const typed = (raw: WorkoutSet['setType']) => raw ? a[raw] : a.UNSPECIFIED;
  if (!sessions.length) return `# Iron Muscle Tracker v3.0\n\n${m.empty}\n`;
  let md = `# Iron Muscle Tracker v3.0 · ${m.title}\n\n## ${m.rules}\n\n- ${m.perHand}. ${m.platesOnly}.\n- ${m.volumeNote}.\n- ${a.unknown}. ${a.missing}.\n`;
  if (sessions.some(session => session.exercises.some(exercise => exercise.groupId))) md += `- ${t('전환 시간은 라운드 휴식 목표와 비교하지 않습니다. 묶음의 모든 종목을 마친 뒤의 휴식만 라운드 휴식으로 평가하세요.', language)}\n`;
  for (const session of sessions) {
    const summary = summarizeAdaptiveSession(session);
    md += `\n## ${cell(session.date)} · ${cell(session.title)}\n\n`;
    const entries: [string, unknown][] = [
      [m.duration, `${Math.floor(session.durationSeconds / 60)} ${m.minutes}`], [a.program, session.programId], [a.week, session.programWeek],
      [a.phase, session.trainingPhase ? a[session.trainingPhase] : session.isDeload ? a.DELOAD : null], [a.goal, session.sessionGoal],
      [m.sets, summary.totalSets], [a.warmup, summary.warmupSets], [a.activation, summary.activationSets], [a.working, summary.workingSets], [a.unspecified, summary.unspecifiedSets],
      [a.totalReps, summary.totalReps], [m.volume, `${summary.totalVolume} kg`], [a.workingVolume, `${summary.workingVolume} kg`], [m.averageRpe, summary.averageRpe],
      [a.averageWorking, summary.workingAverageRpe], [a.maxRpe, summary.maxRpe], [a.failure, summary.failureSets],
    ];
    for (const [label, raw] of entries) md += `- ${label}: ${value(raw)}\n`;
    md += `- ${a.warmupDuration}: ${value(summary.warmupSeconds)} ${m.seconds}\n`;
    for (const [muscle, count] of Object.entries(summary.muscleWorkingSets)) if (count > 0) md += `- ${displayMuscle(muscle, language)} ${a.working}: ${count}\n`;
    if (session.notes) md += `- ${m.notes}: ${cell(session.notes)}\n`;
    if (session.conditionEmoji) md += `- ${m.condition}: ${cell(session.conditionEmoji)}\n`;
    if (session.checkIn) {
      md += `\n### ${a.checkIn}\n\n`;
      const fields = ['sleepHours', 'sleepQuality', 'hoursAwake', 'energy', 'fatigue', 'soreness', 'jointPain', 'preWorkoutMeal', 'notes'] as const;
      for (const key of fields) md += `- ${a[key]}: ${value(session.checkIn[key])}\n`;
    }
    if (session.sourceSessionContexts?.length) {
      md += `\n### ${a.program} · ${m.sessions}\n\n`;
      for (const context of session.sourceSessionContexts) {
        md += `- ID ${cell(context.sessionId)} · ${cell(context.startTime)} · ${a.program} ${value(context.programId)} · ${a.week} ${value(context.programWeek)} · ${a.phase} ${value(context.trainingPhase ? a[context.trainingPhase] : null)} · ${a.goal} ${value(context.sessionGoal)}\n`;
        if (context.checkIn) for (const key of ['sleepHours', 'sleepQuality', 'hoursAwake', 'energy', 'fatigue', 'soreness', 'jointPain', 'preWorkoutMeal', 'notes'] as const) {
          if (context.checkIn[key] !== undefined) md += `  - ${a[key]}: ${value(context.checkIn[key])}\n`;
        }
      }
    }
    const groupIds = [...new Set(session.exercises.flatMap(exercise => exercise.groupId ? [exercise.groupId] : []))];
    for (const [index, exercise] of session.exercises.entries()) {
      const base = resolveRecordedExercise(exercise);
      const unit = exercise.weightUnit || session.weightUnit || 'kg';
      md += `\n### ${index + 1}. ${cell(displayExercise(base, language))}\n\n`;
      if (exercise.groupId) {
        const members = session.exercises.filter(item => item.groupId === exercise.groupId);
        const token = `G${groupIds.indexOf(exercise.groupId) + 1}`;
        const kind = exercise.groupType === 'superset' ? '슈퍼세트' : exercise.groupType === 'giant' ? '자이언트세트' : '컴파운드세트';
        md += `- ${t('묶음', language)} ${token} · ${t(kind, language)} · ${t('묶음 내 순서', language)} ${members.findIndex(item => item.id === exercise.id) + 1}/${members.length}\n`;
        md += `- ${members.map(member => cell(displayExercise(resolveRecordedExercise(member), language))).join(' → ')}\n`;
      }
      if (exercise.equipmentType === 'dumbbell') md += `- ${m.perHand}\n`;
      if (exercise.equipmentType === 'smith') md += `- ${m.platesOnly}\n`;
      if (exercise.machineBrand) md += `- ${m.brand}: ${cell(exercise.machineBrand)}\n`;
      if (['machine', 'smith', 'cable'].includes(exercise.equipmentType) && !exercise.machineConfigId) md += `- ${a.equipmentUnknown}\n`;
      if (exercise.machineConfigId) md += `- ID: ${cell(exercise.machineConfigId)}\n`;
      if (exercise.machineSetting) md += `- ${m.setting}: ${cell(exercise.machineSetting)}\n`;
      if (exercise.notes) md += `- ${m.notes}: ${cell(exercise.notes)}\n`;
      for (const change of exercise.replacementHistory || []) {
        md += `- ${t('종목 교체 이력', language)}: ${cell(change.fromExerciseName || change.fromExerciseId)} → ${cell(change.toExerciseName || change.toExerciseId)} · ${cell(change.at)} · ${value(change.reason)}\n`;
        if (change.weightReset) md += `  - ${t('이전 종목의 계획 중량', language)} (${change.weightUnit})\n`;
      }
      const headings = [m.set, t('라운드', language), `${a.plan} ${a.type}`, `${a.actual} ${a.type}`, `${a.plan} ${m.weight}`, `${a.actual} ${m.weight}`, `${a.plan} ${m.reps}`, `${a.actual} ${m.reps}`, `${a.plan} RPE`, `${a.actual} RPE`, t('세트 완료 후 휴식 목표', language), t('세트 시작 전 휴식', language), t('종목 전환 시간', language), t('라운드 휴식', language), `${a.plan} ${m.tempo}`, `${a.actual} ${m.tempo}`, a.failure, a.stimulus, a.pain, m.estimated1rm, m.side, m.notes];
      md += `\n| ${headings.join(' | ')} |\n| ${headings.map(() => '---').join(' | ')} |\n`;
      for (const set of exercise.sets) {
        const performed = set.completed;
        const confirmed = set.provenance === 'recorded';
        const interval = resolveWorkoutInterval(session, exercise.id, set.id);
        const notes = [set.tempoSource === 'prescribed' ? t('처방 기준 템포', language) : '', set.targetRir === undefined ? '' : `${a.plan} RIR=${set.targetRir}`, set.plannedRepRange ? `${a.plan} ${m.reps}=${set.plannedRepRange.min}–${set.plannedRepRange.max}` : '', performed && set.assistedReps !== undefined ? `${t('보조 반복수', language)}=${set.assistedReps}` : '', !confirmed && set.tempo ? `${a.unknown} ${m.tempo}=${tempo(set.tempo)}` : '', set.plannedNotes ? `${a.plan}: ${set.plannedNotes}` : '', set.comment ? `${confirmed || set.commentSource === 'recorded' ? a.actual : a.unknown}: ${set.comment}` : '', ...(set.tags || []).map(tag => t(tag, language)), !confirmed || set.legacyRpe !== undefined ? `${a.unknown} RPE=${value(set.legacyRpe ?? set.rpe)}` : '', performed && (interval.kind === 'unknown' || interval.seconds === null) && set.restSeconds !== undefined ? `${a.unknown} ${interval.kind === 'transition' ? t('종목 전환 시간', language) : m.rest}=${value(set.restSeconds)}` : '', performed && set.timerRestSeconds !== undefined ? `${t('기록된 타이머 시간', language)}=${value(set.timerRestSeconds)} ${m.seconds}` : '', !performed ? m.pending : ''].filter(Boolean).join('; ');
        const values = [set.setNumber, exercise.groupId ? getGroupRoundNumber(exercise, set.id) : null, set.plannedSetType ? typed(set.plannedSetType) : null, performed ? typed(set.setType) : null, set.plannedWeight === undefined ? null : `${set.plannedWeight} ${set.plannedWeightUnit || unit}`, performed ? `${set.weight} ${unit}` : null,
          set.plannedReps, performed ? set.reps : null, set.targetRpe, actualRpe(set), set.plannedRestSeconds === undefined ? null : `${set.plannedRestSeconds} ${m.seconds}`,
          performed && interval.kind === 'rest' && interval.scope === 'between-sets' && interval.seconds !== null ? `${interval.seconds} ${m.seconds}` : null,
          performed && interval.kind === 'transition' && interval.seconds !== null ? `${interval.seconds} ${m.seconds}` : null,
          performed && interval.kind === 'rest' && interval.scope === 'round' && interval.seconds !== null ? `${interval.seconds} ${m.seconds}` : null, tempo(set.plannedTempo), performed && (confirmed || set.tempoSource === 'recorded') ? tempo(set.tempo) : null,
          performed && set.failureType ? a[set.failureType] : null, performed ? set.stimulusFeedback : null, performed && set.painFeedback ? `${cell(set.painFeedback.location)} ${set.painFeedback.intensity}/10` : null,
          performed && confirmed && isWorkingSet(set) && set.weight > 0 && set.reps > 0 ? `${calculate1RM(set.weight, set.reps)} ${unit}` : null,
          set.side ? m[set.side] : null, notes];
        md += `| ${values.map(value).join(' | ')} |\n`;
      }
      for (const set of exercise.sets) if (set.completed && set.dropSegments?.length) {
        md += `- #${set.setNumber} ${a.dropSegments}: ${set.dropSegments.map(segment => `${segment.weight} ${unit} × ${segment.reps}`).join('; ')}\n`;
      }
      if (exercise.feedback) {
        for (const key of ['stimulus', 'fatigue', 'compensation', 'painLocation', 'painIntensity', 'notes'] as const) {
          const feedback = exercise.feedback[key];
          if (feedback !== undefined && feedback !== '') md += `- ${a[key]}: ${value(feedback)}\n`;
        }
      }
      const { comparison, equipmentChanged } = compareExercise(exercise, session, history);
      if (equipmentChanged) md += `\n- ${a.equipmentChanged}\n`;
      if (comparison) {
        md += `\n#### ${a.previous} · ${cell(comparison.previousDate)}\n\n`;
        md += `- ${a.previous}: ${comparison.previousBest.weight} ${comparison.previousUnit} × ${comparison.previousBest.reps}\n- ${a.actual}: ${comparison.currentBest.weight} ${unit} × ${comparison.currentBest.reps}\n`;
        md += `- ${a.comparison}: ${m.weight} ${value(Math.round(comparison.weightDeltaKg * 100) / 100)} kg; ${m.reps} ${comparison.repDelta}; RPE ${value(comparison.rpeDelta)}; ${m.rest} ${value(comparison.restDelta)} ${m.seconds}; ${m.estimated1rm} ${value(comparison.estimated1RmDeltaKg)} kg\n`;
      }
    }
    md += `\n### ${a.quality}\n\n`;
    if (summary.issues.length) {
      if (summary.issues.includes('legacy-unknown')) md += `- ${a.unknown}\n`;
      if (summary.issues.includes('missing-rpe')) md += `- ${a.actual} RPE: ${a.missing}\n`;
      if (summary.issues.includes('unmeasured-rest')) md += `- ${a.actual} ${m.rest}: ${a.missing}\n`;
      if (summary.issues.includes('unspecified-type')) md += `- ${a.type}: ${a.UNSPECIFIED}\n`;
      for (const code of summary.issues.filter(code => !['legacy-unknown', 'missing-rpe', 'unmeasured-rest', 'unspecified-type'].includes(code))) md += `- ${value(a[code as 'duplicate-set' | 'long-rest' | 'weight-change' | 'paused-session'])}\n`;
    } else md += `- ${a.NONE}\n`;
    const observations = session.exercises.flatMap(exercise => exercise.sets.filter(set => set.completed).flatMap(set => {
      const rows: string[] = [];
      const rpe = actualRpe(set);
      if (rpe !== null && set.targetRpe !== undefined && Math.abs(rpe - set.targetRpe) >= 1) rows.push(`${a.plan} RPE ${set.targetRpe} / ${a.actual} RPE ${rpe}`);
      if ((set.painFeedback?.intensity || 0) > 0) rows.push(`${a.pain} ${value(set.painFeedback?.location)} ${set.painFeedback?.intensity}/10`);
      const interval = resolveWorkoutInterval(session, exercise.id, set.id);
      if (interval.kind === 'rest' && interval.seconds !== null && interval.plannedSeconds !== null && interval.seconds < interval.plannedSeconds) rows.push(`${a.actual} ${interval.scope === 'round' ? t('라운드 휴식', language) : m.rest} ${interval.seconds} < ${a.plan} ${interval.plannedSeconds}`);
      return rows.map(row => `${cell(displayExercise(resolveRecordedExercise(exercise), language))} #${set.setNumber}: ${row}`);
    }));
    if ((session.checkIn?.energy !== undefined && session.checkIn.energy <= 2) || (session.checkIn?.fatigue !== undefined && session.checkIn.fatigue >= 4) || (session.checkIn?.sleepHours !== undefined && session.checkIn.sleepHours < 6)) observations.unshift(a.lowReadiness);
    if (summary.workingSets && summary.failureSets) observations.push(`${a.failureShare}: ${summary.failureSets}/${summary.totalSets}`);
    if (summary.totalSets && summary.warmupSets + summary.activationSets) observations.push(`${a.warmupShare}: ${summary.warmupSets + summary.activationSets}/${summary.totalSets}`);
    md += `\n### ${a.observations}\n\n${observations.length ? observations.map(row => `- ${row}`).join('\n') : a.NONE}\n`;
  }
  md += `\n## ${m.feedback}\n\n${m.answer}\n\n${a.coachingRules}\n\n${a.phaseGuide}\n\n${a.outputFormat}\n`;
  return md;
}
