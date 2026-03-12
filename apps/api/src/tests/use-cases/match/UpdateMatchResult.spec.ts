import { UpdateMatchResult } from '@/application/use-cases/match/UpdateMatchResult';
import { MatchRepository } from '@/application/ports/MatchRepository';
import { PickRepository } from '@/application/ports/PickRepository';
import { PoolRepository } from '@/application/ports/pool/PoolRepository';
import { Match } from '@/domain/entities/Match';
import { Pick } from '@/domain/entities/Pick';
import { Pool, ScoringRules } from '@/domain/entities/pool/Pool';
import { DomainError } from '@/domain/errors/DomainError';

describe('UpdateMatchResult', () => {
  let matchRepository: jest.Mocked<MatchRepository>;
  let pickRepository: jest.Mocked<PickRepository>;
  let poolRepository: jest.Mocked<PoolRepository>;
  let useCase: UpdateMatchResult;

  const defaultScoringRules: ScoringRules = {
    exact_score: 3,
    correct_winner: 1,
    wrong: 0,
  };

  const mockMatch: Match = {
    id: 1,
    teamA: 'Brazil',
    teamB: 'Argentina',
    scheduledAt: new Date('2024-03-15T18:00:00Z'),
    teamAScore: undefined,
    teamBScore: undefined,
    status: 'scheduled',
    createdAt: new Date(),
  };

  const mockPool = Pool.reconstitute({
    id: 1,
    name: 'Test Pool',
    inviteCode: 'ABC123',
    ownerId: 1,
    scoringRules: defaultScoringRules,
    isActive: true,
    createdAt: new Date(),
  });

  beforeEach(() => {
    matchRepository = {
      findById: jest.fn(),
      updateResult: jest.fn(),
      create: jest.fn(),
      list: jest.fn(),
    };

    pickRepository = {
      findByMatchId: jest.fn(),
      updatePoints: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findByUserMatchAndPool: jest.fn(),
      findByUserId: jest.fn(),
      findByUserIdAndPoolId: jest.fn(),
      findByPoolId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    poolRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      findByInviteCode: jest.fn(),
      findByUserId: jest.fn(),
      findByOwnerId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      addMember: jest.fn(),
      removeMember: jest.fn(),
      isMember: jest.fn(),
      getMemberCount: jest.fn(),
      getMembers: jest.fn(),
    };

    useCase = new UpdateMatchResult(matchRepository, pickRepository, poolRepository);
  });

  describe('execute', () => {
    it('should update match result and calculate scores when match finishes', async () => {
      const updatedMatch: Match = {
        ...mockMatch,
        teamAScore: 2,
        teamBScore: 1,
        status: 'finished',
      };

      const picks: Pick[] = [
        {
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
        },
        {
          id: 2,
          userId: 2,
          matchId: 1,
          poolId: 1,
          predictedTeamAScore: 1,
          predictedTeamBScore: 1,
          points: 0,
          aiSuggested: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      matchRepository.findById.mockResolvedValue(mockMatch);
      matchRepository.updateResult.mockResolvedValue(updatedMatch);
      pickRepository.findByMatchId.mockResolvedValue(picks);
      poolRepository.findById.mockResolvedValue(mockPool);
      pickRepository.updatePoints.mockImplementation(async (id, points) => ({
        ...picks.find((p) => p.id === id)!,
        points,
      }));

      const result = await useCase.execute({
        matchId: 1,
        teamAScore: 2,
        teamBScore: 1,
        status: 'finished',
      });

      expect(matchRepository.updateResult).toHaveBeenCalledWith(1, {
        teamAScore: 2,
        teamBScore: 1,
        status: 'finished',
      });

      expect(pickRepository.findByMatchId).toHaveBeenCalledWith(1);
      expect(pickRepository.updatePoints).toHaveBeenCalledTimes(2);
      
      // First pick has exact score: 3 points
      expect(pickRepository.updatePoints).toHaveBeenCalledWith(1, 3);
      
      // Second pick predicted draw but team A won: 0 points
      expect(pickRepository.updatePoints).toHaveBeenCalledWith(2, 0);

      expect(result.match).toEqual(updatedMatch);
      expect(result.calculatedPicks).toBe(2);
      expect(result.totalPoints).toBe(3);
    });

    it('should not calculate scores when match status is not finished', async () => {
      const liveMatch: Match = {
        ...mockMatch,
        teamAScore: 1,
        teamBScore: 0,
        status: 'live',
      };

      matchRepository.findById.mockResolvedValue(mockMatch);
      matchRepository.updateResult.mockResolvedValue(liveMatch);

      const result = await useCase.execute({
        matchId: 1,
        teamAScore: 1,
        teamBScore: 0,
        status: 'live',
      });

      expect(pickRepository.findByMatchId).not.toHaveBeenCalled();
      expect(pickRepository.updatePoints).not.toHaveBeenCalled();
      expect(result.calculatedPicks).toBe(0);
      expect(result.totalPoints).toBe(0);
    });

    it('should throw error when match not found', async () => {
      matchRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({
          matchId: 999,
          teamAScore: 2,
          teamBScore: 1,
          status: 'finished',
        })
      ).rejects.toThrow('Match with ID 999 not found');
    });

    it('should throw error for negative scores', async () => {
      matchRepository.findById.mockResolvedValue(mockMatch);

      await expect(
        useCase.execute({
          matchId: 1,
          teamAScore: -1,
          teamBScore: 2,
          status: 'finished',
        })
      ).rejects.toThrow('Scores must be non-negative');
    });

    it('should handle picks from different pools with different scoring rules', async () => {
      const updatedMatch: Match = {
        ...mockMatch,
        teamAScore: 3,
        teamBScore: 1,
        status: 'finished',
      };

      const pool1 = Pool.reconstitute({
        id: 1,
        name: 'Pool 1',
        inviteCode: 'ABC123',
        ownerId: 1,
        scoringRules: {
          exact_score: 3,
          correct_winner: 1,
          wrong: 0,
        },
        isActive: true,
        createdAt: new Date(),
      });

      const pool2 = Pool.reconstitute({
        id: 2,
        name: 'Pool 2',
        inviteCode: 'DEF456',
        ownerId: 2,
        scoringRules: {
          exact_score: 5,
          correct_winner: 2,
          wrong: 0,
        },
        isActive: true,
        createdAt: new Date(),
      });

      const picks: Pick[] = [
        {
          id: 1,
          userId: 1,
          matchId: 1,
          poolId: 1,
          predictedTeamAScore: 3,
          predictedTeamBScore: 1,
          points: 0,
          aiSuggested: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 2,
          matchId: 1,
          poolId: 2,
          predictedTeamAScore: 3,
          predictedTeamBScore: 1,
          points: 0,
          aiSuggested: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      matchRepository.findById.mockResolvedValue(mockMatch);
      matchRepository.updateResult.mockResolvedValue(updatedMatch);
      pickRepository.findByMatchId.mockResolvedValue(picks);
      poolRepository.findById.mockImplementation(async (id) => {
        if (id === 1) return pool1;
        if (id === 2) return pool2;
        return null;
      });
      pickRepository.updatePoints.mockImplementation(async (id, points) => ({
        ...picks.find((p) => p.id === id)!,
        points,
      }));

      const result = await useCase.execute({
        matchId: 1,
        teamAScore: 3,
        teamBScore: 1,
        status: 'finished',
      });

      // Pool 1 awards 3 points for exact score
      expect(pickRepository.updatePoints).toHaveBeenCalledWith(1, 3);
      
      // Pool 2 awards 5 points for exact score
      expect(pickRepository.updatePoints).toHaveBeenCalledWith(2, 5);

      expect(result.calculatedPicks).toBe(2);
      expect(result.totalPoints).toBe(8); // 3 + 5
    });

    it('should handle match with no picks', async () => {
      const updatedMatch: Match = {
        ...mockMatch,
        teamAScore: 2,
        teamBScore: 1,
        status: 'finished',
      };

      matchRepository.findById.mockResolvedValue(mockMatch);
      matchRepository.updateResult.mockResolvedValue(updatedMatch);
      pickRepository.findByMatchId.mockResolvedValue([]);

      const result = await useCase.execute({
        matchId: 1,
        teamAScore: 2,
        teamBScore: 1,
        status: 'finished',
      });

      expect(result.calculatedPicks).toBe(0);
      expect(result.totalPoints).toBe(0);
    });
  });
});
