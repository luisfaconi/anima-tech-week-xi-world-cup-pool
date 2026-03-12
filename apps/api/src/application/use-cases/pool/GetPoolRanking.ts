import { PoolRepository } from '@/application/ports/pool/PoolRepository';
import { PickRepository } from '@/application/ports/PickRepository';
import { UserRepository } from '@/application/ports/user/UserRepository';
import { PoolNotFoundError } from '@/domain/errors/DomainError';

export interface RankingEntry {
  userId: number;
  userName: string;
  userEmail: string;
  totalPoints: number;
  totalPicks: number;
  correctPicks: number;
  exactScorePicks: number;
  position: number;
}

export interface GetPoolRankingInput {
  poolId: number;
}

export interface GetPoolRankingOutput {
  poolId: number;
  poolName: string;
  ranking: RankingEntry[];
}

export class GetPoolRanking {
  constructor(
    private poolRepository: PoolRepository,
    private pickRepository: PickRepository,
    private userRepository: UserRepository
  ) {}

  async execute(input: GetPoolRankingInput): Promise<GetPoolRankingOutput> {
    const { poolId } = input;

    // Verify pool exists
    const pool = await this.poolRepository.findById(poolId);
    if (!pool) {
      throw new PoolNotFoundError(poolId);
    }

    // Get all members of the pool
    const members = await this.poolRepository.getMembers(poolId);

    // Get all picks for this pool
    const poolPicks = await this.pickRepository.findByPoolId(poolId);

    // Calculate stats for each user
    const userStats = new Map<number, {
      totalPoints: number;
      totalPicks: number;
      correctPicks: number;
      exactScorePicks: number;
    }>();

    // Initialize stats for all members
    for (const member of members) {
      userStats.set(member.userId, {
        totalPoints: 0,
        totalPicks: 0,
        correctPicks: 0,
        exactScorePicks: 0,
      });
    }

    // Calculate stats from picks
    for (const pick of poolPicks) {
      const stats = userStats.get(pick.userId);
      if (stats) {
        stats.totalPoints += pick.points;
        stats.totalPicks += 1;
        
        if (pick.points > 0) {
          stats.correctPicks += 1;
        }
        
        // Assuming exact score gives the highest points (from pool's scoring rules)
        if (pick.points === pool.scoringRules.exact_score) {
          stats.exactScorePicks += 1;
        }
      }
    }

    // Build ranking entries
    const rankingEntries: RankingEntry[] = [];

    for (const member of members) {
      const user = await this.userRepository.findById(member.userId);
      if (!user) continue;

      const stats = userStats.get(member.userId) || {
        totalPoints: 0,
        totalPicks: 0,
        correctPicks: 0,
        exactScorePicks: 0,
      };

      rankingEntries.push({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        totalPoints: stats.totalPoints,
        totalPicks: stats.totalPicks,
        correctPicks: stats.correctPicks,
        exactScorePicks: stats.exactScorePicks,
        position: 0, // Will be set after sorting
      });
    }

    // Sort by total points (descending), then by correct picks (descending)
    rankingEntries.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return b.correctPicks - a.correctPicks;
    });

    // Assign positions
    rankingEntries.forEach((entry, index) => {
      entry.position = index + 1;
    });

    return {
      poolId: pool.id!,
      poolName: pool.name,
      ranking: rankingEntries,
    };
  }
}
