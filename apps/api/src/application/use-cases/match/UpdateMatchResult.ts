import { MatchRepository } from '@/application/ports/MatchRepository';
import { PickRepository } from '@/application/ports/PickRepository';
import { PoolRepository } from '@/application/ports/pool/PoolRepository';
import { Match, UpdateMatchResultData } from '@/domain/entities/Match';
import {
  MatchNotFoundError,
  InvalidScoreError,
  InvalidMatchStatusError
} from '@/domain/errors/DomainError';
import { ScoringService, ScoringRules } from '@/domain/services/ScoringService';

/**
 * UpdateMatchResult Use Case
 * 
 * Updates match result and automatically calculates points for all picks
 * in all pools based on each pool's scoring rules.
 */
export class UpdateMatchResult {
  constructor(
    private matchRepository: MatchRepository,
    private pickRepository: PickRepository,
    private poolRepository: PoolRepository
  ) {}

  async execute(matchId: number, resultData: UpdateMatchResultData): Promise<Match> {
    // 1. Validate match exists
    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new MatchNotFoundError(matchId);
    }

    // 2. Validate result data
    this.validateResultData(resultData);

    // 3. Update match result
    const updatedMatch = await this.matchRepository.updateResult(matchId, resultData);

    // 4. Calculate points for all picks if match is finished
    if (resultData.status === 'finished') {
      await this.calculatePointsForAllPicks(matchId, resultData);
    }

    return updatedMatch;
  }

  private validateResultData(resultData: UpdateMatchResultData): void {
    if (resultData.teamAScore < 0 || resultData.teamBScore < 0) {
      throw new InvalidScoreError();
    }

    const validStatuses = ['scheduled', 'live', 'finished'];
    if (!validStatuses.includes(resultData.status)) {
      throw new InvalidMatchStatusError(resultData.status);
    }
  }

  private async calculatePointsForAllPicks(
    matchId: number,
    result: UpdateMatchResultData
  ): Promise<void> {
    // Get all picks for this match
    const picks = await this.pickRepository.findByMatchId(matchId);

    if (picks.length === 0) {
      return; // No picks to calculate
    }

    // Group picks by pool to get scoring rules
    const picksByPool = new Map<number, typeof picks>();
    for (const pick of picks) {
      if (!picksByPool.has(pick.poolId)) {
        picksByPool.set(pick.poolId, []);
      }
      picksByPool.get(pick.poolId)!.push(pick);
    }

    // Calculate points for each pool's picks
    for (const [poolId, poolPicks] of picksByPool) {
      const pool = await this.poolRepository.findById(poolId);
      if (!pool) {
        continue; // Skip if pool not found
      }

      // Get scoring rules for this pool
      const scoringRules = this.getScoringRules(pool.scoringRules);

      // Calculate and update points for each pick
      for (const pick of poolPicks) {
        const points = ScoringService.calculatePoints(
          {
            predictedTeamAScore: pick.predictedTeamAScore,
            predictedTeamBScore: pick.predictedTeamBScore,
          },
          {
            teamAScore: result.teamAScore,
            teamBScore: result.teamBScore,
          },
          scoringRules
        );

        await this.pickRepository.updatePoints(pick.id, points);
      }
    }
  }

  private getScoringRules(rules: any): ScoringRules {
    // Validate and return scoring rules
    if (ScoringService.validateScoringRules(rules)) {
      return rules;
    }

    // Return default rules if invalid
    return ScoringService.getDefaultRules();
  }
}
