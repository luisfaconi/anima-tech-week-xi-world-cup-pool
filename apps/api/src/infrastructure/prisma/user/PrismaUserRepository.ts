import { PrismaClient } from '@prisma/client';
import { User, CreateUserData } from '../../../domain/entities/user/User';
import { UserRepository } from '../../../application/ports/user/UserRepository';

export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(userData: CreateUserData): Promise<User> {
    const data = await this.prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
      },
    });

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      createdAt: data.createdAt,
    };
  }

  async findById(id: number): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      createdAt: data.createdAt,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      createdAt: data.createdAt,
    };
  }

  async list(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map((data) => ({
      id: data.id,
      name: data.name,
      email: data.email,
      createdAt: data.createdAt,
    }));
  }
}
