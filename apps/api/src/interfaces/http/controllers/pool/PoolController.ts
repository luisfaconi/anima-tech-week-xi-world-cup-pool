import { FastifyRequest, FastifyReply } from 'fastify';
import { CreatePool } from '../../../../application/use-cases/pool/CreatePool';
import { JoinPool } from '../../../../application/use-cases/pool/JoinPool';
import { GetPoolDetails } from '../../../../application/use-cases/pool/GetPoolDetails';
import { ListUserPools } from '../../../../application/use-cases/pool/ListUserPools';
import { UpdatePool } from '../../../../application/use-cases/pool/UpdatePool';
import { RemovePoolMember } from '../../../../application/use-cases/pool/RemovePoolMember';
import { GetPoolMembers } from '../../../../application/use-cases/pool/GetPoolMembers';
import { GetPoolRanking } from '../../../../application/use-cases/pool/GetPoolRanking';
import { DomainError } from '../../../../domain/errors/DomainError';

export class PoolController {
  constructor(
    private createPool: CreatePool,
    private joinPool: JoinPool,
    private getPoolDetails: GetPoolDetails,
    private listUserPools: ListUserPools,
    private updatePool: UpdatePool,
    private removePoolMember: RemovePoolMember,
    private getPoolMembers: GetPoolMembers,
    private getPoolRanking: GetPoolRanking
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as any;
      const pool = await this.createPool.execute(body);
      return reply.status(201).send({
        success: true,
        data: pool,
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const pool = await this.getPoolDetails.execute(id);
      return reply.send({
        success: true,
        data: pool,
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  async listByUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.query as any;
      const userIdNumber = parseInt(userId, 10);
      
      if (isNaN(userIdNumber)) {
        return reply.status(400).send({
          success: false,
          error: {
            message: 'Invalid userId parameter',
            code: 'VALIDATION_ERROR',
          },
        });
      }
      
      const pools = await this.listUserPools.execute(userIdNumber);
      return reply.send({
        success: true,
        data: pools,
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const body = request.body as any;
      const { requesterId } = body;
      
      const pool = await this.updatePool.execute(id, requesterId, body);
      return reply.send({
        success: true,
        data: pool,
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  async join(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as any;
      const membership = await this.joinPool.execute(body);
      return reply.status(201).send({
        success: true,
        data: membership,
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  async getMembers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const members = await this.getPoolMembers.execute(Number(id));
      return reply.send({
        success: true,
        data: members,
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  async removeMember(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id, userId } = request.params as any;
      const { requesterId } = request.body as any;
      
      await this.removePoolMember.execute(id, requesterId, userId);
      return reply.status(204).send();
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  async getRanking(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const ranking = await this.getPoolRanking.execute({ poolId: Number(id) });
      return reply.send({
        success: true,
        data: ranking,
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  private handleError(error: unknown, reply: FastifyReply) {
    if (error instanceof DomainError) {
      const statusCode = this.getStatusCodeForError(error.code);
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

  private getStatusCodeForError(code: string): number {
    const statusMap: Record<string, number> = {
      USER_NOT_FOUND: 404,
      POOL_NOT_FOUND: 404,
      POOL_INACTIVE: 400,
      USER_ALREADY_IN_POOL: 409,
      USER_NOT_POOL_MEMBER: 404,
      UNAUTHORIZED_POOL_ACTION: 403,
      VALIDATION_ERROR: 400,
    };

    return statusMap[code] || 500;
  }
}
