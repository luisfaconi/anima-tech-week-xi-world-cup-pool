import { httpClient } from './httpClient';

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
  createdAt: string;
  updatedAt: string;
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

export const pickService = {
  async createPick(data: CreatePickData) {
    return httpClient.post<Pick>('/picks', data);
  },

  async updatePick(pickId: number, data: UpdatePickData) {
    return httpClient.put<Pick>(`/picks/${pickId}`, data);
  },

  async getUserPicks(userId: number, poolId?: number) {
    const query = poolId ? `?poolId=${poolId}` : '';
    return httpClient.get<Pick[]>(`/picks/user/${userId}${query}`);
  },

  async deletePick(pickId: number) {
    return httpClient.delete(`/picks/${pickId}`);
  },
};
