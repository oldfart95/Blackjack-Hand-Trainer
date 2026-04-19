import type { DrillMode, Scenario, SessionStats } from '../types';

export const filterByMode = (all: Scenario[], mode: DrillMode, missedIds: string[]): Scenario[] => {
  switch (mode) {
    case 'hard_only':
      return all.filter((s) => s.handClass === 'hard');
    case 'soft_only':
      return all.filter((s) => s.handClass === 'soft');
    case 'pairs_only':
      return all.filter((s) => s.handClass === 'pair');
    case 'trouble_hands':
      return all.filter(
        (s) =>
          (s.handClass === 'hard' && s.playerTotal >= 12 && s.playerTotal <= 16) ||
          (s.handClass === 'soft' && s.playerTotal === 18) ||
          (s.handClass === 'pair' && ['8', '9', 'A'].includes(s.playerCards[0])) ||
          s.correctAction === 'surrender',
      );
    case 'missed_only':
      return all.filter((s) => missedIds.includes(s.id));
    default:
      return all;
  }
};

export const topLeakTags = (stats: SessionStats, limit = 3): Array<{ tag: string; count: number }> =>
  Object.entries(stats.leakCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count: count ?? 0 }));

export const recommendedMode = (stats: SessionStats): DrillMode => {
  const leaks = topLeakTags(stats, 1);
  if (leaks.length === 0) return 'mixed';
  if (leaks[0].tag.includes('soft')) return 'soft_only';
  if (leaks[0].tag.includes('pair') || leaks[0].tag.includes('split')) return 'pairs_only';
  if (leaks[0].tag.includes('hard_12') || leaks[0].tag.includes('hard_16') || leaks[0].tag.includes('stiff')) return 'trouble_hands';
  return 'hard_only';
};
