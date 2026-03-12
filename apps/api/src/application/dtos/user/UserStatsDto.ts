export interface UserPoolStatsDto {
  poolId: number;
  poolName: string;
  position: number;
  totalPoints: number;
  totalPicks: number;
  memberCount: number;
}

export interface UserStatsDto {
  userId: number;
  userName: string;
  totalPools: number;
  averagePosition: number;
  totalPoints: number;
  totalPicks: number;
  correctPicks: number;
  exactScorePicks: number;
  pools: UserPoolStatsDto[];
}
