import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/user/UserController';

export async function userRoutes(
  fastify: FastifyInstance,
  controller: UserController
) {
  // Get user by email
  fastify.get('/users', (request, reply) => controller.getByEmail(request, reply));
  
  // List all users
  fastify.get('/users/all', (request, reply) => controller.list(request, reply));

  // Get user stats
  fastify.get('/users/:id/stats', (request, reply) => controller.getStats(request, reply));
}
