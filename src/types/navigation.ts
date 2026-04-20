export type RootStackParamList = {
  Home: undefined;
  HowToPlay: undefined;
  PastResults: undefined;
  GetReady: { durationLabel: string; durationMs: number };
  ActiveCounting: { durationLabel: string; durationMs: number };
  Result: { durationLabel: string; durationMs: number; guessedMs: number; fromHistory?: boolean };
};
