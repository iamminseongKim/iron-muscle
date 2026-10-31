export interface AdaptiveSettings {
  feedback: boolean;
  detailedFeedback: boolean;
  suggestions: boolean;
  sound: boolean;
  vibration: boolean;
  keepAwake: boolean;
}

const defaults: AdaptiveSettings = {
  feedback: true, detailedFeedback: false, suggestions: true,
  sound: true, vibration: true, keepAwake: false,
};
const names = ['feedback', 'detailedFeedback', 'suggestions', 'sound', 'vibration', 'keepAwake'] as const;
const key = 'iron_adaptive_settings_v1';
export const ADAPTIVE_SETTINGS_CHANGE = 'iron_adaptive_settings_change';

export function loadAdaptiveSettings(): AdaptiveSettings {
  const settings = { ...defaults };
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(key) || '{}');
    if (typeof saved !== 'object' || saved === null || Array.isArray(saved)) return settings;
    const input = saved as Record<string, unknown>;
    for (const name of names) {
      if (typeof input[name] === 'boolean') settings[name] = input[name];
    }
  } catch {}
  return settings;
}

export function saveAdaptiveSettings(patch: Partial<AdaptiveSettings>): void {
  localStorage.setItem(key, JSON.stringify({ ...loadAdaptiveSettings(), ...patch }));
  window.dispatchEvent(new Event(ADAPTIVE_SETTINGS_CHANGE));
}
