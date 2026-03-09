import { Pool } from '../../domain/entities/Pool';
import { PoolMembership } from '../../domain/entities/PoolMembership';

export interface PoolWithMemberCount extends Pool {
  memberCount: number;
}

export interface PoolRepository {
  create(pool: Pool): Promise<Pool>;
  findById(id: number): Promise<Pool | null>;
  findByInviteCode(inviteCode: string): Promise<Pool | null>;
  findByOwnerId(ownerId: number): Promise<Pool[]>;
  findByUserId(userId: number): Promise<Pool[]>;
  update(pool: Pool): Promise<Pool>;
  delete(id: number): Promise<void>;
  
  // Membership operations
  addMember(membership: PoolMembership): Promise<PoolMembership>;
  removeMember(poolId: number, userId: number): Promise<void>;
  isMember(poolId: number, userId: number): Promise<boolean>;
  getMembers(poolId: number): Promise<PoolMembership[]>;
  getMemberCount(poolId: number): Promise<number>;
}
