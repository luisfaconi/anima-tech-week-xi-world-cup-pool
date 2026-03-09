import { PoolRepository } from '../../ports/pool/PoolRepository';
import { UserRepository } from '../../ports/user/UserRepository';
import {
  PoolNotFoundError,
  UserNotFoundError,
  UnauthorizedPoolActionError,
  UserNotPoolMemberError,
} from '../../../domain/errors/DomainError';

export class RemovePoolMember {
  constructor(
    private poolRepository: PoolRepository,
    private userRepository: UserRepository
  ) {}

  async execute(poolId: number, requesterId: number, memberIdToRemove: number): Promise<void> {
    // Validate pool exists
    const pool = await this.poolRepository.findById(poolId);
    if (!pool) {
      throw new PoolNotFoundError(poolId);
    }

    // Validate member to remove exists
    const member = await this.userRepository.findById(memberIdToRemove);
    if (!member) {
      throw new UserNotFoundError(memberIdToRemove);
    }

    // Check if member is actually in the pool
    const isMember = await this.poolRepository.isMember(poolId, memberIdToRemove);
    if (!isMember) {
      throw new UserNotPoolMemberError(memberIdToRemove, poolId);
    }

    // Only pool owner can remove members (except themselves)
    if (!pool.isOwner(requesterId)) {
      throw new UnauthorizedPoolActionError('Only pool owner can remove members');
    }

    // Cannot remove the owner
    if (memberIdToRemove === pool.ownerId) {
      throw new UnauthorizedPoolActionError('Pool owner cannot be removed');
    }

    await this.poolRepository.removeMember(poolId, memberIdToRemove);
  }
}
