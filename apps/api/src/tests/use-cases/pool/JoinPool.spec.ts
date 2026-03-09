import { JoinPool } from '../../../application/use-cases/pool/JoinPool';
import { Pool } from '../../../domain/entities/pool/Pool';
import { User } from '../../../domain/entities/user/User';
import { PoolMembership } from '../../../domain/entities/pool/PoolMembership';
import { PoolRepository } from '../../../application/ports/pool/PoolRepository';
import { UserRepository } from '../../../application/ports/user/UserRepository';
import {
  UserNotFoundError,
  PoolNotFoundByCodeError,
  PoolInactiveError,
  UserAlreadyInPoolError,
} from '../../../domain/errors/DomainError';

describe('JoinPool', () => {
  let joinPool: JoinPool;
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

    joinPool = new JoinPool(mockPoolRepository, mockUserRepository);
  });

  it('should allow user to join pool with valid invite code', async () => {
    const user: User = {
      id: 2,
      name: 'Jane Doe',
      email: 'jane@example.com',
      createdAt: new Date(),
    };

    const pool = Pool.reconstitute({
      id: 1,
      name: 'Test Pool',
      inviteCode: 'ABC123',
      ownerId: 1,
      scoringRules: {
        exact_score: 5,
        correct_winner: 1,
        wrong: 0,
      },
      isActive: true,
      createdAt: new Date(),
    });

    const membership = PoolMembership.reconstitute({
      id: 1,
      poolId: 1,
      userId: 2,
      joinedAt: new Date(),
    });

    mockUserRepository.findById.mockResolvedValue(user);
    mockPoolRepository.findByInviteCode.mockResolvedValue(pool);
    mockPoolRepository.isMember.mockResolvedValue(false);
    mockPoolRepository.addMember.mockResolvedValue(membership);

    const result = await joinPool.execute({
      userId: 2,
      inviteCode: 'ABC123',
    });

    expect(result.userId).toBe(2);
    expect(result.poolId).toBe(1);
    expect(result.userName).toBe('Jane Doe');
    expect(mockPoolRepository.addMember).toHaveBeenCalled();
  });

  it('should throw UserNotFoundError if user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(
      joinPool.execute({
        userId: 999,
        inviteCode: 'ABC123',
      })
    ).rejects.toThrow(UserNotFoundError);
  });

  it('should throw PoolNotFoundByCodeError if invite code is invalid', async () => {
    const user: User = {
      id: 2,
      name: 'Jane Doe',
      email: 'jane@example.com',
      createdAt: new Date(),
    };

    mockUserRepository.findById.mockResolvedValue(user);
    mockPoolRepository.findByInviteCode.mockResolvedValue(null);

    await expect(
      joinPool.execute({
        userId: 2,
        inviteCode: 'INVALID',
      })
    ).rejects.toThrow(PoolNotFoundByCodeError);
  });

  it('should throw PoolInactiveError if pool is inactive', async () => {
    const user: User = {
      id: 2,
      name: 'Jane Doe',
      email: 'jane@example.com',
      createdAt: new Date(),
    };

    const inactivePool = Pool.reconstitute({
      id: 1,
      name: 'Inactive Pool',
      inviteCode: 'ABC123',
      ownerId: 1,
      scoringRules: {
        exact_score: 5,
        correct_winner: 1,
        wrong: 0,
      },
      isActive: false,
      createdAt: new Date(),
    });

    mockUserRepository.findById.mockResolvedValue(user);
    mockPoolRepository.findByInviteCode.mockResolvedValue(inactivePool);

    await expect(
      joinPool.execute({
        userId: 2,
        inviteCode: 'ABC123',
      })
    ).rejects.toThrow(PoolInactiveError);
  });

  it('should throw UserAlreadyInPoolError if user is already a member', async () => {
    const user: User = {
      id: 2,
      name: 'Jane Doe',
      email: 'jane@example.com',
      createdAt: new Date(),
    };

    const pool = Pool.reconstitute({
      id: 1,
      name: 'Test Pool',
      inviteCode: 'ABC123',
      ownerId: 1,
      scoringRules: {
        exact_score: 5,
        correct_winner: 1,
        wrong: 0,
      },
      isActive: true,
      createdAt: new Date(),
    });

    mockUserRepository.findById.mockResolvedValue(user);
    mockPoolRepository.findByInviteCode.mockResolvedValue(pool);
    mockPoolRepository.isMember.mockResolvedValue(true);

    await expect(
      joinPool.execute({
        userId: 2,
        inviteCode: 'ABC123',
      })
    ).rejects.toThrow(UserAlreadyInPoolError);
  });
});
