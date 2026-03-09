import { PoolRepository } from '../../ports/pool/PoolRepository';
import { PoolNotFoundError, UnauthorizedPoolActionError } from '../../../domain/errors/DomainError';
import { UpdatePoolDto, PoolDto } from '../../dtos/pool/PoolDto';

export class UpdatePool {
  constructor(private poolRepository: PoolRepository) {}

  async execute(poolId: number, userId: number, dto: UpdatePoolDto): Promise<PoolDto> {
    const pool = await this.poolRepository.findById(poolId);
    if (!pool) {
      throw new PoolNotFoundError(poolId);
    }

    // Only pool owner can update
    if (!pool.isOwner(userId)) {
      throw new UnauthorizedPoolActionError('Only pool owner can update pool settings');
    }

    // Update pool details
    if (dto.name !== undefined || dto.description !== undefined) {
      pool.updateDetails(
        dto.name ?? pool.name,
        dto.description !== undefined ? dto.description : pool.description
      );
    }

    // Update scoring rules if provided
    if (dto.scoringRules) {
      pool.updateScoringRules(dto.scoringRules);
    }

    const updatedPool = await this.poolRepository.update(pool);
    const memberCount = await this.poolRepository.getMemberCount(poolId);

    return {
      id: updatedPool.id!,
      name: updatedPool.name,
      description: updatedPool.description,
      inviteCode: updatedPool.inviteCode,
      ownerId: updatedPool.ownerId,
      scoringRules: updatedPool.scoringRules,
      isActive: updatedPool.isActive,
      createdAt: updatedPool.createdAt!,
      memberCount,
    };
  }
}
