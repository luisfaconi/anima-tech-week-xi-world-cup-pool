import { User, CreateUserData } from '@/domain/entities/User';

export interface UserRepository {
  create(userData: CreateUserData): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  list(): Promise<User[]>;
}