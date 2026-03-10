import { PickRepository } from '../../ports/PickRepository';
import { PoolRepository } from '../../ports/pool/PoolRepository';
import { UserRepository } from '../../ports/user/UserRepository';
import { MatchRepository } from '../../ports/MatchRepository';
import { PoolNotFoundError } from '../../../domain/errors/DomainError';
import { LeaderboardResponse, LeaderboardEntry } from '../../dtos/leaderboard/LeaderboardDto';

export class GetPoolLeaderboard {
  constructor(
    private pickRepository: PickRepository,
    private poolRepository: PoolRepository,
    private userRepository: UserRepository,
    private matchRepository: MatchRepository
  ) {}

  async execute(poolId: number): Promise<LeaderboardResponse> {
    // Verify pool exists
    const pool = await this.poolRepository.findById(poolId);
    if (!pool) {
      throw new PoolNotFoundError(poolId);
    }

    // Get all picks for this pool
    const picks = await this.pickRepository.findByPoolId(poolId);

    // Group picks by user and calculate stats
    const userStatsMap = new Map<number, {
      userId: number;
      totalPoints: number;
      totalPicks: number;
      correctPicks: number;
      exactScores: number;
    }>();

    for (const pick of picks) {
      const stats = userStatsMap.get(pick.userId) || {
        userId: pick.userId,
        totalPoints: 0,
        totalPicks: 0,
        correctPicks: 0,
        exactScores: 0,
      };

      stats.totalPoints += pick.points;
      stats.totalPicks += 1;

      // Count correct picks (points > 0)
      if (pick.points > 0) {
        stats.correctPicks += 1;
      }

      // Count exact scores (assuming exact score gives 3 points by default)
      if (pick.points >= (pool.scoringRules.exact_score || 3)) {
        stats.exactScores += 1;
      }

      userStatsMap.set(pick.userId, stats);
    }

    // Convert to array and add user names
    const leaderboard: LeaderboardEntry[] = [];
    
    for (const [userId, stats] of userStatsMap.entries()) {
      const user = await this.userRepository.findById(userId);
      
      leaderboard.push({
        userId,
        userName: user?.name || `User ${userId}`,
        totalPoints: stats.totalPoints,
        correctPicks: stats.correctPicks,
        totalPicks: stats.totalPicks,
        exactScores: stats.exactScores,
        position: 0, // Will be set after sorting
      });
    }

    // Sort by total points (descending)
    leaderboard.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      // Tiebreaker: more correct picks
      if (b.correctPicks !== a.correctPicks) {
        return b.correctPicks - a.correctPicks;
      }
      // Tiebreaker: more exact scores
      return b.exactScores - a.exactScores;
    });

    // Assign positions
    leaderboard.forEach((entry, index) => {
      entry.position = index + 1;
    });

    // Check if there are any finished matches
    const hasFinishedMatches = await this.matchRepository.hasFinishedMatches();

    return {
      entries: leaderboard,
      hasFinishedMatches,
    };
  }
}
