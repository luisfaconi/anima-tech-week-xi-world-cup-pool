import { FastifyReply, FastifyRequest } from 'fastify';
import { GetPoolLeaderboard } from '../../../application/use-cases/leaderboard/GetPoolLeaderboard';
import { GetUserStats } from '../../../application/use-cases/leaderboard/GetUserStats';
import { PoolNotFoundError, UserNotFoundError } from '../../../domain/errors/DomainError';

export class LeaderboardController {
  constructor(
    private getPoolLeaderboardUseCase: GetPoolLeaderboard,
    private getUserStatsUseCase: GetUserStats
  ) {}

  async getPoolLeaderboard(
    request: FastifyRequest<{ Params: { poolId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const poolId = parseInt(request.params.poolId, 10);

      if (isNaN(poolId)) {
        return reply.status(400).send({
          success: false,
          error: {
            message: 'Invalid pool ID',
            code: 'VALIDATION_ERROR',
          },
        });
      }

      const leaderboard = await this.getPoolLeaderboardUseCase.execute(poolId);

      return reply.status(200).send({
        success: true,
        data: leaderboard,
      });
    } catch (error) {
      if (error instanceof PoolNotFoundError) {
        return reply.status(404).send({
          success: false,
          error: {
            message: error.message,
            code: 'POOL_NOT_FOUND',
          },
        });
      }

      console.error('Error getting pool leaderboard:', error);
      return reply.status(500).send({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  async getUserStats(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const userId = parseInt(request.params.userId, 10);

      if (isNaN(userId)) {
        return reply.status(400).send({
          success: false,
          error: {
            message: 'Invalid user ID',
            code: 'VALIDATION_ERROR',
          },
        });
      }

      const stats = await this.getUserStatsUseCase.execute(userId);

      return reply.status(200).send({
        success: true,
        data: stats,
      });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return reply.status(404).send({
          success: false,
          error: {
            message: error.message,
            code: 'USER_NOT_FOUND',
          },
        });
      }

      console.error('Error getting user stats:', error);
      return reply.status(500).send({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }
}
