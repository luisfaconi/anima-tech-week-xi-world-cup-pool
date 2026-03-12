import { PickRepository } from '@/application/ports/PickRepository';
import { PoolRepository } from '@/application/ports/pool/PoolRepository';
import { Match } from '@/domain/entities/Match';
import { ScoringService } from '@/application/services/ScoringService';
import { InvalidMatchStatusError } from '@/domain/errors/DomainError';

export interface CalculateMatchScoresInput {
  match: Match;
}

export interface CalculateMatchScoresOutput {
  calculatedPicks: number;
  totalPoints: number;
}

export class CalculateMatchScores {
  constructor(
    private pickRepository: PickRepository,
    private poolRepository: PoolRepository
  ) {}

  async execute(input: CalculateMatchScoresInput): Promise<CalculateMatchScoresOutput> {
    const { match } = input;

    // Validate that match has results
    if (match.teamAScore === null || match.teamAScore === undefined) {
      throw new InvalidMatchStatusError('Match must have team A score to calculate points');
    }

    if (match.teamBScore === null || match.teamBScore === undefined) {
      throw new InvalidMatchStatusError('Match must have team B score to calculate points');
    }

    if (match.status !== 'finished') {
      throw new InvalidMatchStatusError('Can only calculate scores for finished matches');
    }

    // Get all picks for this match
    const picks = await this.pickRepository.findByMatchId(match.id);

    if (picks.length === 0) {
      return {
        calculatedPicks: 0,
        totalPoints: 0,
      };
    }

    let totalPoints = 0;

    // Calculate points for each pick based on its pool's scoring rules
    for (const pick of picks) {
      // Get the pool to access scoring rules
      const pool = await this.poolRepository.findById(pick.poolId);

      if (!pool) {
        console.warn(`Pool ${pick.poolId} not found for pick ${pick.id}, skipping...`);
        continue;
      }

      // Calculate points using the scoring service
      const points = ScoringService.calculatePoints({
        predictedTeamAScore: pick.predictedTeamAScore,
        predictedTeamBScore: pick.predictedTeamBScore,
        actualTeamAScore: match.teamAScore,
        actualTeamBScore: match.teamBScore,
        scoringRules: pool.scoringRules,
      });

      // Update the pick with calculated points
      await this.pickRepository.updatePoints(pick.id, points);
      totalPoints += points;
    }

    return {
      calculatedPicks: picks.length,
      totalPoints,
    };
  }
}
