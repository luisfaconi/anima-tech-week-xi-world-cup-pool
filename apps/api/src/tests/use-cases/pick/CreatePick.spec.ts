import { CreatePickUseCase } from '../../../application/use-cases/pick/CreatePick';
import { PickRepository } from '../../../application/ports/PickRepository';
import { MatchRepository } from '../../../application/ports/MatchRepository';
import { UserRepository } from '../../../application/ports/user/UserRepository';
import { PoolRepository } from '../../../application/ports/pool/PoolRepository';
import {
  UserNotFoundError,
  MatchNotFoundError,
  PoolNotFoundError,
  PoolInactiveError,
  UserNotPoolMemberError,
  DuplicatePickError,
  MatchAlreadyStartedError,
} from '../../../domain/errors/DomainError';

describe('CreatePickUseCase', () => {
  let createPickUseCase: CreatePickUseCase;
  let mockPickRepository: jest.Mocked<PickRepository>;
  let mockMatchRepository: jest.Mocked<MatchRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockPoolRepository: jest.Mocked<PoolRepository>;

  beforeEach(() => {
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

    mockMatchRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      updateResult: jest.fn(),
      hasFinishedMatches: jest.fn(),
    };

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

    createPickUseCase = new CreatePickUseCase(
      mockPickRepository,
      mockMatchRepository,
      mockUserRepository,
      mockPoolRepository
    );
  });

  it('should create a pick successfully', async () => {
    const pickData = {
      userId: 1,
      matchId: 1,
      poolId: 1,
      predictedTeamAScore: 2,
      predictedTeamBScore: 1,
    };

    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com', createdAt: new Date() };
    const mockMatch = {
      id: 1,
      teamA: 'Brazil',
      teamB: 'Argentina',
      scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
      status: 'scheduled' as const,
      createdAt: new Date(),
    };
    const mockPool = {
      id: 1,
      name: 'Test Pool',
      description: 'Test',
      inviteCode: 'ABC123',
      ownerId: 1,
      scoringRules: {},
      isActive: true,
      createdAt: new Date(),
    };
    const mockPick = {
      id: 1,
      ...pickData,
      points: 0,
      aiSuggested: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockMatchRepository.findById.mockResolvedValue(mockMatch);
    mockPoolRepository.findById.mockResolvedValue(mockPool);
    mockPoolRepository.isMember.mockResolvedValue(true);
    mockPickRepository.findByUserMatchAndPool.mockResolvedValue(null);
    mockPickRepository.create.mockResolvedValue(mockPick);

    const result = await createPickUseCase.execute(pickData);

    expect(result).toEqual(mockPick);
    expect(mockPickRepository.create).toHaveBeenCalledWith(pickData);
  });

  it('should throw UserNotFoundError if user does not exist', async () => {
    const pickData = {
      userId: 999,
      matchId: 1,
      poolId: 1,
      predictedTeamAScore: 2,
      predictedTeamBScore: 1,
    };

    mockUserRepository.findById.mockResolvedValue(null);

    await expect(createPickUseCase.execute(pickData)).rejects.toThrow(UserNotFoundError);
  });

  it('should throw MatchNotFoundError if match does not exist', async () => {
    const pickData = {
      userId: 1,
      matchId: 999,
      poolId: 1,
      predictedTeamAScore: 2,
      predictedTeamBScore: 1,
    };

    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com', createdAt: new Date() };
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockMatchRepository.findById.mockResolvedValue(null);

    await expect(createPickUseCase.execute(pickData)).rejects.toThrow(MatchNotFoundError);
  });

  it('should throw PoolNotFoundError if pool does not exist', async () => {
    const pickData = {
      userId: 1,
      matchId: 1,
      poolId: 999,
      predictedTeamAScore: 2,
      predictedTeamBScore: 1,
    };

    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com', createdAt: new Date() };
    const mockMatch = {
      id: 1,
      teamA: 'Brazil',
      teamB: 'Argentina',
      scheduledAt: new Date(Date.now() + 86400000),
      status: 'scheduled' as const,
      createdAt: new Date(),
    };

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockMatchRepository.findById.mockResolvedValue(mockMatch);
    mockPoolRepository.findById.mockResolvedValue(null);

    await expect(createPickUseCase.execute(pickData)).rejects.toThrow(PoolNotFoundError);
  });

  it('should throw PoolInactiveError if pool is inactive', async () => {
    const pickData = {
      userId: 1,
      matchId: 1,
      poolId: 1,
      predictedTeamAScore: 2,
      predictedTeamBScore: 1,
    };

    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com', createdAt: new Date() };
    const mockMatch = {
      id: 1,
      teamA: 'Brazil',
      teamB: 'Argentina',
      scheduledAt: new Date(Date.now() + 86400000),
      status: 'scheduled' as const,
      createdAt: new Date(),
    };
    const mockPool = {
      id: 1,
      name: 'Test Pool',
      description: 'Test',
      inviteCode: 'ABC123',
      ownerId: 1,
      scoringRules: {},
      isActive: false,
      createdAt: new Date(),
    };

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockMatchRepository.findById.mockResolvedValue(mockMatch);
    mockPoolRepository.findById.mockResolvedValue(mockPool);

    await expect(createPickUseCase.execute(pickData)).rejects.toThrow(PoolInactiveError);
  });

  it('should throw UserNotPoolMemberError if user is not a member', async () => {
    const pickData = {
      userId: 1,
      matchId: 1,
      poolId: 1,
      predictedTeamAScore: 2,
      predictedTeamBScore: 1,
    };

    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com', createdAt: new Date() };
    const mockMatch = {
      id: 1,
      teamA: 'Brazil',
      teamB: 'Argentina',
      scheduledAt: new Date(Date.now() + 86400000),
      status: 'scheduled' as const,
      createdAt: new Date(),
    };
    const mockPool = {
      id: 1,
      name: 'Test Pool',
      description: 'Test',
      inviteCode: 'ABC123',
      ownerId: 1,
      scoringRules: {},
      isActive: true,
      createdAt: new Date(),
    };

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockMatchRepository.findById.mockResolvedValue(mockMatch);
    mockPoolRepository.findById.mockResolvedValue(mockPool);
    mockPoolRepository.isMember.mockResolvedValue(false);

    await expect(createPickUseCase.execute(pickData)).rejects.toThrow(UserNotPoolMemberError);
  });

  it('should throw MatchAlreadyStartedError if match has started', async () => {
    const pickData = {
      userId: 1,
      matchId: 1,
      poolId: 1,
      predictedTeamAScore: 2,
      predictedTeamBScore: 1,
    };

    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com', createdAt: new Date() };
    const mockMatch = {
      id: 1,
      teamA: 'Brazil',
      teamB: 'Argentina',
      scheduledAt: new Date(Date.now() - 3600000), // 1 hour ago
      status: 'live' as const,
      createdAt: new Date(),
    };
    const mockPool = {
      id: 1,
      name: 'Test Pool',
      description: 'Test',
      inviteCode: 'ABC123',
      ownerId: 1,
      scoringRules: {},
      isActive: true,
      createdAt: new Date(),
    };

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockMatchRepository.findById.mockResolvedValue(mockMatch);
    mockPoolRepository.findById.mockResolvedValue(mockPool);
    mockPoolRepository.isMember.mockResolvedValue(true);

    await expect(createPickUseCase.execute(pickData)).rejects.toThrow(MatchAlreadyStartedError);
  });

  it('should throw DuplicatePickError if pick already exists', async () => {
    const pickData = {
      userId: 1,
      matchId: 1,
      poolId: 1,
      predictedTeamAScore: 2,
      predictedTeamBScore: 1,
    };

    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com', createdAt: new Date() };
    const mockMatch = {
      id: 1,
      teamA: 'Brazil',
      teamB: 'Argentina',
      scheduledAt: new Date(Date.now() + 86400000),
      status: 'scheduled' as const,
      createdAt: new Date(),
    };
    const mockPool = {
      id: 1,
      name: 'Test Pool',
      description: 'Test',
      inviteCode: 'ABC123',
      ownerId: 1,
      scoringRules: {},
      isActive: true,
      createdAt: new Date(),
    };
    const existingPick = {
      id: 1,
      ...pickData,
      points: 0,
      aiSuggested: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockMatchRepository.findById.mockResolvedValue(mockMatch);
    mockPoolRepository.findById.mockResolvedValue(mockPool);
    mockPoolRepository.isMember.mockResolvedValue(true);
    mockPickRepository.findByUserMatchAndPool.mockResolvedValue(existingPick);

    await expect(createPickUseCase.execute(pickData)).rejects.toThrow(DuplicatePickError);
  });
});
