import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRepository } from '../../../../application/ports/user/UserRepository';
import { DomainError } from '../../../../domain/errors/DomainError';

export class UserController {
  constructor(private userRepository: UserRepository) {}

  async getByEmail(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email } = request.query as any;
      
      if (!email) {
        return reply.status(400).send({
          success: false,
          error: {
            message: 'Email parameter is required',
            code: 'VALIDATION_ERROR',
          },
        });
      }

      const user = await this.userRepository.findByEmail(email);
      
      if (!user) {
        return reply.status(404).send({
          success: false,
          error: {
            message: `User with email ${email} not found`,
            code: 'USER_NOT_FOUND',
          },
        });
      }

      return reply.send({
        success: true,
        data: user,
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.userRepository.list();
      return reply.send({
        success: true,
        data: users,
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  private handleError(error: unknown, reply: FastifyReply) {
    if (error instanceof DomainError) {
      const statusCode = error.code === 'USER_NOT_FOUND' ? 404 : 500;
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
