import type { AppSettings, RulePreset } from './types';

export const defaultPreset: RulePreset = {
  id: 'multi-s17-no-das-surr',
  label: 'Multi-deck S17 / No DAS / Surrender ON',
  dealerHitsSoft17: false,
  doubleAfterSplit: false,
  surrender: true,
};

export const defaultSettings: AppSettings = {
  drillMode: 'mixed',
  adaptiveEnabled: true,
  learnMode: true,
  showCoachPanel: true,
  showHints: true,
  showProgressPanel: true,
  revealHandLabel: false,
  preset: defaultPreset,
};
