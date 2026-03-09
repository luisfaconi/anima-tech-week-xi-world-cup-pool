import { Pick, CreatePickData } from '@/domain/entities/Pick';
import { PickRepository } from '@/application/ports/PickRepository';
import { MatchRepository } from '@/application/ports/MatchRepository';
import { UserRepository } from '@/application/ports/user/UserRepository';
import { PoolRepository } from '@/application/ports/pool/PoolRepository';
import {
  UserNotFoundError,
  MatchNotFoundError,
  PoolNotFoundError,
  PoolInactiveError,
  UserNotPoolMemberError,
  DuplicatePickError,
  MatchAlreadyStartedError,
} from '@/domain/errors/DomainError';

export class CreatePickUseCase {
  constructor(
    private pickRepository: PickRepository,
    private matchRepository: MatchRepository,
    private userRepository: UserRepository,
    private poolRepository: PoolRepository
  ) {}

  async execute(pickData: CreatePickData): Promise<Pick> {
    // Validate user exists
    const user = await this.userRepository.findById(pickData.userId);
    if (!user) {
      throw new UserNotFoundError(pickData.userId);
    }

    // Validate match exists
    const match = await this.matchRepository.findById(pickData.matchId);
    if (!match) {
      throw new MatchNotFoundError(pickData.matchId);
    }

    // Validate pool exists and is active
    const pool = await this.poolRepository.findById(pickData.poolId);
    if (!pool) {
      throw new PoolNotFoundError(pickData.poolId);
    }
    if (!pool.isActive) {
      throw new PoolInactiveError(pickData.poolId);
    }

    // Validate user is a member of the pool
    const isMember = await this.poolRepository.isMember(pickData.poolId, pickData.userId);
    if (!isMember) {
      throw new UserNotPoolMemberError(pickData.userId, pickData.poolId);
    }

    // Validate match hasn't started yet
    if (new Date() >= match.scheduledAt) {
      throw new MatchAlreadyStartedError(pickData.matchId);
    }

    // Check for duplicate pick
    const existingPick = await this.pickRepository.findByUserMatchAndPool(
      pickData.userId,
      pickData.matchId,
      pickData.poolId
    );
    if (existingPick) {
      throw new DuplicatePickError(pickData.userId, pickData.matchId);
    }

    // Create the pick
    return this.pickRepository.create(pickData);
  }
}
