import { FastifyRequest, FastifyReply } from 'fastify';
import { ListMatchesUseCase } from '@/application/use-cases/match/ListMatches';
import { UpdateMatchResult } from '@/application/use-cases/match/UpdateMatchResult';
import { DomainError } from '@/domain/errors/DomainError';
import { UpdateMatchResultSchema } from '../schemas/matchSchemas';
import { z } from 'zod';

export class MatchController {
  constructor(
    private listMatchesUseCase: ListMatchesUseCase,
    private updateMatchResultUseCase?: UpdateMatchResult
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

  async updateResult(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!this.updateMatchResultUseCase) {
        return reply.status(501).send({
          success: false,
          error: {
            message: 'Update match result not implemented',
            code: 'NOT_IMPLEMENTED',
          },
        });
      }

      const { id } = request.params as { id: string };
      
      // Validate request body
      const validationResult = UpdateMatchResultSchema.safeParse(request.body);
      if (!validationResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            message: 'Invalid input data',
            code: 'VALIDATION_ERROR',
            details: validationResult.error.errors,
          },
        });
      }

      const { teamAScore, teamBScore, status } = validationResult.data;

      const result = await this.updateMatchResultUseCase.execute({
        matchId: parseInt(id, 10),
        teamAScore,
        teamBScore,
        status,
      });

      return reply.send({
        success: true,
        data: {
          match: result.match,
          calculatedPicks: result.calculatedPicks,
          totalPoints: result.totalPoints,
        },
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
