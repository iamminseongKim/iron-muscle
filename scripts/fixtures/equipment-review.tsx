import React from 'react';
import { createRoot } from 'react-dom/client';
import { GymEquipmentModal } from '../../src/components/profile/GymEquipmentModal';
import { AddExerciseModal } from '../../src/components/workout/AddExerciseModal';
import { setLanguage } from '../../src/i18n';
import { saveGymState } from '../../src/utils/gymStorage';
const host = document.createElement('div');
document.body.append(host);
const root = createRoot(host);
export function setup() {
 setLanguage('ko');
 saveGymState({activeGymId:'test',gyms:[{id:'test',name:'테스트',includeFreeWeights:true,updatedAt:new Date().toISOString(),machines:{Machine_Bench_Press:[{id:'one',exerciseId:'Machine_Bench_Press',brand:'기타 (직접 입력)',weightUnit:'lbs',loadType:'pin-loaded',machineSetting:'Seat 3'},{id:'two',exerciseId:'Machine_Bench_Press',brand:'Other brand'}]}}]});
}
export function gym(key=0) { root.render(<GymEquipmentModal key={key} isOpen onClose={()=>root.render(null)} />); }
export function picker() { root.render(<AddExerciseModal isOpen onClose={()=>root.render(null)} onSelect={()=>{}} />); }
