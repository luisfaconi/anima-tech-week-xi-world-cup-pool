import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

// Repositories
import { PrismaPoolRepository } from './infrastructure/prisma/pool/PrismaPoolRepository';
import { PrismaUserRepository } from './infrastructure/prisma/user/PrismaUserRepository';

// Use Cases
import { CreatePool } from './application/use-cases/pool/CreatePool';
import { JoinPool } from './application/use-cases/pool/JoinPool';
import { GetPoolDetails } from './application/use-cases/pool/GetPoolDetails';
import { ListUserPools } from './application/use-cases/pool/ListUserPools';
import { UpdatePool } from './application/use-cases/pool/UpdatePool';
import { RemovePoolMember } from './application/use-cases/pool/RemovePoolMember';
import { GetPoolMembers } from './application/use-cases/pool/GetPoolMembers';

// Controllers
import { PoolController } from './interfaces/http/controllers/pool/PoolController';
import { UserController } from './interfaces/http/controllers/user/UserController';

// Routes
import { poolRoutes } from './interfaces/http/routes/pool/poolRoutes';
import { userRoutes } from './interfaces/http/routes/user/userRoutes';

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function bootstrap() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  // Register CORS
  await fastify.register(cors, {
    origin: true,
  });

  // Initialize Prisma Client
  const prisma = new PrismaClient();

  // Initialize Repositories
  const poolRepository = new PrismaPoolRepository(prisma);
  const userRepository = new PrismaUserRepository(prisma);

  // Initialize Use Cases
  const createPool = new CreatePool(poolRepository, userRepository);
  const joinPool = new JoinPool(poolRepository, userRepository);
  const getPoolDetails = new GetPoolDetails(poolRepository);
  const listUserPools = new ListUserPools(poolRepository, userRepository);
  const updatePool = new UpdatePool(poolRepository);
  const removePoolMember = new RemovePoolMember(poolRepository, userRepository);
  const getPoolMembers = new GetPoolMembers(poolRepository, userRepository);

  // Initialize Controllers
  const poolController = new PoolController(
    createPool,
    joinPool,
    getPoolDetails,
    listUserPools,
    updatePool,
    removePoolMember,
    getPoolMembers
  );
  
  const userController = new UserController(userRepository);

  // Health check route
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API routes
  fastify.get('/api', async () => {
    return { message: 'World Cup Pool API', version: '1.0.0' };
  });

  // Register Pool routes
  await fastify.register(
    async (instance) => {
      await poolRoutes(instance, poolController);
    },
    { prefix: '/api' }
  );

  // Register User routes
  await fastify.register(
    async (instance) => {
      await userRoutes(instance, userController);
    },
    { prefix: '/api' }
  );

  // Graceful shutdown
  const signals = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      await prisma.$disconnect();
      await fastify.close();
      process.exit(0);
    });
  });

  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`🚀 Server running at http://${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();
