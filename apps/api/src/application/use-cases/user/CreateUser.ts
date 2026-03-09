import { User, CreateUserData } from '../../../domain/entities/user/User';
import { UserRepository } from '../../ports/user/UserRepository';
import { UserAlreadyExistsError } from '../../../domain/errors/DomainError';

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userData: CreateUserData): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new UserAlreadyExistsError(userData.email);
    }

    // Create new user
    return this.userRepository.create(userData);
  }
}