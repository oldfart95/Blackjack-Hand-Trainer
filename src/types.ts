export type Action = 'hit' | 'stand' | 'double' | 'split' | 'surrender';
export type HandClass = 'hard' | 'soft' | 'pair';
export type DealerBucket = 'weak' | 'medium' | 'strong';
export type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10';

export type LeakTag =
  | 'hard_soft_identification'
  | 'dealer_bucket_misread'
  | 'over_hit'
  | 'over_stand'
  | 'missed_double'
  | 'wrong_double'
  | 'missed_split'
  | 'wrong_split'
  | 'missed_surrender'
  | 'wrong_surrender'
  | 'pair_confusion'
  | 'soft_hand_confusion'
  | 'hard_12_bucket'
  | 'hard_13_16_bucket'
  | 'hard_16_vs_strong'
  | 'soft_18_bucket'
  | 'soft_13_17_double_spot'
  | 'nine_double_spot'
  | 'ten_double_spot'
  | 'eleven_double_spot'
  | 'stiff_hand_confusion';

export type RulePreset = {
  id: string;
  label: string;
  dealerHitsSoft17: boolean;
  doubleAfterSplit: boolean;
  surrender: boolean;
};

export type DrillMode =
  | 'mixed'
  | 'hard_only'
  | 'soft_only'
  | 'pairs_only'
  | 'trouble_hands'
  | 'missed_only'
  | 'exam';

export type Scenario = {
  id: string;
  playerCards: [CardRank, CardRank];
  dealerUpcard: CardRank;
  handClass: HandClass;
  playerTotal: number;
  dealerBucket: DealerBucket;
  correctAction: Action;
  bucketLabel: string;
  explanationShort: string;
  leakTags: LeakTag[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  weightBase: number;
  mnemonic?: string;
  ruleVariants?: Partial<Record<string, Action>>;
};

export type Attempt = {
  scenarioId: string;
  presentedAt: string;
  answeredAt: string;
  chosenAction: Action;
  correctAction: Action;
  wasCorrect: boolean;
  responseMs: number;
  handClass: HandClass;
  playerTotal: number;
  dealerUpcard: CardRank;
  dealerBucket: DealerBucket;
  leakTagsTriggered: LeakTag[];
};

export type SessionStats = {
  handsSeen: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  currentStreak: number;
  bestStreak: number;
  leakCounts: Partial<Record<LeakTag, number>>;
  missedScenarioIds: string[];
  recentAttempts: Attempt[];
};

export type AdaptiveProfile = {
  leakWeights: Partial<Record<LeakTag, number>>;
  scenarioMistakes: Partial<Record<string, number>>;
};

export type AppSettings = {
  drillMode: DrillMode;
  adaptiveEnabled: boolean;
  learnMode: boolean;
  showCoachPanel: boolean;
  showHints: boolean;
  showProgressPanel: boolean;
  revealHandLabel: boolean;
  preset: RulePreset;
};
