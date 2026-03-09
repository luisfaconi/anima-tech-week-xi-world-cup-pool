import { FastifyInstance } from 'fastify';
import { MatchController } from '../controllers/MatchController';

export async function matchRoutes(
  fastify: FastifyInstance,
  controller: MatchController
) {
  // List all matches
  fastify.get('/matches', (request, reply) => controller.list(request, reply));
}
