import { ScoringService, ScoringRules } from '@/domain/services/ScoringService';

describe('ScoringService', () => {
  const defaultRules: ScoringRules = {
    exact_score: 3,
    correct_winner: 1,
    wrong: 0,
  };

  describe('calculatePoints', () => {
    it('should award exact_score points for exact match prediction', () => {
      const prediction = { predictedTeamAScore: 2, predictedTeamBScore: 1 };
      const result = { teamAScore: 2, teamBScore: 1 };

      const points = ScoringService.calculatePoints(prediction, result, defaultRules);

      expect(points).toBe(3);
    });

    it('should award correct_winner points when predicting correct winner but wrong score', () => {
      const prediction = { predictedTeamAScore: 3, predictedTeamBScore: 1 };
      const result = { teamAScore: 2, teamBScore: 0 };

      const points = ScoringService.calculatePoints(prediction, result, defaultRules);

      expect(points).toBe(1);
    });

    it('should award correct_winner points for correct draw prediction', () => {
      const prediction = { predictedTeamAScore: 1, predictedTeamBScore: 1 };
      const result = { teamAScore: 2, teamBScore: 2 };

      const points = ScoringService.calculatePoints(prediction, result, defaultRules);

      expect(points).toBe(1);
    });

    it('should award wrong points when predicting wrong winner', () => {
      const prediction = { predictedTeamAScore: 2, predictedTeamBScore: 1 };
      const result = { teamAScore: 0, teamBScore: 3 };

      const points = ScoringService.calculatePoints(prediction, result, defaultRules);

      expect(points).toBe(0);
    });

    it('should award wrong points when predicting draw but there was a winner', () => {
      const prediction = { predictedTeamAScore: 1, predictedTeamBScore: 1 };
      const result = { teamAScore: 2, teamBScore: 1 };

      const points = ScoringService.calculatePoints(prediction, result, defaultRules);

      expect(points).toBe(0);
    });

    it('should award wrong points when predicting winner but result was draw', () => {
      const prediction = { predictedTeamAScore: 2, predictedTeamBScore: 1 };
      const result = { teamAScore: 1, teamBScore: 1 };

      const points = ScoringService.calculatePoints(prediction, result, defaultRules);

      expect(points).toBe(0);
    });

    it('should work with custom scoring rules', () => {
      const customRules: ScoringRules = {
        exact_score: 5,
        correct_winner: 2,
        wrong: -1,
      };

      const prediction = { predictedTeamAScore: 2, predictedTeamBScore: 1 };
      const result = { teamAScore: 2, teamBScore: 1 };

      const points = ScoringService.calculatePoints(prediction, result, customRules);

      expect(points).toBe(5);
    });

    it('should handle 0-0 exact score correctly', () => {
      const prediction = { predictedTeamAScore: 0, predictedTeamBScore: 0 };
      const result = { teamAScore: 0, teamBScore: 0 };

      const points = ScoringService.calculatePoints(prediction, result, defaultRules);

      expect(points).toBe(3);
    });

    it('should handle high scores correctly', () => {
      const prediction = { predictedTeamAScore: 5, predictedTeamBScore: 4 };
      const result = { teamAScore: 5, teamBScore: 4 };

      const points = ScoringService.calculatePoints(prediction, result, defaultRules);

      expect(points).toBe(3);
    });
  });

  describe('validateScoringRules', () => {
    it('should validate correct scoring rules', () => {
      const rules = {
        exact_score: 3,
        correct_winner: 1,
        wrong: 0,
      };

      expect(ScoringService.validateScoringRules(rules)).toBe(true);
    });

    it('should reject rules with negative values', () => {
      const rules = {
        exact_score: 3,
        correct_winner: -1,
        wrong: 0,
      };

      expect(ScoringService.validateScoringRules(rules)).toBe(false);
    });

    it('should reject rules with missing properties', () => {
      const rules = {
        exact_score: 3,
        correct_winner: 1,
      };

      expect(ScoringService.validateScoringRules(rules)).toBe(false);
    });

    it('should reject rules with non-number values', () => {
      const rules = {
        exact_score: '3',
        correct_winner: 1,
        wrong: 0,
      };

      expect(ScoringService.validateScoringRules(rules)).toBe(false);
    });

    it('should reject null or undefined', () => {
      expect(ScoringService.validateScoringRules(null)).toBe(false);
      expect(ScoringService.validateScoringRules(undefined)).toBe(false);
    });
  });

  describe('getDefaultRules', () => {
    it('should return default scoring rules', () => {
      const rules = ScoringService.getDefaultRules();

      expect(rules).toEqual({
        exact_score: 3,
        correct_winner: 1,
        wrong: 0,
      });
    });
  });
});
