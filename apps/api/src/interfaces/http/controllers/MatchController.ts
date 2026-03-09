import { FastifyRequest, FastifyReply } from 'fastify';
import { ListMatchesUseCase } from '@/application/use-cases/match/ListMatches';
import { DomainError } from '@/domain/errors/DomainError';

export class MatchController {
  constructor(private listMatchesUseCase: ListMatchesUseCase) {}

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

  private handleError(error: unknown, reply: FastifyReply) {
    if (error instanceof DomainError) {
      const statusCode = error.code === 'MATCH_NOT_FOUND' ? 404 : 500;
      
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
