import type { Action, CardRank, DealerBucket, LeakTag } from '../types';

export const DEALER_ORDER: CardRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];

export const getDealerBucket = (upcard: CardRank): DealerBucket => {
  if (['4', '5', '6'].includes(upcard)) return 'weak';
  if (['2', '3', '7', '8', '9'].includes(upcard)) return 'medium';
  return 'strong';
};

const isDealer = (upcard: CardRank, cards: CardRank[]) => cards.includes(upcard);

export const getHardAction = (total: number, dealer: CardRank, surrenderEnabled: boolean): Action => {
  if (surrenderEnabled && total === 16 && isDealer(dealer, ['9', '10', 'A'])) return 'surrender';
  if (surrenderEnabled && total === 15 && dealer === '10') return 'surrender';

  if (total >= 17) return 'stand';
  if (total >= 13 && total <= 16) return isDealer(dealer, ['2', '3', '4', '5', '6']) ? 'stand' : 'hit';
  if (total === 12) return isDealer(dealer, ['4', '5', '6']) ? 'stand' : 'hit';
  if (total === 11) return 'double';
  if (total === 10) return isDealer(dealer, ['2', '3', '4', '5', '6', '7', '8', '9']) ? 'double' : 'hit';
  if (total === 9) return isDealer(dealer, ['3', '4', '5', '6']) ? 'double' : 'hit';
  return 'hit';
};

export const getSoftAction = (total: number, dealer: CardRank): Action => {
  if (total <= 17) {
    if (total === 13 || total === 14) return isDealer(dealer, ['5', '6']) ? 'double' : 'hit';
    if (total === 15 || total === 16) return isDealer(dealer, ['4', '5', '6']) ? 'double' : 'hit';
    if (total === 17) return isDealer(dealer, ['3', '4', '5', '6']) ? 'double' : 'hit';
  }
  if (total === 18) {
    if (isDealer(dealer, ['3', '4', '5', '6'])) return 'double';
    if (isDealer(dealer, ['2', '7', '8'])) return 'stand';
    return 'hit';
  }
  return 'stand';
};

export const getPairAction = (rank: CardRank, dealer: CardRank, surrenderEnabled: boolean): Action => {
  switch (rank) {
    case 'A':
    case '8':
      return 'split';
    case '10':
      return 'stand';
    case '9':
      return isDealer(dealer, ['2', '3', '4', '5', '6', '8', '9']) ? 'split' : 'stand';
    case '7':
      return isDealer(dealer, ['2', '3', '4', '5', '6', '7']) ? 'split' : 'hit';
    case '6':
      return isDealer(dealer, ['2', '3', '4', '5', '6']) ? 'split' : 'hit';
    case '5':
      return getHardAction(10, dealer, surrenderEnabled);
    case '4':
      return isDealer(dealer, ['5', '6']) ? 'split' : 'hit';
    case '3':
    case '2':
      return isDealer(dealer, ['2', '3', '4', '5', '6', '7']) ? 'split' : 'hit';
    default:
      return 'hit';
  }
};

export const bucketLabel = (handClass: 'hard' | 'soft' | 'pair', total: number, dealer: CardRank, action: Action, pairRank?: CardRank): string => {
  if (handClass === 'pair' && pairRank) {
    return `Pair ${pairRank},${pairRank} vs ${dealer} = ${action.toUpperCase()}`;
  }
  return `${handClass[0].toUpperCase()}${handClass.slice(1)} ${total} vs ${dealer} = ${action.toUpperCase()}`;
};

export const getCommonLeakTags = (
  handClass: 'hard' | 'soft' | 'pair',
  total: number,
  action: Action,
  dealer: CardRank,
): LeakTag[] => {
  const tags = new Set<LeakTag>();
  if (handClass === 'pair') tags.add('pair_confusion');
  if (handClass === 'soft') tags.add('soft_hand_confusion');
  if (total === 12 && handClass === 'hard') tags.add('hard_12_bucket');
  if (total >= 13 && total <= 16 && handClass === 'hard') tags.add('hard_13_16_bucket');
  if (total === 16 && handClass === 'hard' && ['9', '10', 'A'].includes(dealer)) tags.add('hard_16_vs_strong');
  if (total === 18 && handClass === 'soft') tags.add('soft_18_bucket');
  if (total >= 13 && total <= 17 && handClass === 'soft' && action === 'double') tags.add('soft_13_17_double_spot');
  if (total === 9 && handClass === 'hard' && action === 'double') tags.add('nine_double_spot');
  if (total === 10 && handClass === 'hard' && action === 'double') tags.add('ten_double_spot');
  if (total === 11 && handClass === 'hard' && action === 'double') tags.add('eleven_double_spot');
  if (total >= 12 && total <= 16 && handClass === 'hard') tags.add('stiff_hand_confusion');
  if (action === 'double') tags.add('missed_double');
  if (action === 'split') tags.add('missed_split');
  if (action === 'surrender') tags.add('missed_surrender');
  return [...tags];
};
