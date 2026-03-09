import { PickRepository } from '@/application/ports/PickRepository';
import { MatchRepository } from '@/application/ports/MatchRepository';
import {
  PickNotFoundError,
  MatchNotFoundError,
  MatchAlreadyStartedError,
} from '@/domain/errors/DomainError';

export class DeletePickUseCase {
  constructor(
    private pickRepository: PickRepository,
    private matchRepository: MatchRepository
  ) {}

  async execute(pickId: number): Promise<void> {
    // Validate pick exists
    const existingPick = await this.pickRepository.findById(pickId);
    if (!existingPick) {
      throw new PickNotFoundError(pickId);
    }

    // Validate match exists
    const match = await this.matchRepository.findById(existingPick.matchId);
    if (!match) {
      throw new MatchNotFoundError(existingPick.matchId);
    }

    // Validate match hasn't started yet
    if (new Date() >= match.scheduledAt) {
      throw new MatchAlreadyStartedError(existingPick.matchId);
    }

    // Delete the pick
    await this.pickRepository.delete(pickId);
  }
}
