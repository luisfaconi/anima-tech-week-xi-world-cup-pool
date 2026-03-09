import { PrismaClient } from '@prisma/client';
import { Pool, ScoringRules } from '../../../domain/entities/pool/Pool';
import { PoolMembership } from '../../../domain/entities/pool/PoolMembership';
import { PoolRepository } from '../../../application/ports/pool/PoolRepository';

export class PrismaPoolRepository implements PoolRepository {
  constructor(private prisma: PrismaClient) {}

  private parseScoringRules(data: any): ScoringRules {
    return data as unknown as ScoringRules;
  }

  async create(pool: Pool): Promise<Pool> {
    const data = await this.prisma.pool.create({
      data: {
        name: pool.name,
        description: pool.description,
        inviteCode: pool.inviteCode,
        ownerId: pool.ownerId,
        scoringRules: pool.scoringRules as any,
        isActive: pool.isActive,
      },
    });

    return Pool.reconstitute({
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      inviteCode: data.inviteCode,
      ownerId: data.ownerId,
      scoringRules: this.parseScoringRules(data.scoringRules),
      isActive: data.isActive,
      createdAt: data.createdAt,
    });
  }

  async findById(id: number): Promise<Pool | null> {
    const data = await this.prisma.pool.findUnique({
      where: { id },
    });

    if (!data) return null;

    return Pool.reconstitute({
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      inviteCode: data.inviteCode,
      ownerId: data.ownerId,
      scoringRules: this.parseScoringRules(data.scoringRules),
      isActive: data.isActive,
      createdAt: data.createdAt,
    });
  }

  async findByInviteCode(inviteCode: string): Promise<Pool | null> {
    const data = await this.prisma.pool.findUnique({
      where: { inviteCode },
    });

    if (!data) return null;

    return Pool.reconstitute({
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      inviteCode: data.inviteCode,
      ownerId: data.ownerId,
      scoringRules: this.parseScoringRules(data.scoringRules),
      isActive: data.isActive,
      createdAt: data.createdAt,
    });
  }

  async findByOwnerId(ownerId: number): Promise<Pool[]> {
    const pools = await this.prisma.pool.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });

    return pools.map((data) =>
      Pool.reconstitute({
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        inviteCode: data.inviteCode,
        ownerId: data.ownerId,
        scoringRules: this.parseScoringRules(data.scoringRules),
        isActive: data.isActive,
        createdAt: data.createdAt,
      })
    );
  }

  async findByUserId(userId: number): Promise<Pool[]> {
    const memberships = await this.prisma.poolMembership.findMany({
      where: { userId },
      include: { pool: true },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships.map((membership) =>
      Pool.reconstitute({
        id: membership.pool.id,
        name: membership.pool.name,
        description: membership.pool.description || undefined,
        inviteCode: membership.pool.inviteCode,
        ownerId: membership.pool.ownerId,
        scoringRules: this.parseScoringRules(membership.pool.scoringRules),
        isActive: membership.pool.isActive,
        createdAt: membership.pool.createdAt,
      })
    );
  }

  async update(pool: Pool): Promise<Pool> {
    const data = await this.prisma.pool.update({
      where: { id: pool.id },
      data: {
        name: pool.name,
        description: pool.description,
        scoringRules: pool.scoringRules as any,
        isActive: pool.isActive,
      },
    });

    return Pool.reconstitute({
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      inviteCode: data.inviteCode,
      ownerId: data.ownerId,
      scoringRules: this.parseScoringRules(data.scoringRules),
      isActive: data.isActive,
      createdAt: data.createdAt,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.pool.delete({
      where: { id },
    });
  }

  async addMember(membership: PoolMembership): Promise<PoolMembership> {
    const data = await this.prisma.poolMembership.create({
      data: {
        poolId: membership.poolId,
        userId: membership.userId,
      },
    });

    return PoolMembership.reconstitute({
      id: data.id,
      poolId: data.poolId,
      userId: data.userId,
      joinedAt: data.joinedAt,
    });
  }

  async removeMember(poolId: number, userId: number): Promise<void> {
    await this.prisma.poolMembership.deleteMany({
      where: {
        poolId,
        userId,
      },
    });
  }

  async isMember(poolId: number, userId: number): Promise<boolean> {
    const membership = await this.prisma.poolMembership.findFirst({
      where: {
        poolId,
        userId,
      },
    });

    return membership !== null;
  }

  async getMembers(poolId: number): Promise<PoolMembership[]> {
    const memberships = await this.prisma.poolMembership.findMany({
      where: { poolId },
      orderBy: { joinedAt: 'asc' },
    });

    return memberships.map((data) =>
      PoolMembership.reconstitute({
        id: data.id,
        poolId: data.poolId,
        userId: data.userId,
        joinedAt: data.joinedAt,
      })
    );
  }

  async getMemberCount(poolId: number): Promise<number> {
    return await this.prisma.poolMembership.count({
      where: { poolId },
    });
  }
}
