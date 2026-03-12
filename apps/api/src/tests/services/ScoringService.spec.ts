import { ScoringService } from '@/application/services/ScoringService';
import { ScoringRules } from '@/domain/entities/pool/Pool';

describe('ScoringService', () => {
  const defaultScoringRules: ScoringRules = {
    exact_score: 3,
    correct_winner: 1,
    wrong: 0,
  };

  const extendedScoringRules: ScoringRules = {
    exact_score: 5,
    goal_difference: 3,
    correct_winner: 1,
    wrong: 0,
  };

  describe('calculatePoints', () => {
    describe('Exact score match', () => {
      it('should award exact score points when prediction matches exactly', () => {
        const points = ScoringService.calculatePoints({
          predictedTeamAScore: 2,
          predictedTeamBScore: 1,
          actualTeamAScore: 2,
          actualTeamBScore: 1,
          scoringRules: defaultScoringRules,
        });

        expect(points).toBe(3);
      });

      it('should award exact score points for 0-0 draw', () => {
        const points = ScoringService.calculatePoints({
          predictedTeamAScore: 0,
          predictedTeamBScore: 0,
          actualTeamAScore: 0,
          actualTeamBScore: 0,
          scoringRules: defaultScoringRules,
        });

        expect(points).toBe(3);
      });
    });

    describe('Goal difference match', () => {
      it('should award goal difference points when difference matches', () => {
        const points = ScoringService.calculatePoints({
          predictedTeamAScore: 3,
          predictedTeamBScore: 1, // difference: +2
          actualTeamAScore: 4,
          actualTeamBScore: 2, // difference: +2
          scoringRules: extendedScoringRules,
        });

        expect(points).toBe(3); // goal_difference points
      });

      it('should award goal difference points for negative difference', () => {
        const points = ScoringService.calculatePoints({
          predictedTeamAScore: 1,
          predictedTeamBScore: 3, // difference: -2
          actualTeamAScore: 0,
          actualTeamBScore: 2, // difference: -2
          scoringRules: extendedScoringRules,
        });

        expect(points).toBe(3); // goal_difference points
      });

      it('should not award goal difference for draw (difference 0)', () => {
        const points = ScoringService.calculatePoints({
          predictedTeamAScore: 1,
          predictedTeamBScore: 1, // difference: 0
          actualTeamAScore: 2,
          actualTeamBScore: 2, // difference: 0
          scoringRules: extendedScoringRules,
        });

        expect(points).toBe(1); // correct_winner points (both draws)
      });
    });

    describe('Correct winner', () => {
      it('should award correct winner points when predicting Team A wins', () => {
        const points = ScoringService.calculatePoints({
          predictedTeamAScore: 3,
          predictedTeamBScore: 1,
          actualTeamAScore: 2,
          actualTeamBScore: 0,
          scoringRules: defaultScoringRules,
        });

        expect(points).toBe(1);
      });

      it('should award correct winner points when predicting Team B wins', () => {
        const points = ScoringService.calculatePoints({
          predictedTeamAScore: 0,
          predictedTeamBScore: 2,
          actualTeamAScore: 1,
          actualTeamBScore: 3,
          scoringRules: defaultScoringRules,
        });

        expect(points).toBe(1);
      });

      it('should award correct winner points for draw prediction', () => {
        const points = ScoringService.calculatePoints({
          predictedTeamAScore: 1,
          predictedTeamBScore: 1,
          actualTeamAScore: 2,
          actualTeamBScore: 2,
          scoringRules: defaultScoringRules,
        });

        expect(points).toBe(1);
      });
    });

    describe('Wrong prediction', () => {
      it('should award wrong points when predicting Team A wins but Team B wins', () => {
        const points = ScoringService.calculatePoints({
          predictedTeamAScore: 2,
          predictedTeamBScore: 1,
          actualTeamAScore: 1,
          actualTeamBScore: 2,
          scoringRules: defaultScoringRules,
        });

        expect(points).toBe(0);
      });

      it('should award wrong points when predicting draw but there is a winner', () => {
        const points = ScoringService.calculatePoints({
          predictedTeamAScore: 1,
          predictedTeamBScore: 1,
          actualTeamAScore: 2,
          actualTeamBScore: 1,
          scoringRules: defaultScoringRules,
        });

        expect(points).toBe(0);
      });

      it('should award wrong points when predicting winner but result is draw', () => {
        const points = ScoringService.calculatePoints({
          predictedTeamAScore: 2,
          predictedTeamBScore: 0,
          actualTeamAScore: 1,
          actualTeamBScore: 1,
          scoringRules: defaultScoringRules,
        });

        expect(points).toBe(0);
      });
    });

    describe('Custom scoring rules', () => {
      it('should use custom exact score points', () => {
        const customRules: ScoringRules = {
          exact_score: 10,
          correct_winner: 3,
          wrong: -1,
        };

        const points = ScoringService.calculatePoints({
          predictedTeamAScore: 3,
          predictedTeamBScore: 2,
          actualTeamAScore: 3,
          actualTeamBScore: 2,
          scoringRules: customRules,
        });

        expect(points).toBe(10);
      });

      it('should support negative points for wrong predictions', () => {
        const customRules: ScoringRules = {
          exact_score: 5,
          correct_winner: 2,
          wrong: -2,
        };

        const points = ScoringService.calculatePoints({
          predictedTeamAScore: 3,
          predictedTeamBScore: 1,
          actualTeamAScore: 1,
          actualTeamBScore: 3,
          scoringRules: customRules,
        });

        expect(points).toBe(-2);
      });
    });
  });
});
