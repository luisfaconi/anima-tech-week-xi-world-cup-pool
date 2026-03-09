export interface Pick {
  id: number;
  userId: number;
  matchId: number;
  poolId: number;
  predictedTeamAScore: number;
  predictedTeamBScore: number;
  points: number;
  aiSuggested: boolean;
  confidenceScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePickData {
  userId: number;
  matchId: number;
  poolId: number;
  predictedTeamAScore: number;
  predictedTeamBScore: number;
  aiSuggested?: boolean;
  confidenceScore?: number;
}

export interface UpdatePickData {
  predictedTeamAScore: number;
  predictedTeamBScore: number;
}