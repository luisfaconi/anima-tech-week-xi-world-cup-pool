export interface RankingEntryDto {
  userId: number;
  userName: string;
  userEmail: string;
  totalPoints: number;
  totalPicks: number;
  correctPicks: number;
  exactScorePicks: number;
  position: number;
}

export interface PoolRankingDto {
  poolId: number;
  poolName: string;
  ranking: RankingEntryDto[];
}
