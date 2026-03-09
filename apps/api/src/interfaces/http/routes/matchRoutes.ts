import { FastifyInstance } from 'fastify';
import { MatchController } from '../controllers/MatchController';
import { updateMatchResultSchema } from '../schemas/matchSchemas';

export async function matchRoutes(
  fastify: FastifyInstance,
  controller: MatchController
) {
  // List all matches
  fastify.get('/matches', (request, reply) => controller.list(request, reply));

  // Update match result (admin endpoint)
  fastify.put('/matches/:id/result', async (request, reply) => {
    // Validate with Zod
    try {
      updateMatchResultSchema.parse(request.body);
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: {
          message: error.errors?.[0]?.message || 'Validation error',
          code: 'VALIDATION_ERROR',
        },
      });
    }
    
    return controller.updateResult(request as any, reply);
  });
}
