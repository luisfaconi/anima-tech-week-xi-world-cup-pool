import { FastifyInstance } from 'fastify';
import { PoolController } from '../controllers/pool/PoolController';

export async function poolRoutes(
  fastify: FastifyInstance,
  controller: PoolController
) {
  // Create pool
  fastify.post('/pools', (request, reply) => controller.create(request, reply));

  // Get pool by ID
  fastify.get('/pools/:id', (request, reply) => controller.getById(request, reply));

  // List user's pools
  fastify.get('/pools', (request, reply) => controller.listByUser(request, reply));

  // Update pool
  fastify.put('/pools/:id', (request, reply) => controller.update(request, reply));

  // Join pool
  fastify.post('/pools/join', (request, reply) => controller.join(request, reply));

  // Get pool members
  fastify.get('/pools/:id/members', (request, reply) => controller.getMembers(request, reply));

  // Remove pool member
  fastify.delete('/pools/:id/members/:userId', (request, reply) => controller.removeMember(request, reply));

  // Get pool ranking
  fastify.get('/pools/:id/ranking', (request, reply) => controller.getRanking(request, reply));
}
