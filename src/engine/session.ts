import type { Action, Attempt, LeakTag, Scenario, SessionStats } from '../types';
import { deriveLeakTags } from './adaptive';

export const emptySessionStats = (): SessionStats => ({
  handsSeen: 0,
  correct: 0,
  incorrect: 0,
  accuracy: 0,
  currentStreak: 0,
  bestStreak: 0,
  leakCounts: {},
  missedScenarioIds: [],
  recentAttempts: [],
});

export const applyAttempt = (
  stats: SessionStats,
  scenario: Scenario,
  chosenAction: Action,
  presentedAt: number,
): { next: SessionStats; attempt: Attempt; leakTagsTriggered: LeakTag[] } => {
  const leakTagsTriggered = deriveLeakTags(scenario, chosenAction);
  const wasCorrect = chosenAction === scenario.correctAction;

  const attempt: Attempt = {
    scenarioId: scenario.id,
    presentedAt: new Date(presentedAt).toISOString(),
    answeredAt: new Date().toISOString(),
    chosenAction,
    correctAction: scenario.correctAction,
    wasCorrect,
    responseMs: Date.now() - presentedAt,
    handClass: scenario.handClass,
    playerTotal: scenario.playerTotal,
    dealerUpcard: scenario.dealerUpcard,
    dealerBucket: scenario.dealerBucket,
    leakTagsTriggered,
  };

  const leakCounts = { ...stats.leakCounts };
  leakTagsTriggered.forEach((tag) => {
    leakCounts[tag] = (leakCounts[tag] ?? 0) + 1;
  });

  const recentAttempts = [attempt, ...stats.recentAttempts].slice(0, 250);
  const missedScenarioIds = wasCorrect ? stats.missedScenarioIds : [scenario.id, ...stats.missedScenarioIds].slice(0, 100);
  const correct = stats.correct + (wasCorrect ? 1 : 0);
  const incorrect = stats.incorrect + (wasCorrect ? 0 : 1);
  const handsSeen = stats.handsSeen + 1;
  const currentStreak = wasCorrect ? stats.currentStreak + 1 : 0;

  return {
    attempt,
    leakTagsTriggered,
    next: {
      ...stats,
      handsSeen,
      correct,
      incorrect,
      accuracy: handsSeen > 0 ? (correct / handsSeen) * 100 : 0,
      currentStreak,
      bestStreak: Math.max(stats.bestStreak, currentStreak),
      leakCounts,
      missedScenarioIds,
      recentAttempts,
    },
  };
};
