export type MatchStatus = 'scheduled' | 'live' | 'finished';

export interface Match {
  id: number;
  teamA: string;
  teamB: string;
  scheduledAt: Date;
  teamAScore?: number;
  teamBScore?: number;
  status: MatchStatus;
  createdAt: Date;
}

export interface CreateMatchData {
  teamA: string;
  teamB: string;
  scheduledAt: Date;
}

export interface UpdateMatchResultData {
  teamAScore: number;
  teamBScore: number;
  status: MatchStatus;
}