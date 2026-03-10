import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { LeaderboardController } from '../controllers/LeaderboardController';

export async function leaderboardRoutes(
  fastify: FastifyInstance,
  controller: LeaderboardController
) {
  // Get pool leaderboard
  fastify.get<{ Params: { poolId: string } }>(
    '/pools/:poolId/leaderboard',
    async (request: FastifyRequest<{ Params: { poolId: string } }>, reply: FastifyReply) => {
      return controller.getPoolLeaderboard(request, reply);
    }
  );

  // Get user stats
  fastify.get<{ Params: { userId: string } }>(
    '/users/:userId/stats',
    async (request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
      return controller.getUserStats(request, reply);
    }
  );
}
