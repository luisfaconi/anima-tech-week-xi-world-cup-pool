import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

// Repositories
import { PrismaPoolRepository } from './infrastructure/prisma/pool/PrismaPoolRepository';
import { PrismaUserRepository } from './infrastructure/prisma/user/PrismaUserRepository';
import { PrismaPickRepository } from './infrastructure/prisma/PrismaPickRepository';
import { PrismaMatchRepository } from './infrastructure/prisma/PrismaMatchRepository';

// Use Cases
import { CreatePool } from './application/use-cases/pool/CreatePool';
import { JoinPool } from './application/use-cases/pool/JoinPool';
import { GetPoolDetails } from './application/use-cases/pool/GetPoolDetails';
import { ListUserPools } from './application/use-cases/pool/ListUserPools';
import { UpdatePool } from './application/use-cases/pool/UpdatePool';
import { RemovePoolMember } from './application/use-cases/pool/RemovePoolMember';
import { GetPoolMembers } from './application/use-cases/pool/GetPoolMembers';
import { CreatePickUseCase } from './application/use-cases/pick/CreatePick';
import { UpdatePickUseCase } from './application/use-cases/pick/UpdatePick';
import { GetUserPicksUseCase } from './application/use-cases/pick/GetUserPicks';
import { DeletePickUseCase } from './application/use-cases/pick/DeletePick';
import { ListMatchesUseCase } from './application/use-cases/match/ListMatches';
import { UpdateMatchResult } from './application/use-cases/match/UpdateMatchResult';

// Controllers
import { PoolController } from './interfaces/http/controllers/pool/PoolController';
import { UserController } from './interfaces/http/controllers/user/UserController';
import { PickController } from './interfaces/http/controllers/PickController';
import { MatchController } from './interfaces/http/controllers/MatchController';

// Routes
import { poolRoutes } from './interfaces/http/routes/pool/poolRoutes';
import { userRoutes } from './interfaces/http/routes/user/userRoutes';
import { pickRoutes } from './interfaces/http/routes/pickRoutes';
import { matchRoutes } from './interfaces/http/routes/matchRoutes';

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
  const pickRepository = new PrismaPickRepository(prisma);
  const matchRepository = new PrismaMatchRepository(prisma);

  // Initialize Use Cases
  const createPool = new CreatePool(poolRepository, userRepository);
  const joinPool = new JoinPool(poolRepository, userRepository);
  const getPoolDetails = new GetPoolDetails(poolRepository);
  const listUserPools = new ListUserPools(poolRepository, userRepository);
  const updatePool = new UpdatePool(poolRepository);
  const removePoolMember = new RemovePoolMember(poolRepository, userRepository);
  const getPoolMembers = new GetPoolMembers(poolRepository, userRepository);
  
  const createPick = new CreatePickUseCase(pickRepository, matchRepository, userRepository, poolRepository);
  const updatePick = new UpdatePickUseCase(pickRepository, matchRepository);
  const getUserPicks = new GetUserPicksUseCase(pickRepository, userRepository);
  const deletePick = new DeletePickUseCase(pickRepository, matchRepository);
  
  const listMatches = new ListMatchesUseCase(matchRepository);
  const updateMatchResult = new UpdateMatchResult(matchRepository, pickRepository, poolRepository);

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
  
  const pickController = new PickController(
    createPick,
    updatePick,
    getUserPicks,
    deletePick
  );
  
  const matchController = new MatchController(listMatches, updateMatchResult);

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

  // Register Pick routes
  await fastify.register(
    async (instance) => {
      await pickRoutes(instance, pickController);
    },
    { prefix: '/api' }
  );

  // Register Match routes
  await fastify.register(
    async (instance) => {
      await matchRoutes(instance, matchController);
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
