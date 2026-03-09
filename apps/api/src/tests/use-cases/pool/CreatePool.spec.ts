import { CreatePool } from '../../../application/use-cases/pool/CreatePool';
import { Pool } from '../../../domain/entities/pool/Pool';
import { User } from '../../../domain/entities/user/User';
import { PoolRepository } from '../../../application/ports/pool/PoolRepository';
import { UserRepository } from '../../../application/ports/user/UserRepository';
import { UserNotFoundError } from '../../../domain/errors/DomainError';
import { PoolMembership } from '../../../domain/entities/pool/PoolMembership';

describe('CreatePool', () => {
  let createPool: CreatePool;
  let mockPoolRepository: jest.Mocked<PoolRepository>;
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

    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      list: jest.fn(),
    };

    createPool = new CreatePool(mockPoolRepository, mockUserRepository);
  });

  it('should create a pool with default scoring rules', async () => {
    const owner: User = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date(),
    };

    const createdPool = Pool.reconstitute({
      id: 1,
      name: 'Test Pool',
      description: 'Test Description',
      inviteCode: 'ABC123',
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

    const membership = PoolMembership.reconstitute({
      id: 1,
      poolId: 1,
      userId: 1,
      joinedAt: new Date(),
    });

    mockUserRepository.findById.mockResolvedValue(owner);
    mockPoolRepository.create.mockResolvedValue(createdPool);
    mockPoolRepository.addMember.mockResolvedValue(membership);

    const result = await createPool.execute({
      name: 'Test Pool',
      description: 'Test Description',
      ownerId: 1,
    });

    expect(result.name).toBe('Test Pool');
    expect(result.ownerId).toBe(1);
    expect(result.scoringRules.exact_score).toBe(5);
    expect(result.memberCount).toBe(1);
    expect(mockPoolRepository.create).toHaveBeenCalled();
    expect(mockPoolRepository.addMember).toHaveBeenCalled();
  });

  it('should create a pool with custom scoring rules', async () => {
    const owner: User = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date(),
    };

    const customRules = {
      exact_score: 10,
      goal_difference: 5,
      correct_winner: 2,
      wrong: 0,
    };

    const createdPool = Pool.reconstitute({
      id: 1,
      name: 'Custom Pool',
      inviteCode: 'XYZ789',
      ownerId: 1,
      scoringRules: customRules,
      isActive: true,
      createdAt: new Date(),
    });

    const membership = PoolMembership.reconstitute({
      id: 1,
      poolId: 1,
      userId: 1,
      joinedAt: new Date(),
    });

    mockUserRepository.findById.mockResolvedValue(owner);
    mockPoolRepository.create.mockResolvedValue(createdPool);
    mockPoolRepository.addMember.mockResolvedValue(membership);

    const result = await createPool.execute({
      name: 'Custom Pool',
      ownerId: 1,
      scoringRules: customRules,
    });

    expect(result.scoringRules.exact_score).toBe(10);
    expect(result.scoringRules.goal_difference).toBe(5);
  });

  it('should throw UserNotFoundError if owner does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(
      createPool.execute({
        name: 'Test Pool',
        ownerId: 999,
      })
    ).rejects.toThrow(UserNotFoundError);
  });

  it('should automatically add owner as first member', async () => {
    const owner: User = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date(),
    };

    const createdPool = Pool.reconstitute({
      id: 1,
      name: 'Test Pool',
      inviteCode: 'ABC123',
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

    const membership = PoolMembership.reconstitute({
      id: 1,
      poolId: 1,
      userId: 1,
      joinedAt: new Date(),
    });

    mockUserRepository.findById.mockResolvedValue(owner);
    mockPoolRepository.create.mockResolvedValue(createdPool);
    mockPoolRepository.addMember.mockResolvedValue(membership);

    await createPool.execute({
      name: 'Test Pool',
      ownerId: 1,
    });

    expect(mockPoolRepository.addMember).toHaveBeenCalledWith(
      expect.objectContaining({
        poolId: 1,
        userId: 1,
      })
    );
  });
});
