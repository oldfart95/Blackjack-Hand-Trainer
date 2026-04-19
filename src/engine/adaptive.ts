import type { Action, AdaptiveProfile, LeakTag, Scenario } from '../types';

export const deriveLeakTags = (scenario: Scenario, chosen: Action): LeakTag[] => {
  const tags = new Set<LeakTag>();
  if (chosen === scenario.correctAction) return [];

  if (chosen === 'hit' && scenario.correctAction === 'stand') tags.add('over_hit');
  if (chosen === 'stand' && scenario.correctAction === 'hit') tags.add('over_stand');
  if (scenario.correctAction === 'double' && chosen !== 'double') tags.add('missed_double');
  if (chosen === 'double' && scenario.correctAction !== 'double') tags.add('wrong_double');
  if (scenario.correctAction === 'split' && chosen !== 'split') tags.add('missed_split');
  if (chosen === 'split' && scenario.correctAction !== 'split') tags.add('wrong_split');
  if (scenario.correctAction === 'surrender' && chosen !== 'surrender') tags.add('missed_surrender');
  if (chosen === 'surrender' && scenario.correctAction !== 'surrender') tags.add('wrong_surrender');

  scenario.leakTags.forEach((tag) => tags.add(tag));
  return [...tags];
};

export const getScenarioWeight = (scenario: Scenario, profile: AdaptiveProfile, adaptiveEnabled: boolean): number => {
  if (!adaptiveEnabled) return scenario.weightBase;
  let weight = scenario.weightBase;
  scenario.leakTags.forEach((tag) => {
    weight += profile.leakWeights[tag] ?? 0;
  });
  weight += (profile.scenarioMistakes[scenario.id] ?? 0) * 0.5;
  return Math.max(0.1, weight);
};

export const updateAdaptiveProfile = (
  previous: AdaptiveProfile,
  scenario: Scenario,
  leakTagsTriggered: LeakTag[],
): AdaptiveProfile => {
  if (leakTagsTriggered.length === 0) {
    const loweredEntries = Object.entries(previous.leakWeights).map(([key, value]) => [
      key,
      Math.max(0, (value ?? 0) * 0.98),
    ]);
    return { ...previous, leakWeights: Object.fromEntries(loweredEntries) };
  }

  const leakWeights = { ...previous.leakWeights };
  leakTagsTriggered.forEach((tag) => {
    leakWeights[tag] = (leakWeights[tag] ?? 0) + 1;
  });

  return {
    leakWeights,
    scenarioMistakes: {
      ...previous.scenarioMistakes,
      [scenario.id]: (previous.scenarioMistakes[scenario.id] ?? 0) + 1,
    },
  };
};

export const weightedPick = <T>(items: T[], weightOf: (item: T) => number): T => {
  const total = items.reduce((sum, item) => sum + weightOf(item), 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= weightOf(item);
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
};
