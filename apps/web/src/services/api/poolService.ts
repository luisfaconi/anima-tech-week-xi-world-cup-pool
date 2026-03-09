import { httpClient } from './httpClient';

export interface ScoringRules {
  exact_score: number;
  goal_difference?: number;
  correct_winner: number;
  wrong: number;
}

export interface Pool {
  id: number;
  name: string;
  description?: string;
  inviteCode: string;
  ownerId: number;
  scoringRules: ScoringRules;
  isActive: boolean;
  createdAt: string;
  memberCount?: number;
}

export interface CreatePoolRequest {
  name: string;
  description?: string;
  ownerId: number;
  scoringRules?: ScoringRules;
}

export interface UpdatePoolRequest {
  name?: string;
  description?: string;
  scoringRules?: ScoringRules;
  requesterId: number;
}

export interface JoinPoolRequest {
  userId: number;
  inviteCode: string;
}

export interface PoolMember {
  id: number;
  poolId: number;
  userId: number;
  userName?: string;
  joinedAt: string;
}

export const poolService = {
  async createPool(data: CreatePoolRequest): Promise<Pool> {
    const response = await httpClient.post<Pool>('/pools', data);
    if (!response.data) throw new Error('No data returned from server');
    return response.data;
  },

  async getPoolById(id: number): Promise<Pool> {
    const response = await httpClient.get<Pool>(`/pools/${id}`);
    if (!response.data) throw new Error('No data returned from server');
    return response.data;
  },

  async listUserPools(userId: number): Promise<Pool[]> {
    const response = await httpClient.get<Pool[]>(`/pools?userId=${userId}`);
    if (!response.data) throw new Error('No data returned from server');
    return response.data;
  },

  async updatePool(id: number, data: UpdatePoolRequest): Promise<Pool> {
    const response = await httpClient.put<Pool>(`/pools/${id}`, data);
    if (!response.data) throw new Error('No data returned from server');
    return response.data;
  },

  async joinPool(data: JoinPoolRequest): Promise<PoolMember> {
    const response = await httpClient.post<PoolMember>('/pools/join', data);
    if (!response.data) throw new Error('No data returned from server');
    return response.data;
  },

  async getPoolMembers(poolId: number): Promise<PoolMember[]> {
    const response = await httpClient.get<PoolMember[]>(`/pools/${poolId}/members`);
    if (!response.data) throw new Error('No data returned from server');
    return response.data;
  },

  async removeMember(poolId: number, userId: number, requesterId: number): Promise<void> {
    await httpClient.delete(`/pools/${poolId}/members/${userId}`, {
      data: { requesterId },
    });
  },
};
