import { httpClient } from './httpClient';

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

export const leaderboardService = {
  async getPoolLeaderboard(poolId: number): Promise<LeaderboardResponse> {
    const response = await httpClient.get<LeaderboardResponse>(
      `/pools/${poolId}/leaderboard`
    );
    if (!response.data) {
      throw new Error('Failed to fetch pool leaderboard');
    }
    return response.data;
  },

  async getUserStats(userId: number): Promise<UserStats> {
    const response = await httpClient.get<UserStats>(
      `/users/${userId}/stats`
    );
    if (!response.data) {
      throw new Error('Failed to fetch user stats');
    }
    return response.data;
  },
};
