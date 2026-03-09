import { PrismaClient } from '@prisma/client';
import { MatchRepository } from '@/application/ports/MatchRepository';
import { Match, CreateMatchData, UpdateMatchResultData } from '@/domain/entities/Match';

export class PrismaMatchRepository implements MatchRepository {
  constructor(private prisma: PrismaClient) {}

  async create(matchData: CreateMatchData): Promise<Match> {
    const match = await this.prisma.match.create({
      data: {
        teamA: matchData.teamA,
        teamB: matchData.teamB,
        scheduledAt: matchData.scheduledAt,
        status: 'scheduled',
      },
    });

    return this.toDomain(match);
  }

  async findById(id: number): Promise<Match | null> {
    const match = await this.prisma.match.findUnique({
      where: { id },
    });

    return match ? this.toDomain(match) : null;
  }

  async list(): Promise<Match[]> {
    const matches = await this.prisma.match.findMany({
      orderBy: { scheduledAt: 'asc' },
    });

    return matches.map(this.toDomain);
  }

  async updateResult(id: number, resultData: UpdateMatchResultData): Promise<Match> {
    const match = await this.prisma.match.update({
      where: { id },
      data: {
        teamAScore: resultData.teamAScore,
        teamBScore: resultData.teamBScore,
        status: resultData.status,
      },
    });

    return this.toDomain(match);
  }

  private toDomain(match: any): Match {
    return {
      id: match.id,
      teamA: match.teamA,
      teamB: match.teamB,
      teamAFlag: match.teamAFlag,
      teamBFlag: match.teamBFlag,
      scheduledAt: match.scheduledAt,
      teamAScore: match.teamAScore,
      teamBScore: match.teamBScore,
      status: match.status,
      matchType: match.matchType,
      groupName: match.groupName,
      venue: match.venue,
      createdAt: match.createdAt,
    };
  }
}
