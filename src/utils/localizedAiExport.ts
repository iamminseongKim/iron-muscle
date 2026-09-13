import messages from '../i18n/exportMessages.json';
import prompts from '../i18n/coachingMessages.json';
import { getLanguage, Language, t } from '../i18n';
import { WorkoutSession } from '../types/workout';
import type { AiExportOptions } from './aiPromptGenerator';
import { resolveRecordedExercise } from './exerciseResolver';
import { calculateSessionVolume, calculateSessionReps, calculateAverageRPE } from './calculations';

export const exportText = (language: Language = getLanguage()) => messages[language];
const cell = (value: unknown) => String(value ?? '-').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
export function localizedAiExport(sessions: WorkoutSession[], options: AiExportOptions, language: Exclude<Language, 'ko'>): string {
  const m = messages[language];
  const part = options.selectedBodyPart || 'all';
  const count = sessions.reduce((sum,s) => sum + s.exercises.reduce((n,e)=> n+e.sets.length,0),0);
  const volume = sessions.reduce((sum,s)=>sum+calculateSessionVolume(s),0);
  const reps = sessions.reduce((sum,s)=>sum+calculateSessionReps(s),0);
  const number = (n: number) => n.toLocaleString(language);
  let md = `# Iron Muscle Tracker · ${m.title}\n\n`;
  if (!sessions.length) return md + m.empty;
  const dates = sessions.map(s=>s.date).sort();
  md += `> **${m.mode}**: ${m[part]} / ${options.scope === 'all' ? m.allTime : m[options.scope]}\n`;
  md += `> **${m.period}**: ${dates[0]} – ${dates[dates.length-1]}\n`;
  md += `> **${m.sessions}**: ${sessions.length} / **${m.sets}**: ${count}\n`;
  md += `> **${m.volume}**: ${number(volume)} kg / **${m.reps}**: ${number(reps)}\n\n`;
  md += `### ${m.rules}\n1. ${m.dumbbellRule}\n2. ${m.smithRule}\n\n---\n\n`;
  sessions.forEach((session,index)=>{
    md += `## ${m.session} ${index+1}: ${session.date}${session.title ? ` (${cell(session.title)})` : ''}\n`;
    md += `- **${m.duration}**: ${Math.round(session.durationSeconds/60)} ${m.minutes} / **${m.condition}**: ${session.conditionEmoji || '-'} / **${m.volume}**: ${number(calculateSessionVolume(session))} kg / **${m.averageRpe}**: ${calculateAverageRPE(session) ?? '-'}\n`;
    if(session.isDeload) md += `- ${m.deload}\n`;
    if(session.notes) md += `- **${m.notes}**: ${cell(session.notes)}\n`;
    const groups = new Map<string,number>();
    session.exercises.forEach((exercise,exIndex)=>{
      const base=resolveRecordedExercise(exercise);
      // Catalog names use their international English standard; custom names are preserved.
      const name = base.nameEn || base.name;
      const load = exercise.loadType || exercise.equipmentType;
      const group = exercise.groupId && exercise.groupType && exercise.groupType !== 'single';
      if(group&&!groups.has(exercise.groupId!))groups.set(exercise.groupId!,groups.size+1);
      const groupLabel=group?` [${m[exercise.groupType as 'superset'|'compound'|'giant']} ${groups.get(exercise.groupId!)}]`:'';
      const isDumbbell=exercise.equipmentType==='dumbbell'||base.equipment==='dumbbell';
      const isSmith=/smith/i.test(base.nameEn);
      const mode=exercise.executionMode||'bilateral';
      md+=`\n### ${exIndex+1}. ${cell(name)}${groupLabel} (${m[load]} / ${m[mode]})\n`;
      if(isDumbbell)md+=`- ${m.perHand}\n`;
      if(isSmith)md+=`- ${m.platesOnly}\n`;
      if(exercise.machineBrand)md+=`- **${m.brand}**: ${cell(exercise.machineBrand)}\n`;
      if(exercise.machineSetting)md+=`- **${m.setting}**: ${cell(exercise.machineSetting)}\n`;
      if(exercise.notes)md+=`- **${m.notes}**: ${cell(exercise.notes)}\n`;
      const unit=exercise.weightUnit||'kg';
      const headings=[m.set,`${m.weight} (${unit})`,m.reps,m.estimated1rm,'RPE',m.tempo,m.rest,m.side,m.complete,m.tags];
      md+=`\n| ${headings.join(' | ')} |\n| ${headings.map(()=>'---').join(' | ')} |\n`;
      for(const set of exercise.sets){
        const tempo=set.tempo?`${set.tempo.eccentric}-${set.tempo.pause}-${set.tempo.concentric} ${m.seconds}`:'-';
        const rest=set.restSeconds!==undefined?`${set.restSeconds} ${m.seconds}`:'-';
        const side=set.side?m[set.side]:'-';
        const notes=[...(set.tags||[]).map(tag => t(tag, language)),set.comment].filter(Boolean).join(', ')||'-';
        const values=[`#${set.setNumber}`,`${set.weight} ${unit}`,set.reps,`${Math.round(set.weight*(1+set.reps/30))} ${unit}`,set.rpe??'-',tempo,rest,side,set.completed?m.complete:m.pending,notes];
        md+=`| ${values.map(cell).join(' | ')} |\n`;
      }
    });
    md+='\n---\n\n';
  });
  const promptKey = part === 'all' ? options.scope === 'day' ? 'day' : options.scope === 'week' ? 'week' : 'long' : part === 'biceps'||part==='triceps' ? 'arms' : part;
  md+=`## ${m.feedback}\n\n${m.answer}\n\n**${m.mode}**: ${m[part]}\n\n`;
  md+=prompts[language][promptKey].map((line,i)=>`${i+1}. ${line}`).join('\n');
  return md+'\n';
}
