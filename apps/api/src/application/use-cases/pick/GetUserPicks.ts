import { Pick } from '@/domain/entities/Pick';
import { PickRepository } from '@/application/ports/PickRepository';
import { UserRepository } from '@/application/ports/user/UserRepository';
import { UserNotFoundError } from '@/domain/errors/DomainError';

export class GetUserPicksUseCase {
  constructor(
    private pickRepository: PickRepository,
    private userRepository: UserRepository
  ) {}

  async execute(userId: number, poolId?: number): Promise<Pick[]> {
    // Validate user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    // Get picks filtered by pool if provided
    if (poolId) {
      return this.pickRepository.findByUserIdAndPoolId(userId, poolId);
    }

    return this.pickRepository.findByUserId(userId);
  }
}
