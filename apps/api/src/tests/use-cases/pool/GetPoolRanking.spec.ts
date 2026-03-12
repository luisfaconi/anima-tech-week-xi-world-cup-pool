import { GetPoolRanking } from '../../../application/use-cases/pool/GetPoolRanking';
import { PoolRepository } from '../../../application/ports/pool/PoolRepository';
import { PickRepository } from '../../../application/ports/PickRepository';
import { UserRepository } from '../../../application/ports/user/UserRepository';
import { Pool } from '../../../domain/entities/pool/Pool';
import { Pick } from '../../../domain/entities/Pick';
import { User } from '../../../domain/entities/user/User';
import { PoolNotFoundError } from '../../../domain/errors/DomainError';
import { PoolMembership } from '../../../domain/entities/pool/PoolMembership';

describe('GetPoolRanking', () => {
  let getPoolRanking: GetPoolRanking;
  let mockPoolRepository: jest.Mocked<PoolRepository>;
  let mockPickRepository: jest.Mocked<PickRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
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

    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      list: jest.fn(),
    };

    getPoolRanking = new GetPoolRanking(
      mockPoolRepository,
      mockPickRepository,
      mockUserRepository
    );
  });

  it('should return empty ranking when pool has no members', async () => {
    const poolId = 1;
    const pool = Pool.reconstitute({
      id: poolId,
      name: 'Test Pool',
      inviteCode: 'TEST123',
      ownerId: 1,
      scoringRules: {
        exact_score: 5,
        goal_difference: 3,
        correct_winner: 1,
        wrong: 0,
      },
      isActive: true,
      createdAt: new Date(),
    });

    mockPoolRepository.findById.mockResolvedValue(pool);
    mockPoolRepository.getMembers.mockResolvedValue([]);
    mockPickRepository.findByPoolId.mockResolvedValue([]);

    const result = await getPoolRanking.execute({ poolId });

    expect(result.ranking).toEqual([]);
    expect(mockPoolRepository.findById).toHaveBeenCalledWith(poolId);
    expect(mockPoolRepository.getMembers).toHaveBeenCalledWith(poolId);
  });

  it('should calculate ranking with single user', async () => {
    const poolId = 1;
    const userId = 1;
    const pool = Pool.reconstitute({
      id: poolId,
      name: 'Test Pool',
      inviteCode: 'TEST123',
      ownerId: 1,
      scoringRules: {
        exact_score: 5,
        goal_difference: 3,
        correct_winner: 1,
        wrong: 0,
      },
      isActive: true,
      createdAt: new Date(),
    });

    const user: User = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date(),
    };

    const membership = PoolMembership.reconstitute({
      id: 1,
      poolId,
      userId,
      joinedAt: new Date(),
    });

    const picks: Pick[] = [
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

    mockPoolRepository.findById.mockResolvedValue(pool);
    mockPoolRepository.getMembers.mockResolvedValue([membership]);
    mockPickRepository.findByPoolId.mockResolvedValue(picks);
    mockUserRepository.findById.mockResolvedValue(user);

    const result = await getPoolRanking.execute({ poolId });

    expect(result.ranking).toHaveLength(1);
    expect(result.ranking[0]).toMatchObject({
      position: 1,
      userId,
      userName: 'John Doe',
      totalPoints: 8,
      totalPicks: 2,
      correctPicks: 2,
    });
  });

  it('should calculate ranking with multiple users and sort by points', async () => {
    const poolId = 1;
    const pool = Pool.reconstitute({
      id: poolId,
      name: 'Test Pool',
      inviteCode: 'TEST123',
      ownerId: 1,
      scoringRules: {
        exact_score: 5,
        goal_difference: 3,
        correct_winner: 1,
        wrong: 0,
      },
      isActive: true,
      createdAt: new Date(),
    });

    const users: User[] = [
      {
        id: 1,
        name: 'Alice',
        email: 'alice@example.com',
        createdAt: new Date(),
      },
      {
        id: 2,
        name: 'Bob',
        email: 'bob@example.com',
        createdAt: new Date(),
      },
      {
        id: 3,
        name: 'Charlie',
        email: 'charlie@example.com',
        createdAt: new Date(),
      },
    ];

    const memberships = [
      PoolMembership.reconstitute({
        id: 1,
        poolId,
        userId: 1,
        joinedAt: new Date(),
      }),
      PoolMembership.reconstitute({
        id: 2,
        poolId,
        userId: 2,
        joinedAt: new Date(),
      }),
      PoolMembership.reconstitute({
        id: 3,
        poolId,
        userId: 3,
        joinedAt: new Date(),
      }),
    ];

    const picks: Pick[] = [
      // Alice: 10 points
      {
        id: 1,
        userId: 1,
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
        userId: 1,
        matchId: 2,
        poolId,
        predictedTeamAScore: 1,
        predictedTeamBScore: 1,
        points: 5,
        aiSuggested: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Bob: 15 points
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
      {
        id: 5,
        userId: 2,
        matchId: 3,
        poolId,
        predictedTeamAScore: 1,
        predictedTeamBScore: 1,
        points: 5,
        aiSuggested: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Charlie: 3 points
      {
        id: 6,
        userId: 3,
        matchId: 1,
        poolId,
        predictedTeamAScore: 0,
        predictedTeamBScore: 0,
        points: 3,
        aiSuggested: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockPoolRepository.findById.mockResolvedValue(pool);
    mockPoolRepository.getMembers.mockResolvedValue(memberships);
    mockPickRepository.findByPoolId.mockResolvedValue(picks);
    mockUserRepository.findById.mockImplementation((id) => {
      return Promise.resolve(users.find(u => u.id === id) || null);
    });

    const result = await getPoolRanking.execute({ poolId });

    expect(result.ranking).toHaveLength(3);
    
    // Bob should be first (15 points)
    expect(result.ranking[0]).toMatchObject({
      position: 1,
      userId: 2,
      userName: 'Bob',
      totalPoints: 15,
      totalPicks: 3,
      correctPicks: 3,
    });

    // Alice should be second (10 points)
    expect(result.ranking[1]).toMatchObject({
      position: 2,
      userId: 1,
      userName: 'Alice',
      totalPoints: 10,
      totalPicks: 2,
      correctPicks: 2,
    });

    // Charlie should be third (3 points)
    expect(result.ranking[2]).toMatchObject({
      position: 3,
      userId: 3,
      userName: 'Charlie',
      totalPoints: 3,
      totalPicks: 1,
      correctPicks: 1,
    });
  });

  it('should throw error when pool does not exist', async () => {
    const poolId = 999;
    mockPoolRepository.findById.mockResolvedValue(null);

    await expect(getPoolRanking.execute({ poolId })).rejects.toThrow(PoolNotFoundError);
  });
});
