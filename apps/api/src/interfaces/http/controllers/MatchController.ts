import { FastifyRequest, FastifyReply } from 'fastify';
import { ListMatchesUseCase } from '@/application/use-cases/match/ListMatches';
import { UpdateMatchResult } from '@/application/use-cases/match/UpdateMatchResult';
import { DomainError } from '@/domain/errors/DomainError';

interface UpdateMatchResultParams {
  id: string;
}

interface UpdateMatchResultBody {
  teamAScore: number;
  teamBScore: number;
  status: 'scheduled' | 'live' | 'finished';
}

export class MatchController {
  constructor(
    private listMatchesUseCase: ListMatchesUseCase,
    private updateMatchResultUseCase: UpdateMatchResult
  ) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const matches = await this.listMatchesUseCase.execute();

      return reply.send({
        success: true,
        data: matches,
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  async updateResult(
    request: FastifyRequest<{
      Params: UpdateMatchResultParams;
      Body: UpdateMatchResultBody;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const { teamAScore, teamBScore, status } = request.body;

      const match = await this.updateMatchResultUseCase.execute(Number(id), {
        teamAScore,
        teamBScore,
        status,
      });

      return reply.send({
        success: true,
        data: match,
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  private handleError(error: unknown, reply: FastifyReply) {
    if (error instanceof DomainError) {
      let statusCode = 500;
      
      switch (error.code) {
        case 'MATCH_NOT_FOUND':
          statusCode = 404;
          break;
        case 'INVALID_SCORE':
        case 'INVALID_STATUS':
          statusCode = 400;
          break;
        default:
          statusCode = 500;
      }
      
      return reply.status(statusCode).send({
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      });
    }

    console.error('Unexpected error:', error);
    return reply.status(500).send({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    });
  }
}
