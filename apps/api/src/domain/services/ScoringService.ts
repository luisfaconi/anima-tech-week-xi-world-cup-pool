/**
 * ScoringService - Domain Service for calculating pick points
 * 
 * This service implements the scoring rules for the World Cup Pool.
 * It's a pure domain service with no external dependencies.
 */

export interface ScoringRules {
  exact_score: number;      // Points for exact score prediction
  correct_winner: number;   // Points for correct winner prediction
  wrong: number;            // Points for wrong prediction
}

export interface PickPrediction {
  predictedTeamAScore: number;
  predictedTeamBScore: number;
}

export interface MatchResult {
  teamAScore: number;
  teamBScore: number;
}

export class ScoringService {
  /**
   * Calculate points for a pick based on match result and scoring rules
   */
  static calculatePoints(
    prediction: PickPrediction,
    result: MatchResult,
    rules: ScoringRules
  ): number {
    // Check for exact score match
    if (
      prediction.predictedTeamAScore === result.teamAScore &&
      prediction.predictedTeamBScore === result.teamBScore
    ) {
      return rules.exact_score;
    }

    // Check for correct winner prediction
    const predictedWinner = this.getWinner(
      prediction.predictedTeamAScore,
      prediction.predictedTeamBScore
    );
    const actualWinner = this.getWinner(result.teamAScore, result.teamBScore);

    if (predictedWinner === actualWinner) {
      return rules.correct_winner;
    }

    // Wrong prediction
    return rules.wrong;
  }

  /**
   * Determine the winner of a match
   * Returns: 'A' for team A win, 'B' for team B win, 'draw' for tie
   */
  private static getWinner(scoreA: number, scoreB: number): 'A' | 'B' | 'draw' {
    if (scoreA > scoreB) return 'A';
    if (scoreB > scoreA) return 'B';
    return 'draw';
  }

  /**
   * Validate scoring rules
   */
  static validateScoringRules(rules: any): rules is ScoringRules {
    return (
      typeof rules === 'object' &&
      rules !== null &&
      typeof rules.exact_score === 'number' &&
      typeof rules.correct_winner === 'number' &&
      typeof rules.wrong === 'number' &&
      rules.exact_score >= 0 &&
      rules.correct_winner >= 0 &&
      rules.wrong >= 0
    );
  }

  /**
   * Get default scoring rules
   */
  static getDefaultRules(): ScoringRules {
    return {
      exact_score: 3,
      correct_winner: 1,
      wrong: 0,
    };
  }
}
