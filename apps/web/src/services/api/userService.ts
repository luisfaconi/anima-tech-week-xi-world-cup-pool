import { httpClient } from './httpClient';

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface UserPoolStats {
  poolId: number;
  poolName: string;
  position: number;
  totalPoints: number;
  totalPicks: number;
  memberCount: number;
}

export interface UserStats {
  userId: number;
  userName: string;
  totalPools: number;
  averagePosition: number;
  totalPoints: number;
  totalPicks: number;
  correctPicks: number;
  exactScorePicks: number;
  pools: UserPoolStats[];
}

export const userService = {
  async getUserByEmail(email: string): Promise<User> {
    const response = await httpClient.get<User>(`/users?email=${encodeURIComponent(email)}`);
    if (!response.data) throw new Error('No data returned from server');
    return response.data;
  },

  async listUsers(): Promise<User[]> {
    const response = await httpClient.get<User[]>('/users/all');
    if (!response.data) throw new Error('No data returned from server');
    return response.data;
  },

  async getUserStats(userId: number): Promise<UserStats> {
    const response = await httpClient.get<UserStats>(`/users/${userId}/stats`);
    if (!response.data) throw new Error('No data returned from server');
    return response.data;
  },
};
