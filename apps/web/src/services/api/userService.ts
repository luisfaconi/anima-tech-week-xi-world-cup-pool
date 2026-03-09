import { httpClient } from './httpClient';

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
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
};
