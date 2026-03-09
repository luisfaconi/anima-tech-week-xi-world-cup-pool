import { PrismaClient } from '@prisma/client';
import { PickRepository } from '@/application/ports/PickRepository';
import { Pick, CreatePickData, UpdatePickData } from '@/domain/entities/Pick';

export class PrismaPickRepository implements PickRepository {
  constructor(private prisma: PrismaClient) {}

  async create(pickData: CreatePickData): Promise<Pick> {
    const pick = await this.prisma.pick.create({
      data: {
        userId: pickData.userId,
        matchId: pickData.matchId,
        poolId: pickData.poolId,
        predictedTeamAScore: pickData.predictedTeamAScore,
        predictedTeamBScore: pickData.predictedTeamBScore,
        aiSuggested: pickData.aiSuggested ?? false,
        confidenceScore: pickData.confidenceScore,
      },
    });

    return this.toDomain(pick);
  }

  async findById(id: number): Promise<Pick | null> {
    const pick = await this.prisma.pick.findUnique({
      where: { id },
    });

    return pick ? this.toDomain(pick) : null;
  }

  async findByUserMatchAndPool(
    userId: number,
    matchId: number,
    poolId: number
  ): Promise<Pick | null> {
    const pick = await this.prisma.pick.findUnique({
      where: {
        userId_matchId_poolId: {
          userId,
          matchId,
          poolId,
        },
      },
    });

    return pick ? this.toDomain(pick) : null;
  }

  async findByUserId(userId: number): Promise<Pick[]> {
    const picks = await this.prisma.pick.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return picks.map(this.toDomain);
  }

  async findByUserIdAndPoolId(userId: number, poolId: number): Promise<Pick[]> {
    const picks = await this.prisma.pick.findMany({
      where: {
        userId,
        poolId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return picks.map(this.toDomain);
  }

  async findByMatchId(matchId: number): Promise<Pick[]> {
    const picks = await this.prisma.pick.findMany({
      where: { matchId },
    });

    return picks.map(this.toDomain);
  }

  async findByPoolId(poolId: number): Promise<Pick[]> {
    const picks = await this.prisma.pick.findMany({
      where: { poolId },
      orderBy: { createdAt: 'desc' },
    });

    return picks.map(this.toDomain);
  }

  async update(id: number, pickData: UpdatePickData): Promise<Pick> {
    const pick = await this.prisma.pick.update({
      where: { id },
      data: {
        predictedTeamAScore: pickData.predictedTeamAScore,
        predictedTeamBScore: pickData.predictedTeamBScore,
        updatedAt: new Date(),
      },
    });

    return this.toDomain(pick);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.pick.delete({
      where: { id },
    });
  }

  private toDomain(pick: any): Pick {
    return {
      id: pick.id,
      userId: pick.userId,
      matchId: pick.matchId,
      poolId: pick.poolId,
      predictedTeamAScore: pick.predictedTeamAScore,
      predictedTeamBScore: pick.predictedTeamBScore,
      points: pick.points,
      aiSuggested: pick.aiSuggested,
      confidenceScore: pick.confidenceScore,
      createdAt: pick.createdAt,
      updatedAt: pick.updatedAt,
    };
  }
}
