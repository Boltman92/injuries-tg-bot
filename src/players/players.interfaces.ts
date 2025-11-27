export interface DateInfo {
  utcTime: string;
  timezone: string;
}

export interface TeamColors {
  color: string;
  colorAlternate: string;
  colorAway: string;
  colorAwayAlternate: string;
}

export interface PrimaryTeam {
  teamId: number;
  teamName: string;
  onLoan: boolean;
  teamColors: TeamColors;
}

export interface LocalizedLabel {
  label: string;
  key: string;
}

export interface PitchPositionData {
  right: number;
  top: number;
  ratio?: number;
}

export interface PositionInfo {
  strPos: LocalizedLabel;
  strPosShort: LocalizedLabel;
  occurences: number;
  position: string;
  isMainPosition: boolean;
  pitchPositionData: PitchPositionData;
}

export interface PositionDescription {
  positions: PositionInfo[];
  primaryPosition: LocalizedLabel;
  nonPrimaryPositions: LocalizedLabel[];
}

export interface PlayerInfoValue {
  numberValue?: number;
  key?: string | null;
  fallback: string | number | DateInfo;
  options?: Record<string, any>;
  dateValue?: string;
}

export interface PlayerInformationItem {
  value: PlayerInfoValue;
  title: string;
  translationKey: string;
  icon?: {
    type: string;
    id: string;
  };
  countryCode?: string;
}

export interface LeagueStatItem {
  title: string;
  localizedTitleId: string;
  value: number;
}

export interface MainLeague {
  leagueId: number;
  leagueName: string;
  season: string;
  stats: LeagueStatItem[];
}

export interface Tournament {
  ccode: string;
  leagueId: number;
  leagueName: string;
  seasonsWon: string[];
  seasonsRunnerUp: string[];
}

export interface PlayerTrophy {
  ccode: string;
  teamId: number;
  teamName: string;
  tournaments: Tournament[];
}

export interface Trophies {
  playerTrophies: PlayerTrophy[];
}

export interface RatingProps {
  rating: string;
  isTopRating: boolean;
}

export interface RecentMatch {
  teamId: number;
  teamName: string;
  opponentTeamId: number;
  opponentTeamName: string;
  isHomeTeam: boolean;
  id: number;
  matchDate: DateInfo;
  matchPageUrl: string;
  leagueId: number;
  leagueName: string;
  stage: string | null;
  homeScore: number;
  awayScore: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  ratingProps: RatingProps;
  playerOfTheMatch: boolean;
  onBench: boolean;
}

export interface TournamentInfo {
  name: string;
  tournamentId: number;
  entryId: string;
}

export interface SeasonInfo {
  seasonName: string;
  tournaments: TournamentInfo[];
}

export interface OnGoalShot {
  x: number;
  y: number;
  zoomRatio: number;
}

export interface ShotMapItem {
  id: number;
  playerName: string;
  eventType: string;
  shotType: string;
  situation: string;
  teamId: number;
  playerId: number;
  x: number;
  y: number;
  min: number;
  period: string;
  isOwnGoal: boolean;
  isBlocked: boolean;
  isOnTarget: boolean;
  isSavedOffLine: boolean;
  isFromInsideBox: boolean;
  blockedX?: number;
  blockedY?: number;
  goalCrossedY?: number;
  goalCrossedZ?: number;
  expectedGoals: number;
  expectedGoalsOnTarget: number;
  onGoalShot: OnGoalShot;
  box: string;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  matchId: number;
  matchDate: string;
  teamColor: string;
  teamColorDark: string;
}

export interface StatValue {
  localizedTitleId: string;
  per90: number;
  percentileRank: number;
  percentileRankPer90: number;
  statFormat: string;
  statValue: string;
  title: string;
}

export interface StatGroup {
  stats: StatValue[];
  type: string;
}

export interface StatsSeason {
  seasonName: string;
  tournamentId: number;
  tournamentName: string;
  statsSeason: StatGroup[];
}

export interface PlayerStatistics {
  primaryStatsSeason: StatsSeason[];
  keeperShotmap: any;
}

export interface ExpectedReturn {
  expectedReturnKey: string;
  expectedReturnDateParam: string;
  expectedReturnFallback: string;
}

export interface InjuryLastUpdated {
  utcTime: string;
  timezone: string | null;
}

export interface InjuryInformation {
  name: string;
  key: string;
  expectedReturn: ExpectedReturn;
  lastUpdated: InjuryLastUpdated;
}

export interface InjuryInfo {
  injury: string;
  expectedReturn: string;
}

export interface PlayerResponse {
  id: number;
  name: string;
  birthDate: DateInfo;
  contractEnd: DateInfo;
  isCoach: boolean;
  isCaptain: boolean;
  primaryTeam: PrimaryTeam;
  positionDescription: PositionDescription;
  injuryInformation: InjuryInformation | null;
  internationalDuty: any;
  playerInformation: PlayerInformationItem[];
  mainLeague: MainLeague;
  trophies: Trophies;
  recentMatches: RecentMatch[];
  careerHistory: {
    careerItems: {
      seasonEntries: SeasonInfo[];
    };
  };
  shotmap: ShotMapItem[];
  statistics: PlayerStatistics;
  status: string;
}

export interface SuggestionResponse {
  id: string;
  isCoach: boolean;
  name: string;
  score: number;
  teamId: number;
  teamName: string;
  type: 'player' | 'coach';
}
