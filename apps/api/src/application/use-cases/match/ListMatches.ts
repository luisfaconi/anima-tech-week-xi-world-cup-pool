import { Match } from '@/domain/entities/Match';
import { MatchRepository } from '@/application/ports/MatchRepository';

export class ListMatchesUseCase {
  constructor(private matchRepository: MatchRepository) {}

  async execute(): Promise<Match[]> {
    return this.matchRepository.list();
  }
}
