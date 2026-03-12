import { ScoringRules } from '@/domain/entities/pool/Pool';

export interface CalculatePointsParams {
  predictedTeamAScore: number;
  predictedTeamBScore: number;
  actualTeamAScore: number;
  actualTeamBScore: number;
  scoringRules: ScoringRules;
}

export class ScoringService {
  /**
   * Calculate points based on prediction and actual result
   * Following the pool's scoring rules
   */
  static calculatePoints(params: CalculatePointsParams): number {
    const {
      predictedTeamAScore,
      predictedTeamBScore,
      actualTeamAScore,
      actualTeamBScore,
      scoringRules,
    } = params;

    // Check for exact score match
    if (
      predictedTeamAScore === actualTeamAScore &&
      predictedTeamBScore === actualTeamBScore
    ) {
      return scoringRules.exact_score;
    }

    // Calculate goal difference
    const predictedDifference = predictedTeamAScore - predictedTeamBScore;
    const actualDifference = actualTeamAScore - actualTeamBScore;

    // Check for exact goal difference (if configured)
    if (
      scoringRules.goal_difference !== undefined &&
      predictedDifference === actualDifference &&
      actualDifference !== 0 // Don't award for equal draws
    ) {
      return scoringRules.goal_difference;
    }

    // Check for correct winner
    const predictedWinner = this.determineWinner(
      predictedTeamAScore,
      predictedTeamBScore
    );
    const actualWinner = this.determineWinner(actualTeamAScore, actualTeamBScore);

    if (predictedWinner === actualWinner) {
      return scoringRules.correct_winner;
    }

    // Wrong prediction
    return scoringRules.wrong;
  }

  private static determineWinner(
    teamAScore: number,
    teamBScore: number
  ): 'A' | 'B' | 'draw' {
    if (teamAScore > teamBScore) return 'A';
    if (teamBScore > teamAScore) return 'B';
    return 'draw';
  }
}
