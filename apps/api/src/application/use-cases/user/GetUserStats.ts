import { UserRepository } from '@/application/ports/user/UserRepository';
import { PoolRepository } from '@/application/ports/pool/PoolRepository';
import { PickRepository } from '@/application/ports/PickRepository';
import { UserNotFoundError } from '@/domain/errors/DomainError';

export interface UserPoolStats {
  poolId: number;
  poolName: string;
  position: number;
  totalPoints: number;
  totalPicks: number;
  memberCount: number;
}

export interface GetUserStatsInput {
  userId: number;
}

export interface GetUserStatsOutput {
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

export class GetUserStats {
  constructor(
    private userRepository: UserRepository,
    private poolRepository: PoolRepository,
    private pickRepository: PickRepository
  ) {}

  async execute(input: GetUserStatsInput): Promise<GetUserStatsOutput> {
    const { userId } = input;

    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    // Get all pools user is member of
    const userPools = await this.poolRepository.findByUserId(userId);

    // Get all user's picks
    const userPicks = await this.pickRepository.findByUserId(userId);

    // Calculate global stats
    let totalPoints = 0;
    let correctPicks = 0;
    let exactScorePicks = 0;

    for (const pick of userPicks) {
      totalPoints += pick.points;
      if (pick.points > 0) {
        correctPicks += 1;
      }
    }

    // Calculate per-pool stats
    const poolStats: UserPoolStats[] = [];
    let totalPosition = 0;
    let poolsWithPosition = 0;

    for (const pool of userPools) {
      // Get pool picks for this user
      const poolPicks = await this.pickRepository.findByUserIdAndPoolId(userId, pool.id!);
      const poolPoints = poolPicks.reduce((sum, pick) => sum + pick.points, 0);

      // Calculate exact score picks for this pool
      const poolExactScores = poolPicks.filter(
        pick => pick.points === pool.scoringRules.exact_score
      ).length;

      exactScorePicks += poolExactScores;

      // Get all picks for this pool to calculate position
      const allPoolPicks = await this.pickRepository.findByPoolId(pool.id!);
      
      // Group picks by user and calculate totals
      const userPointsMap = new Map<number, number>();
      for (const pick of allPoolPicks) {
        const current = userPointsMap.get(pick.userId) || 0;
        userPointsMap.set(pick.userId, current + pick.points);
      }

      // Convert to array and sort
      const sortedUsers = Array.from(userPointsMap.entries())
        .sort((a, b) => b[1] - a[1]);

      // Find user's position
      const position = sortedUsers.findIndex(([uid]) => uid === userId) + 1;

      // Get member count
      const memberCount = await this.poolRepository.getMemberCount(pool.id!);

      poolStats.push({
        poolId: pool.id!,
        poolName: pool.name,
        position,
        totalPoints: poolPoints,
        totalPicks: poolPicks.length,
        memberCount,
      });

      if (position > 0) {
        totalPosition += position;
        poolsWithPosition += 1;
      }
    }

    const averagePosition = poolsWithPosition > 0 
      ? Math.round(totalPosition / poolsWithPosition) 
      : 0;

    return {
      userId: user.id,
      userName: user.name,
      totalPools: userPools.length,
      averagePosition,
      totalPoints,
      totalPicks: userPicks.length,
      correctPicks,
      exactScorePicks,
      pools: poolStats,
    };
  }
}
