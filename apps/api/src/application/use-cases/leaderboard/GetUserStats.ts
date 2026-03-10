import { PickRepository } from '../../ports/PickRepository';
import { PoolRepository } from '../../ports/pool/PoolRepository';
import { UserRepository } from '../../ports/user/UserRepository';
import { MatchRepository } from '../../ports/MatchRepository';
import { UserNotFoundError } from '../../../domain/errors/DomainError';
import { UserStats } from '../../dtos/leaderboard/LeaderboardDto';

export class GetUserStats {
  constructor(
    private pickRepository: PickRepository,
    private poolRepository: PoolRepository,
    private userRepository: UserRepository,
    private matchRepository: MatchRepository
  ) {}

  async execute(userId: number): Promise<UserStats> {
    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    // Get all pools user is member of
    const pools = await this.poolRepository.findByUserId(userId);
    
    // Get all picks from user
    const picks = await this.pickRepository.findByUserId(userId);

    // Calculate overall stats
    let totalPoints = 0;
    let correctPicks = 0;
    let exactScores = 0;

    for (const pick of picks) {
      totalPoints += pick.points;
      
      if (pick.points > 0) {
        correctPicks += 1;
      }

      // Assuming exact score gives 3 points by default
      if (pick.points >= 3) {
        exactScores += 1;
      }
    }

    // Calculate positions in each pool
    const positions: number[] = [];
    
    for (const pool of pools) {
      const poolPicks = await this.pickRepository.findByPoolId(pool.id);
      
      // Group by user and calculate points
      const userPointsMap = new Map<number, number>();
      
      for (const pick of poolPicks) {
        const currentPoints = userPointsMap.get(pick.userId) || 0;
        userPointsMap.set(pick.userId, currentPoints + pick.points);
      }

      // Convert to sorted array
      const sortedUsers = Array.from(userPointsMap.entries())
        .sort((a, b) => b[1] - a[1]);

      // Find user position
      const position = sortedUsers.findIndex(([id]) => id === userId) + 1;
      if (position > 0) {
        positions.push(position);
      }
    }

    const averagePosition = positions.length > 0
      ? positions.reduce((sum, pos) => sum + pos, 0) / positions.length
      : 0;

    const averagePoints = pools.length > 0
      ? totalPoints / pools.length
      : 0;

    const accuracy = picks.length > 0
      ? (correctPicks / picks.length) * 100
      : 0;

    // Check if there are any finished matches
    const hasFinishedMatches = await this.matchRepository.hasFinishedMatches();

    return {
      userId,
      userName: user.name,
      totalPools: pools.length,
      totalPoints,
      averagePoints: Math.round(averagePoints * 100) / 100,
      averagePosition: Math.round(averagePosition * 100) / 100,
      totalPicks: picks.length,
      correctPicks,
      exactScores,
      accuracy: Math.round(accuracy * 100) / 100,
      hasFinishedMatches,
    };
  }
}
