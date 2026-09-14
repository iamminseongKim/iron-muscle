import { LoadType } from '../types/workout';

export const GYM_EQUIPMENT_STORAGE_KEY = 'iron_gym_equipment_profile_v1';
export const GYM_EQUIPMENT_CHANGE_EVENT = 'iron_gym_equipment_change';

export const MAX_GYMS_COUNT = 3;

export interface GymMachineConfig {
  exerciseId: string;
  brand?: string;
  loadType?: LoadType;
  machineSetting?: string;
}

export interface GymEquipmentProfile {
  id: string;
  name: string;
  includeFreeWeights: boolean;
  machines: Record<string, GymMachineConfig>;
  updatedAt: string;
}

export interface MultiGymState {
  activeGymId: string;
  gyms: GymEquipmentProfile[];
}

const createDefaultGym = (id: string = 'gym-1', name: string = '내 헬스장'): GymEquipmentProfile => ({
  id,
  name,
  includeFreeWeights: true,
  machines: {},
  updatedAt: new Date().toISOString(),
});

export function loadGymState(): MultiGymState {
  try {
    const raw = localStorage.getItem(GYM_EQUIPMENT_STORAGE_KEY);
    if (!raw) {
      const initialGym = createDefaultGym('gym-1', '내 헬스장');
      return { activeGymId: initialGym.id, gyms: [initialGym] };
    }
    const parsed = JSON.parse(raw);

    // 구버전 단일 프로필 마이그레이션
    if (!parsed.gyms || !Array.isArray(parsed.gyms)) {
      const singleGym: GymEquipmentProfile = {
        id: parsed.id || 'gym-1',
        name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : '내 헬스장',
        includeFreeWeights: typeof parsed.includeFreeWeights === 'boolean' ? parsed.includeFreeWeights : true,
        machines: parsed.machines && typeof parsed.machines === 'object' ? parsed.machines : {},
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      };
      return { activeGymId: singleGym.id, gyms: [singleGym] };
    }

    const gyms: GymEquipmentProfile[] = parsed.gyms.slice(0, MAX_GYMS_COUNT).map((g: any, idx: number) => ({
      id: g.id || `gym-${idx + 1}`,
      name: typeof g.name === 'string' && g.name.trim() ? g.name.trim() : `헬스장 ${idx + 1}`,
      includeFreeWeights: typeof g.includeFreeWeights === 'boolean' ? g.includeFreeWeights : true,
      machines: g.machines && typeof g.machines === 'object' ? g.machines : {},
      updatedAt: g.updatedAt || new Date().toISOString(),
    }));

    if (gyms.length === 0) {
      const initialGym = createDefaultGym('gym-1', '내 헬스장');
      return { activeGymId: initialGym.id, gyms: [initialGym] };
    }

    const activeGymId = gyms.some(g => g.id === parsed.activeGymId)
      ? parsed.activeGymId
      : gyms[0].id;

    return { activeGymId, gyms };
  } catch {
    const initialGym = createDefaultGym('gym-1', '내 헬스장');
    return { activeGymId: initialGym.id, gyms: [initialGym] };
  }
}

export function saveGymState(state: MultiGymState): void {
  try {
    localStorage.setItem(GYM_EQUIPMENT_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(GYM_EQUIPMENT_CHANGE_EVENT, { detail: state }));
  } catch (err) {
    console.error('Failed to save gym state:', err);
  }
}

export function getActiveGym(): GymEquipmentProfile {
  const state = loadGymState();
  return state.gyms.find(g => g.id === state.activeGymId) || state.gyms[0];
}

// 기존 단일 함수 하위 호환
export function loadGymProfile(): GymEquipmentProfile {
  return getActiveGym();
}

export function saveGymProfile(profile: GymEquipmentProfile): void {
  const state = loadGymState();
  const index = state.gyms.findIndex(g => g.id === profile.id);
  let nextGyms: GymEquipmentProfile[];
  if (index >= 0) {
    nextGyms = [...state.gyms];
    nextGyms[index] = { ...profile, updatedAt: new Date().toISOString() };
  } else {
    nextGyms = [...state.gyms, { ...profile, updatedAt: new Date().toISOString() }].slice(0, MAX_GYMS_COUNT);
  }
  saveGymState({
    activeGymId: profile.id || state.activeGymId,
    gyms: nextGyms,
  });
}

export function addGym(name: string): GymEquipmentProfile | null {
  const state = loadGymState();
  if (state.gyms.length >= MAX_GYMS_COUNT) return null;
  const newGym = createDefaultGym(`gym-${Date.now()}`, name.trim() || `헬스장 ${state.gyms.length + 1}`);
  const nextGyms = [...state.gyms, newGym];
  saveGymState({
    activeGymId: newGym.id,
    gyms: nextGyms,
  });
  return newGym;
}

export function removeGym(gymId: string): boolean {
  const state = loadGymState();
  if (state.gyms.length <= 1) return false; // 최소 1개 유지
  const nextGyms = state.gyms.filter(g => g.id !== gymId);
  const nextActiveId = state.activeGymId === gymId ? nextGyms[0].id : state.activeGymId;
  saveGymState({
    activeGymId: nextActiveId,
    gyms: nextGyms,
  });
  return true;
}

export function switchActiveGym(gymId: string): void {
  const state = loadGymState();
  if (state.gyms.some(g => g.id === gymId)) {
    saveGymState({
      ...state,
      activeGymId: gymId,
    });
  }
}

export function isExerciseInGymProfile(
  exerciseId: string,
  equipment: string,
  profile: GymEquipmentProfile
): boolean {
  if (profile.includeFreeWeights && (equipment === 'barbell' || equipment === 'dumbbell' || equipment === 'bodyweight')) {
    return true;
  }
  return Boolean(profile.machines[exerciseId]);
}
