export interface Pick {
  id: number;
  userId: number;
  matchId: number;
  predictedTeamAScore: number;
  predictedTeamBScore: number;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePickData {
  userId: number;
  matchId: number;
  predictedTeamAScore: number;
  predictedTeamBScore: number;
}

export interface UpdatePickData {
  predictedTeamAScore: number;
  predictedTeamBScore: number;
}