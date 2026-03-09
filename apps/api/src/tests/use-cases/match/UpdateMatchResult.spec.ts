import { UpdateMatchResult } from '@/application/use-cases/match/UpdateMatchResult';
import { MatchRepository } from '@/application/ports/MatchRepository';
import { PickRepository } from '@/application/ports/PickRepository';
import { PoolRepository } from '@/application/ports/pool/PoolRepository';
import { Match } from '@/domain/entities/Match';
import { Pick } from '@/domain/entities/Pick';
import { Pool } from '@/domain/entities/pool/Pool';
import { 
  MatchNotFoundError, 
  InvalidScoreError, 
  InvalidMatchStatusError 
} from '@/domain/errors/DomainError';

describe('UpdateMatchResult', () => {
  let updateMatchResult: UpdateMatchResult;
  let mockMatchRepository: jest.Mocked<MatchRepository>;
  let mockPickRepository: jest.Mocked<PickRepository>;
  let mockPoolRepository: jest.Mocked<PoolRepository>;

  beforeEach(() => {
    mockMatchRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      updateResult: jest.fn(),
    };

    mockPickRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserMatchAndPool: jest.fn(),
      findByUserId: jest.fn(),
      findByUserIdAndPoolId: jest.fn(),
      findByMatchId: jest.fn(),
      findByPoolId: jest.fn(),
      update: jest.fn(),
      updatePoints: jest.fn(),
      delete: jest.fn(),
    };

    mockPoolRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByInviteCode: jest.fn(),
      findByOwnerId: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      addMember: jest.fn(),
      removeMember: jest.fn(),
      isMember: jest.fn(),
      getMembers: jest.fn(),
      getMemberCount: jest.fn(),
    };

    updateMatchResult = new UpdateMatchResult(
      mockMatchRepository,
      mockPickRepository,
      mockPoolRepository
    );
  });

  describe('execute', () => {
    it('should update match result and calculate points for all picks', async () => {
      const matchId = 1;
      const match: Match = {
        id: matchId,
        teamA: 'Brazil',
        teamB: 'Argentina',
        scheduledAt: new Date(),
        status: 'scheduled',
        createdAt: new Date(),
      };

      const pool = Pool.reconstitute({
        id: 1,
        name: 'Test Pool',
        inviteCode: 'ABC123',
        ownerId: 1,
        scoringRules: { exact_score: 3, correct_winner: 1, wrong: 0 },
        isActive: true,
        createdAt: new Date(),
      });

      const picks: Pick[] = [
        {
          id: 1,
          userId: 1,
          matchId,
          poolId: 1,
          predictedTeamAScore: 2,
          predictedTeamBScore: 1,
          points: 0,
          aiSuggested: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 2,
          matchId,
          poolId: 1,
          predictedTeamAScore: 3,
          predictedTeamBScore: 0,
          points: 0,
          aiSuggested: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const updatedMatch: Match = {
        ...match,
        teamAScore: 2,
        teamBScore: 1,
        status: 'finished',
      };

      mockMatchRepository.findById.mockResolvedValue(match);
      mockMatchRepository.updateResult.mockResolvedValue(updatedMatch);
      mockPickRepository.findByMatchId.mockResolvedValue(picks);
      mockPoolRepository.findById.mockResolvedValue(pool);
      mockPickRepository.updatePoints.mockResolvedValue(picks[0]);

      const result = await updateMatchResult.execute(matchId, {
        teamAScore: 2,
        teamBScore: 1,
        status: 'finished',
      });

      expect(result).toEqual(updatedMatch);
      expect(mockMatchRepository.updateResult).toHaveBeenCalledWith(matchId, {
        teamAScore: 2,
        teamBScore: 1,
        status: 'finished',
      });
      expect(mockPickRepository.updatePoints).toHaveBeenCalledWith(1, 3); // Exact score
      expect(mockPickRepository.updatePoints).toHaveBeenCalledWith(2, 1); // Correct winner
    });

    it('should throw MatchNotFoundError when match does not exist', async () => {
      mockMatchRepository.findById.mockResolvedValue(null);

      await expect(
        updateMatchResult.execute(999, {
          teamAScore: 2,
          teamBScore: 1,
          status: 'finished',
        })
      ).rejects.toThrow(MatchNotFoundError);
    });

    it('should throw InvalidScoreError for negative scores', async () => {
      const match: Match = {
        id: 1,
        teamA: 'Brazil',
        teamB: 'Argentina',
        scheduledAt: new Date(),
        status: 'scheduled',
        createdAt: new Date(),
      };

      mockMatchRepository.findById.mockResolvedValue(match);

      await expect(
        updateMatchResult.execute(1, {
          teamAScore: -1,
          teamBScore: 1,
          status: 'finished',
        })
      ).rejects.toThrow(InvalidScoreError);
    });

    it('should throw InvalidMatchStatusError for invalid status', async () => {
      const match: Match = {
        id: 1,
        teamA: 'Brazil',
        teamB: 'Argentina',
        scheduledAt: new Date(),
        status: 'scheduled',
        createdAt: new Date(),
      };

      mockMatchRepository.findById.mockResolvedValue(match);

      await expect(
        updateMatchResult.execute(1, {
          teamAScore: 2,
          teamBScore: 1,
          status: 'invalid' as any,
        })
      ).rejects.toThrow(InvalidMatchStatusError);
    });

    it('should not calculate points when match status is not finished', async () => {
      const match: Match = {
        id: 1,
        teamA: 'Brazil',
        teamB: 'Argentina',
        scheduledAt: new Date(),
        status: 'scheduled',
        createdAt: new Date(),
      };

      const updatedMatch: Match = {
        ...match,
        teamAScore: 2,
        teamBScore: 1,
        status: 'live',
      };

      mockMatchRepository.findById.mockResolvedValue(match);
      mockMatchRepository.updateResult.mockResolvedValue(updatedMatch);

      await updateMatchResult.execute(1, {
        teamAScore: 2,
        teamBScore: 1,
        status: 'live',
      });

      expect(mockPickRepository.findByMatchId).not.toHaveBeenCalled();
      expect(mockPickRepository.updatePoints).not.toHaveBeenCalled();
    });

    it('should handle matches with no picks gracefully', async () => {
      const match: Match = {
        id: 1,
        teamA: 'Brazil',
        teamB: 'Argentina',
        scheduledAt: new Date(),
        status: 'scheduled',
        createdAt: new Date(),
      };

      const updatedMatch: Match = {
        ...match,
        teamAScore: 2,
        teamBScore: 1,
        status: 'finished',
      };

      mockMatchRepository.findById.mockResolvedValue(match);
      mockMatchRepository.updateResult.mockResolvedValue(updatedMatch);
      mockPickRepository.findByMatchId.mockResolvedValue([]);

      const result = await updateMatchResult.execute(1, {
        teamAScore: 2,
        teamBScore: 1,
        status: 'finished',
      });

      expect(result).toEqual(updatedMatch);
      expect(mockPickRepository.updatePoints).not.toHaveBeenCalled();
    });

    it('should use default scoring rules when pool rules are invalid', async () => {
      const match: Match = {
        id: 1,
        teamA: 'Brazil',
        teamB: 'Argentina',
        scheduledAt: new Date(),
        status: 'scheduled',
        createdAt: new Date(),
      };

      const pool = Pool.reconstitute({
        id: 1,
        name: 'Test Pool',
        inviteCode: 'ABC123',
        ownerId: 1,
        scoringRules: { exact_score: 3, correct_winner: 1, wrong: 0 }, // Valid rules for reconstitute
        isActive: true,
        createdAt: new Date(),
      });
      
      // Mock the pool to return invalid rules
      jest.spyOn(pool, 'scoringRules', 'get').mockReturnValue({ invalid: 'rules' } as any);

      const pick: Pick = {
        id: 1,
        userId: 1,
        matchId: 1,
        poolId: 1,
        predictedTeamAScore: 2,
        predictedTeamBScore: 1,
        points: 0,
        aiSuggested: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedMatch: Match = {
        ...match,
        teamAScore: 2,
        teamBScore: 1,
        status: 'finished',
      };

      mockMatchRepository.findById.mockResolvedValue(match);
      mockMatchRepository.updateResult.mockResolvedValue(updatedMatch);
      mockPickRepository.findByMatchId.mockResolvedValue([pick]);
      mockPoolRepository.findById.mockResolvedValue(pool);
      mockPickRepository.updatePoints.mockResolvedValue(pick);

      await updateMatchResult.execute(1, {
        teamAScore: 2,
        teamBScore: 1,
        status: 'finished',
      });

      // Should use default rules (exact_score: 3)
      expect(mockPickRepository.updatePoints).toHaveBeenCalledWith(1, 3);
    });
  });
});
