import { PoolRepository } from '../../ports/pool/PoolRepository';
import { UserRepository } from '../../ports/user/UserRepository';
import { PoolNotFoundError } from '../../../domain/errors/DomainError';
import { PoolMemberDto } from '../../dtos/pool/PoolDto';

export class GetPoolMembers {
  constructor(
    private poolRepository: PoolRepository,
    private userRepository: UserRepository
  ) {}

  async execute(poolId: number): Promise<PoolMemberDto[]> {
    // Validate pool exists
    const pool = await this.poolRepository.findById(poolId);
    if (!pool) {
      throw new PoolNotFoundError(poolId);
    }

    const memberships = await this.poolRepository.getMembers(poolId);

    // Enrich with user names
    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await this.userRepository.findById(membership.userId);
        return {
          id: membership.id!,
          poolId: membership.poolId,
          userId: membership.userId,
          userName: user?.name,
          joinedAt: membership.joinedAt!,
        };
      })
    );

    return members;
  }
}
