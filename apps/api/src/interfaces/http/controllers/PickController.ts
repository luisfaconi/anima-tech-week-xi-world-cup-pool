import { FastifyRequest, FastifyReply } from 'fastify';
import { CreatePickUseCase } from '@/application/use-cases/pick/CreatePick';
import { UpdatePickUseCase } from '@/application/use-cases/pick/UpdatePick';
import { GetUserPicksUseCase } from '@/application/use-cases/pick/GetUserPicks';
import { DeletePickUseCase } from '@/application/use-cases/pick/DeletePick';
import { DomainError } from '@/domain/errors/DomainError';
import { z } from 'zod';

const createPickSchema = z.object({
  userId: z.number().int().positive(),
  matchId: z.number().int().positive(),
  poolId: z.number().int().positive(),
  predictedTeamAScore: z.number().int().min(0),
  predictedTeamBScore: z.number().int().min(0),
  aiSuggested: z.boolean().optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
});

const updatePickSchema = z.object({
  predictedTeamAScore: z.number().int().min(0),
  predictedTeamBScore: z.number().int().min(0),
});

export class PickController {
  constructor(
    private createPickUseCase: CreatePickUseCase,
    private updatePickUseCase: UpdatePickUseCase,
    private getUserPicksUseCase: GetUserPicksUseCase,
    private deletePickUseCase: DeletePickUseCase
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validation = createPickSchema.safeParse(request.body);
      
      if (!validation.success) {
        return reply.status(400).send({
          success: false,
          error: {
            message: 'Validation error',
            code: 'VALIDATION_ERROR',
            details: validation.error.errors,
          },
        });
      }

      const pick = await this.createPickUseCase.execute(validation.data);

      return reply.status(201).send({
        success: true,
        data: pick,
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const pickId = parseInt(id, 10);

      if (isNaN(pickId)) {
        return reply.status(400).send({
          success: false,
          error: {
            message: 'Invalid pick ID',
            code: 'VALIDATION_ERROR',
          },
        });
      }

      const validation = updatePickSchema.safeParse(request.body);
      
      if (!validation.success) {
        return reply.status(400).send({
          success: false,
          error: {
            message: 'Validation error',
            code: 'VALIDATION_ERROR',
            details: validation.error.errors,
          },
        });
      }

      const pick = await this.updatePickUseCase.execute(pickId, validation.data);

      return reply.send({
        success: true,
        data: pick,
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  async getUserPicks(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.params as { userId: string };
      const { poolId } = request.query as { poolId?: string };
      
      const userIdNum = parseInt(userId, 10);
      const poolIdNum = poolId ? parseInt(poolId, 10) : undefined;

      if (isNaN(userIdNum)) {
        return reply.status(400).send({
          success: false,
          error: {
            message: 'Invalid user ID',
            code: 'VALIDATION_ERROR',
          },
        });
      }

      const picks = await this.getUserPicksUseCase.execute(userIdNum, poolIdNum);

      return reply.send({
        success: true,
        data: picks,
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const pickId = parseInt(id, 10);

      if (isNaN(pickId)) {
        return reply.status(400).send({
          success: false,
          error: {
            message: 'Invalid pick ID',
            code: 'VALIDATION_ERROR',
          },
        });
      }

      await this.deletePickUseCase.execute(pickId);

      return reply.status(204).send();
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  private handleError(error: unknown, reply: FastifyReply) {
    if (error instanceof DomainError) {
      const statusMap: Record<string, number> = {
        USER_NOT_FOUND: 404,
        MATCH_NOT_FOUND: 404,
        PICK_NOT_FOUND: 404,
        POOL_NOT_FOUND: 404,
        DUPLICATE_PICK: 409,
        MATCH_STARTED: 400,
        POOL_INACTIVE: 400,
        USER_NOT_POOL_MEMBER: 403,
      };

      const statusCode = statusMap[error.code] || 500;
      
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
