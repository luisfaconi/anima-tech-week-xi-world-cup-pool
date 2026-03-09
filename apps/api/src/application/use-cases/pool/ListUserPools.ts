import { PoolRepository } from '../../ports/pool/PoolRepository';
import { UserRepository } from '../../ports/user/UserRepository';
import { UserNotFoundError } from '../../../domain/errors/DomainError';
import { PoolDto } from '../../dtos/pool/PoolDto';

export class ListUserPools {
  constructor(
    private poolRepository: PoolRepository,
    private userRepository: UserRepository
  ) {}

  async execute(userId: number): Promise<PoolDto[]> {
    // Validate user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    // Get all pools where user is a member
    const pools = await this.poolRepository.findByUserId(userId);

    // Enrich with member counts
    const poolsWithCounts = await Promise.all(
      pools.map(async (pool) => {
        const memberCount = await this.poolRepository.getMemberCount(pool.id!);
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
      })
    );

    return poolsWithCounts;
  }
}
