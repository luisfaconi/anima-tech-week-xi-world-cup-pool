import { httpClient } from './httpClient';

export interface Match {
  id: number;
  teamA: string;
  teamB: string;
  teamAFlag?: string;
  teamBFlag?: string;
  scheduledAt: string;
  teamAScore?: number;
  teamBScore?: number;
  status: 'scheduled' | 'live' | 'finished';
  matchType?: string;
  groupName?: string;
  venue?: string;
  createdAt: string;
}

export const matchService = {
  async listMatches() {
    return httpClient.get<Match[]>('/matches');
  },

  async getMatch(matchId: number) {
    return httpClient.get<Match>(`/matches/${matchId}`);
  },
};
