import React from 'react';
import { createRoot } from 'react-dom/client';
import { WorkoutShareCard } from '../../src/components/history/WorkoutShareCard';
import { AddExerciseModal } from '../../src/components/workout/AddExerciseModal';
import { ExerciseCard } from '../../src/components/workout/ExerciseCard';
import { setLanguage } from '../../src/i18n';
import { saveGymState } from '../../src/utils/gymStorage';

const host = document.createElement('div');
document.getElementById('root')!.style.display = 'none';
document.body.append(host);
const root = createRoot(host);
const noop = () => {};
export const item = {id:'e1',exerciseId:'Machine_Bench_Press',equipmentType:'machine' as const,machineConfigId:'gym-1:a',machineBrand:'Same brand',machineSetting:'Seat 3',weightUnit:'kg' as const,sets:[{id:'s1',setNumber:1,weight:20,reps:10,completed:false}]};
export function setup() {
  setLanguage('ko');
  saveGymState({activeGymId:'gym-1',gyms:[{id:'gym-1',name:'Test gym',includeFreeWeights:true,updatedAt:'2026-09-14',machines:{'Machine_Bench_Press':[
    {id:'a',exerciseId:'Machine_Bench_Press',brand:'Same brand',weightUnit:'kg',machineSetting:'Seat 3'},
    {id:'b',exerciseId:'Machine_Bench_Press',brand:'Same brand',weightUnit:'lbs'},
  ]}}]});
}
export function picker(open: boolean) {
  root.render(<AddExerciseModal isOpen={open} onClose={noop} onSelect={(...args) => { (window as any).selectedMachine = args; }} />);
}
export function machine(completed = false) {
  root.render(<ExerciseCard exerciseItem={{...item,sets:[{...item.sets[0],completed}]}} onUpdate={value => { (window as any).updatedMachine = value; }} onDelete={noop} onTriggerRestTimer={noop} onOpenRpeGuide={noop}/>);
}
export function share() {
  root.render(<WorkoutShareCard sessions={[{id:'session',title:'Test',date:'2026-09-14',durationSeconds:600,exercises:[{...item,sets:[{...item.sets[0],completed:true}]}],completed:true}]} date="2026-09-14" unit="kg" onClose={noop}/>);
}
