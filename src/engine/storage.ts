import type { AdaptiveProfile, AppSettings, SessionStats } from '../types';
import { defaultPreset, defaultSettings } from '../settings';
import { emptySessionStats } from './session';

const SETTINGS_KEY = 'bj-trainer-settings-v1';
const STATS_KEY = 'bj-trainer-stats-v1';
const ADAPTIVE_KEY = 'bj-trainer-adaptive-v1';

export const defaultAdaptive = (): AdaptiveProfile => ({ leakWeights: {}, scenarioMistakes: {} });

export const loadSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw), preset: { ...defaultPreset, ...JSON.parse(raw).preset } };
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (settings: AppSettings): void => localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

export const loadStats = (): SessionStats => {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return emptySessionStats();
    return { ...emptySessionStats(), ...JSON.parse(raw) };
  } catch {
    return emptySessionStats();
  }
};

export const saveStats = (stats: SessionStats): void => localStorage.setItem(STATS_KEY, JSON.stringify(stats));

export const loadAdaptive = (): AdaptiveProfile => {
  try {
    const raw = localStorage.getItem(ADAPTIVE_KEY);
    if (!raw) return defaultAdaptive();
    return { ...defaultAdaptive(), ...JSON.parse(raw) };
  } catch {
    return defaultAdaptive();
  }
};

export const saveAdaptive = (profile: AdaptiveProfile): void => localStorage.setItem(ADAPTIVE_KEY, JSON.stringify(profile));
