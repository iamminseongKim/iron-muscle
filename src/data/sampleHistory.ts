import { WorkoutSession } from '../types/workout';

export const INITIAL_SAMPLE_HISTORY: WorkoutSession[] = [
  {
    id: 'session-20260901',
    title: '하체 & 등 파워 데이',
    date: '2026-09-01',
    startTime: '2026-09-01T09:30:00Z',
    endTime: '2026-09-01T10:45:00Z',
    durationSeconds: 4500,
    conditionEmoji: '🔥',
    isDeload: false,
    overallRpe: 8.5,
    notes: '컨디션 최상. 스모 데드리프트 세컨드 풀 궤적 좋았음.',
    completed: true,
    exercises: [
      {
        id: 'ex-1',
        exerciseId: 'conventional-deadlift',
        equipmentType: 'barbell',
        sets: [
          { id: 's1', setNumber: 1, weight: 60, reps: 10, completed: true, rpe: 7.0, tags: ['웜업'], comment: '가볍게 워밍업' },
          { id: 's2', setNumber: 2, weight: 100, reps: 6, completed: true, rpe: 8.0, tags: ['탑세트'] },
          { id: 's3', setNumber: 3, weight: 140, reps: 3, completed: true, rpe: 9.0, tags: ['탑세트'], comment: '그립 견고하게 유지' }
        ]
      },
      {
        id: 'ex-2',
        exerciseId: 'leg-press',
        equipmentType: 'machine',
        machineBrand: 'Cybex (싸이벡스)',
        machineSetting: '등받이 2단, 발판 중간',
        sets: [
          { id: 's4', setNumber: 1, weight: 160, reps: 12, completed: true, rpe: 8.0 },
          { id: 's5', setNumber: 2, weight: 200, reps: 10, completed: true, rpe: 8.5 },
          { id: 's6', setNumber: 3, weight: 240, reps: 8, completed: true, rpe: 9.5, tags: ['실패지점'] }
        ]
      }
    ]
  },
  {
    id: 'session-20260904',
    title: '가슴 & 어깨 볼륨',
    date: '2026-09-04',
    startTime: '2026-09-04T18:00:00Z',
    endTime: '2026-09-04T19:15:00Z',
    durationSeconds: 4500,
    conditionEmoji: '💪',
    isDeload: false,
    overallRpe: 8.0,
    notes: '가슴 수축감 훌륭함. 체스트 프레스 머신 펌핑감 최고.',
    completed: true,
    exercises: [
      {
        id: 'ex-3',
        exerciseId: 'bench-press',
        equipmentType: 'barbell',
        sets: [
          { id: 's7', setNumber: 1, weight: 60, reps: 10, completed: true, rpe: 7.5 },
          { id: 's8', setNumber: 2, weight: 80, reps: 8, completed: true, rpe: 8.5 },
          { id: 's9', setNumber: 3, weight: 90, reps: 5, completed: true, rpe: 9.5 }
        ]
      },
      {
        id: 'ex-4',
        exerciseId: 'machine-chest-press',
        equipmentType: 'machine',
        machineBrand: 'Hammer Strength (해머 스트렝스)',
        machineSetting: '의자 3단',
        sets: [
          { id: 's10', setNumber: 1, weight: 50, reps: 12, completed: true, rpe: 8.0 },
          { id: 's11', setNumber: 2, weight: 60, reps: 10, completed: true, rpe: 8.5 },
          { id: 's12', setNumber: 3, weight: 70, reps: 8, completed: true, rpe: 9.0 }
        ]
      }
    ]
  }
];
