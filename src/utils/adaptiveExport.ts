import { displayExercise, displayMuscle, getLanguage, t } from '../i18n';
import type { Language } from '../i18n';
import messages from '../i18n/exportMessages.json';
import adaptiveMessages from '../i18n/adaptiveMessages.json';
import type { WorkoutSession, WorkoutSet } from '../types/workout';
import { resolveRecordedExercise } from './exerciseResolver';
import { actualRpe, actualRest, isWorkingSet } from './adaptiveTraining';
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
    for (const [index, exercise] of session.exercises.entries()) {
      const base = resolveRecordedExercise(exercise);
      const unit = exercise.weightUnit || session.weightUnit || 'kg';
      md += `\n### ${index + 1}. ${cell(displayExercise(base, language))}\n\n`;
      if (exercise.equipmentType === 'dumbbell') md += `- ${m.perHand}\n`;
      if (exercise.equipmentType === 'smith') md += `- ${m.platesOnly}\n`;
      if (exercise.machineBrand) md += `- ${m.brand}: ${cell(exercise.machineBrand)}\n`;
      if (['machine', 'smith', 'cable'].includes(exercise.equipmentType) && !exercise.machineConfigId) md += `- ${a.equipmentUnknown}\n`;
      if (exercise.machineConfigId) md += `- ID: ${cell(exercise.machineConfigId)}\n`;
      if (exercise.machineSetting) md += `- ${m.setting}: ${cell(exercise.machineSetting)}\n`;
      if (exercise.notes) md += `- ${m.notes}: ${cell(exercise.notes)}\n`;
      const headings = [m.set, `${a.plan} ${a.type}`, `${a.actual} ${a.type}`, `${a.plan} ${m.weight}`, `${a.actual} ${m.weight}`, `${a.plan} ${m.reps}`, `${a.actual} ${m.reps}`, `${a.plan} RPE`, `${a.actual} RPE`, `${a.plan} ${m.rest}`, `${a.actual} ${m.rest}`, `${a.plan} ${m.tempo}`, `${a.actual} ${m.tempo}`, a.failure, a.stimulus, a.pain, m.estimated1rm, m.side, m.notes];
      md += `\n| ${headings.join(' | ')} |\n| ${headings.map(() => '---').join(' | ')} |\n`;
      for (const set of exercise.sets) {
        const performed = set.completed;
        const confirmed = set.provenance === 'recorded';
        const notes = [!confirmed && set.tempo ? `${a.unknown} ${m.tempo}=${tempo(set.tempo)}` : '', set.plannedNotes ? `${a.plan}: ${set.plannedNotes}` : '', set.comment ? `${confirmed || set.commentSource === 'recorded' ? a.actual : a.unknown}: ${set.comment}` : '', ...(set.tags || []).map(tag => t(tag, language)), !confirmed || set.legacyRpe !== undefined ? `${a.unknown} RPE=${value(set.legacyRpe ?? set.rpe)}` : '', actualRest(set) === null && set.restSeconds !== undefined ? `${a.unknown} ${m.rest}=${value(set.restSeconds)}` : '', !performed ? m.pending : ''].filter(Boolean).join('; ');
        const values = [set.setNumber, set.plannedSetType ? typed(set.plannedSetType) : null, performed ? typed(set.setType) : null, set.plannedWeight === undefined ? null : `${set.plannedWeight} ${unit}`, performed ? `${set.weight} ${unit}` : null,
          set.plannedReps, performed ? set.reps : null, set.targetRpe, actualRpe(set), set.plannedRestSeconds === undefined ? null : `${set.plannedRestSeconds} ${m.seconds}`,
          actualRest(set) !== null ? `${actualRest(set)} ${m.seconds}` : null, tempo(set.plannedTempo), performed && (confirmed || set.tempoSource === 'recorded') ? tempo(set.tempo) : null,
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
      if (actualRest(set) !== null && set.plannedRestSeconds !== undefined && actualRest(set)! < set.plannedRestSeconds) rows.push(`${a.actual} ${m.rest} ${set.restSeconds} < ${a.plan} ${set.plannedRestSeconds}`);
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
