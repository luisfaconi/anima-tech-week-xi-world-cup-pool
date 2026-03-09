import { Pool } from '../../../domain/entities/pool/Pool';
import { PoolMembership } from '../../../domain/entities/pool/PoolMembership';
import { PoolRepository } from '../../ports/pool/PoolRepository';
import { UserRepository } from '../../ports/user/UserRepository';
import { UserNotFoundError } from '../../../domain/errors/DomainError';
import { CreatePoolDto, PoolDto } from '../../dtos/pool/PoolDto';

export class CreatePool {
  constructor(
    private poolRepository: PoolRepository,
    private userRepository: UserRepository
  ) {}

  async execute(dto: CreatePoolDto): Promise<PoolDto> {
    // Validate owner exists
    const owner = await this.userRepository.findById(dto.ownerId);
    if (!owner) {
      throw new UserNotFoundError(dto.ownerId);
    }

    // Create pool with default scoring rules if not provided
    const scoringRules = dto.scoringRules || {
      exact_score: 5,
      goal_difference: 3,
      correct_winner: 1,
      wrong: 0,
    };

    const pool = Pool.create({
      name: dto.name,
      description: dto.description,
      ownerId: dto.ownerId,
      scoringRules,
    });

    // Save pool
    const savedPool = await this.poolRepository.create(pool);

    // Automatically add owner as first member
    const membership = PoolMembership.create(savedPool.id!, dto.ownerId);
    await this.poolRepository.addMember(membership);

    return {
      id: savedPool.id!,
      name: savedPool.name,
      description: savedPool.description,
      inviteCode: savedPool.inviteCode,
      ownerId: savedPool.ownerId,
      scoringRules: savedPool.scoringRules,
      isActive: savedPool.isActive,
      createdAt: savedPool.createdAt!,
      memberCount: 1,
    };
  }
}
