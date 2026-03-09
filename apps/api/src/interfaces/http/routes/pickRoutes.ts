import { FastifyInstance } from 'fastify';
import { PickController } from '../controllers/PickController';

export async function pickRoutes(
  fastify: FastifyInstance,
  controller: PickController
) {
  // Create a new pick
  fastify.post('/picks', (request, reply) => controller.create(request, reply));
  
  // Update a pick
  fastify.put('/picks/:id', (request, reply) => controller.update(request, reply));
  
  // Get user's picks (optionally filtered by poolId)
  fastify.get('/picks/user/:userId', (request, reply) => controller.getUserPicks(request, reply));
  
  // Delete a pick
  fastify.delete('/picks/:id', (request, reply) => controller.delete(request, reply));
}
