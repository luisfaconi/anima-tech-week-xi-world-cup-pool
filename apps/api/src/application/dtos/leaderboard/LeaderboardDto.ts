export interface LeaderboardEntry {
  userId: number;
  userName: string;
  totalPoints: number;
  correctPicks: number;
  totalPicks: number;
  exactScores: number;
  position: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  hasFinishedMatches: boolean;
}

export interface UserStats {
  userId: number;
  userName: string;
  totalPools: number;
  totalPoints: number;
  averagePoints: number;
  averagePosition: number;
  totalPicks: number;
  correctPicks: number;
  exactScores: number;
  accuracy: number;
  hasFinishedMatches: boolean;
}
