import { PoolRepository } from '../../ports/pool/PoolRepository';
import { UserRepository } from '../../ports/user/UserRepository';
import { PoolMembership } from '../../../domain/entities/pool/PoolMembership';
import {
  UserNotFoundError,
  PoolNotFoundByCodeError,
  PoolInactiveError,
  UserAlreadyInPoolError,
} from '../../../domain/errors/DomainError';
import { JoinPoolDto, PoolMemberDto } from '../../dtos/pool/PoolDto';

export class JoinPool {
  constructor(
    private poolRepository: PoolRepository,
    private userRepository: UserRepository
  ) {}

  async execute(dto: JoinPoolDto): Promise<PoolMemberDto> {
    // Validate user exists
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new UserNotFoundError(dto.userId);
    }

    // Find pool by invite code
    const pool = await this.poolRepository.findByInviteCode(dto.inviteCode);
    if (!pool) {
      throw new PoolNotFoundByCodeError(dto.inviteCode);
    }

    // Check if pool is active
    if (!pool.isActive) {
      throw new PoolInactiveError(pool.id!);
    }

    // Check if user is already a member
    const isMember = await this.poolRepository.isMember(pool.id!, dto.userId);
    if (isMember) {
      throw new UserAlreadyInPoolError(dto.userId, pool.id!);
    }

    // Add user to pool
    const membership = PoolMembership.create(pool.id!, dto.userId);
    const savedMembership = await this.poolRepository.addMember(membership);

    return {
      id: savedMembership.id!,
      poolId: savedMembership.poolId,
      userId: savedMembership.userId,
      userName: user.name,
      joinedAt: savedMembership.joinedAt!,
    };
  }
}
