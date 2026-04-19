import type { RulePreset, Scenario, CardRank, HandClass } from '../types';
import { DEALER_ORDER, bucketLabel, getCommonLeakTags, getDealerBucket, getHardAction, getPairAction, getSoftAction } from './strategy';

const hardRepresentations: Record<number, [CardRank, CardRank]> = {
  5: ['2', '3'],
  6: ['2', '4'],
  7: ['3', '4'],
  8: ['3', '5'],
  9: ['4', '5'],
  10: ['4', '6'],
  11: ['5', '6'],
  12: ['10', '2'],
  13: ['10', '3'],
  14: ['10', '4'],
  15: ['10', '5'],
  16: ['10', '6'],
  17: ['10', '7'],
  18: ['10', '8'],
  19: ['10', '9'],
  20: ['10', '10'],
  21: ['10', 'A'],
};

const softRepresentations: Array<{ total: number; cards: [CardRank, CardRank] }> = [
  { total: 13, cards: ['A', '2'] },
  { total: 14, cards: ['A', '3'] },
  { total: 15, cards: ['A', '4'] },
  { total: 16, cards: ['A', '5'] },
  { total: 17, cards: ['A', '6'] },
  { total: 18, cards: ['A', '7'] },
  { total: 19, cards: ['A', '8'] },
  { total: 20, cards: ['A', '9'] },
];

const pairRanks: CardRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];

const difficulty = (action: string, handClass: HandClass, total: number): 1 | 2 | 3 | 4 | 5 => {
  if (action === 'surrender') return 5;
  if (handClass === 'pair' && (total === 16 || total === 18)) return 4;
  if (action === 'double') return 3;
  if (total >= 5 && total <= 8) return 1;
  return 2;
};

const buildScenario = (
  id: string,
  playerCards: [CardRank, CardRank],
  dealerUpcard: CardRank,
  handClass: HandClass,
  playerTotal: number,
  correctAction: Scenario['correctAction'],
): Scenario => ({
  id,
  playerCards,
  dealerUpcard,
  handClass,
  playerTotal,
  dealerBucket: getDealerBucket(dealerUpcard),
  correctAction,
  bucketLabel: bucketLabel(handClass, playerTotal, dealerUpcard, correctAction, handClass === 'pair' ? playerCards[0] : undefined),
  explanationShort: `${handClass.toUpperCase()} ${playerTotal} against dealer ${dealerUpcard}: ${correctAction.toUpperCase()} by basic strategy.`,
  leakTags: getCommonLeakTags(handClass, playerTotal, correctAction, dealerUpcard),
  difficulty: difficulty(correctAction, handClass, playerTotal),
  weightBase: 1,
  mnemonic: handClass === 'soft' && playerTotal === 18 ? 'Soft 18: double 3-6, stand 2/7/8, hit 9-T-A' : undefined,
});

export const buildScenarioBank = (preset: RulePreset): Scenario[] => {
  const scenarios: Scenario[] = [];

  for (const [totalRaw, cards] of Object.entries(hardRepresentations)) {
    const total = Number(totalRaw);
    for (const dealer of DEALER_ORDER) {
      const correctAction = getHardAction(total, dealer, preset.surrender);
      scenarios.push(buildScenario(`hard-${total}-vs-${dealer}`, cards, dealer, 'hard', total, correctAction));
    }
  }

  for (const soft of softRepresentations) {
    for (const dealer of DEALER_ORDER) {
      const correctAction = getSoftAction(soft.total, dealer);
      scenarios.push(buildScenario(`soft-${soft.total}-vs-${dealer}`, soft.cards, dealer, 'soft', soft.total, correctAction));
    }
  }

  for (const rank of pairRanks) {
    const total = rank === 'A' ? 12 : Number(rank) * 2;
    for (const dealer of DEALER_ORDER) {
      const correctAction = getPairAction(rank, dealer, preset.surrender);
      scenarios.push(buildScenario(`pair-${rank}-vs-${dealer}`, [rank, rank], dealer, 'pair', total, correctAction));
    }
  }

  return scenarios;
};
