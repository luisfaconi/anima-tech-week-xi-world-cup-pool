import { GetUserStats } from '../../../application/use-cases/user/GetUserStats';
import { UserRepository } from '../../../application/ports/user/UserRepository';
import { PoolRepository } from '../../../application/ports/pool/PoolRepository';
import { PickRepository } from '../../../application/ports/PickRepository';
import { User } from '../../../domain/entities/user/User';
import { Pool } from '../../../domain/entities/pool/Pool';
import { Pick } from '../../../domain/entities/Pick';
import { UserNotFoundError } from '../../../domain/errors/DomainError';
import { PoolMembership } from '../../../domain/entities/pool/PoolMembership';

describe('GetUserStats', () => {
  let getUserStats: GetUserStats;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockPoolRepository: jest.Mocked<PoolRepository>;
  let mockPickRepository: jest.Mocked<PickRepository>;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      list: jest.fn(),
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

    mockPickRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByMatchId: jest.fn(),
      findByUserMatchAndPool: jest.fn(),
      findByPoolId: jest.fn(),
      findByUserIdAndPoolId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updatePoints: jest.fn(),
    };

    getUserStats = new GetUserStats(
      mockUserRepository,
      mockPoolRepository,
      mockPickRepository
    );
  });

  it('should return stats with 0 averagePosition when user has no pools', async () => {
    const userId = 1;
    const user: User = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date(),
    };

    mockUserRepository.findById.mockResolvedValue(user);
    mockPoolRepository.findByUserId.mockResolvedValue([]);
    mockPickRepository.findByUserId.mockResolvedValue([]);

    const result = await getUserStats.execute({ userId });

    expect(result.averagePosition).toBe(0);
    expect(result.pools).toEqual([]);
  });

  it('should calculate stats for user in single pool', async () => {
    const userId = 1;
    const poolId = 1;
    
    const user: User = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date(),
    };

    const pool = Pool.reconstitute({
      id: poolId,
      name: 'Test Pool',
      inviteCode: 'TEST123',
      ownerId: userId,
      scoringRules: {
        exact_score: 5,
        goal_difference: 3,
        correct_winner: 1,
        wrong: 0,
      },
      isActive: true,
      createdAt: new Date(),
    });

    const userPicks: Pick[] = [
      {
        id: 1,
        userId,
        matchId: 1,
        poolId,
        predictedTeamAScore: 2,
        predictedTeamBScore: 1,
        points: 5,
        aiSuggested: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        userId,
        matchId: 2,
        poolId,
        predictedTeamAScore: 1,
        predictedTeamBScore: 1,
        points: 3,
        aiSuggested: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const allPoolPicks: Pick[] = [
      ...userPicks,
      {
        id: 3,
        userId: 2,
        matchId: 1,
        poolId,
        predictedTeamAScore: 3,
        predictedTeamBScore: 2,
        points: 5,
        aiSuggested: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        userId: 2,
        matchId: 2,
        poolId,
        predictedTeamAScore: 2,
        predictedTeamBScore: 0,
        points: 5,
        aiSuggested: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockUserRepository.findById.mockResolvedValue(user);
    mockPoolRepository.findByUserId.mockResolvedValue([pool]);
    mockPickRepository.findByUserId.mockResolvedValue(userPicks);
    mockPickRepository.findByUserIdAndPoolId.mockResolvedValue(userPicks);
    mockPickRepository.findByPoolId.mockResolvedValue(allPoolPicks);
    mockPoolRepository.getMemberCount.mockResolvedValue(2);

    const result = await getUserStats.execute({ userId });

    expect(result.averagePosition).toBe(2); // 2nd place
    expect(result.pools).toHaveLength(1);
    expect(result.pools[0]).toMatchObject({
      poolId,
      poolName: 'Test Pool',
      position: 2,
      totalPoints: 8,
      totalPicks: 2,
      memberCount: 2,
    });
  });

  it('should calculate average position across multiple pools', async () => {
    const userId = 1;
    
    const user: User = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date(),
    };

    const pools = [
      Pool.reconstitute({
        id: 1,
        name: 'Pool 1',
        inviteCode: 'POOL1',
        ownerId: userId,
        scoringRules: {
          exact_score: 5,
          goal_difference: 3,
          correct_winner: 1,
          wrong: 0,
        },
        isActive: true,
        createdAt: new Date(),
      }),
      Pool.reconstitute({
        id: 2,
        name: 'Pool 2',
        inviteCode: 'POOL2',
        ownerId: userId,
        scoringRules: {
          exact_score: 5,
          goal_difference: 3,
          correct_winner: 1,
          wrong: 0,
        },
        isActive: true,
        createdAt: new Date(),
      }),
    ];

    // Pool 1: User is 1st (10 points)
    const pool1Picks: Pick[] = [
      {
        id: 1,
        userId,
        matchId: 1,
        poolId: 1,
        predictedTeamAScore: 2,
        predictedTeamBScore: 1,
        points: 10,
        aiSuggested: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Pool 2: User is 3rd (5 points vs 15, 10)
    const pool2UserPicks: Pick[] = [
      {
        id: 2,
        userId,
        matchId: 1,
        poolId: 2,
        predictedTeamAScore: 1,
        predictedTeamBScore: 0,
        points: 5,
        aiSuggested: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const pool2AllPicks: Pick[] = [
      ...pool2UserPicks,
      {
        id: 3,
        userId: 2,
        matchId: 1,
        poolId: 2,
        predictedTeamAScore: 2,
        predictedTeamBScore: 1,
        points: 15,
        aiSuggested: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        userId: 3,
        matchId: 1,
        poolId: 2,
        predictedTeamAScore: 1,
        predictedTeamBScore: 1,
        points: 10,
        aiSuggested: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const allUserPicks = [...pool1Picks, ...pool2UserPicks];

    mockUserRepository.findById.mockResolvedValue(user);
    mockPoolRepository.findByUserId.mockResolvedValue(pools);
    mockPickRepository.findByUserId.mockResolvedValue(allUserPicks);
    mockPickRepository.findByUserIdAndPoolId.mockImplementation((uid, pid) => {
      if (pid === 1) return Promise.resolve(pool1Picks);
      if (pid === 2) return Promise.resolve(pool2UserPicks);
      return Promise.resolve([]);
    });
    mockPickRepository.findByPoolId.mockImplementation((pid) => {
      if (pid === 1) return Promise.resolve(pool1Picks);
      if (pid === 2) return Promise.resolve(pool2AllPicks);
      return Promise.resolve([]);
    });
    mockPoolRepository.getMemberCount.mockResolvedValue(3);

    const result = await getUserStats.execute({ userId });

    // Average: (1 + 3) / 2 = 2
    expect(result.averagePosition).toBe(2);
    expect(result.pools).toHaveLength(2);
  });

  it('should throw error when user does not exist', async () => {
    const userId = 999;
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(getUserStats.execute({ userId })).rejects.toThrow(UserNotFoundError);
  });
});
