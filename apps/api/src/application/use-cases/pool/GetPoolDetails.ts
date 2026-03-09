import { PoolRepository } from '../../ports/pool/PoolRepository';
import { PoolNotFoundError } from '../../../domain/errors/DomainError';
import { PoolDto } from '../../dtos/pool/PoolDto';

export class GetPoolDetails {
  constructor(private poolRepository: PoolRepository) {}

  async execute(poolId: number): Promise<PoolDto> {
    const pool = await this.poolRepository.findById(poolId);
    if (!pool) {
      throw new PoolNotFoundError(poolId);
    }

    const memberCount = await this.poolRepository.getMemberCount(poolId);

    return {
      id: pool.id!,
      name: pool.name,
      description: pool.description,
      inviteCode: pool.inviteCode,
      ownerId: pool.ownerId,
      scoringRules: pool.scoringRules,
      isActive: pool.isActive,
      createdAt: pool.createdAt!,
      memberCount,
    };
  }
}
