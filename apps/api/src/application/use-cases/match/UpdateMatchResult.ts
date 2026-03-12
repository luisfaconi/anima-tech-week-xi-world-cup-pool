import { MatchRepository } from '@/application/ports/MatchRepository';
import { PickRepository } from '@/application/ports/PickRepository';
import { PoolRepository } from '@/application/ports/pool/PoolRepository';
import { Match, MatchStatus } from '@/domain/entities/Match';
import { MatchNotFoundError, InvalidMatchScoreError } from '@/domain/errors/DomainError';
import { CalculateMatchScores } from './CalculateMatchScores';

export interface UpdateMatchResultInput {
  matchId: number;
  teamAScore: number;
  teamBScore: number;
  status: MatchStatus;
}

export interface UpdateMatchResultOutput {
  match: Match;
  calculatedPicks: number;
  totalPoints: number;
}

export class UpdateMatchResult {
  constructor(
    private matchRepository: MatchRepository,
    private pickRepository: PickRepository,
    private poolRepository: PoolRepository
  ) {}

  async execute(input: UpdateMatchResultInput): Promise<UpdateMatchResultOutput> {
    const { matchId, teamAScore, teamBScore, status } = input;

    // Validate scores
    if (teamAScore < 0 || teamBScore < 0) {
      throw new InvalidMatchScoreError();
    }

    // Find the match
    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new MatchNotFoundError(matchId);
    }

    // Update match result
    const updatedMatch = await this.matchRepository.updateResult(matchId, {
      teamAScore,
      teamBScore,
      status,
    });

    // If match is finished, automatically calculate scores
    let calculatedPicks = 0;
    let totalPoints = 0;

    if (status === 'finished') {
      const calculateScores = new CalculateMatchScores(
        this.pickRepository,
        this.poolRepository
      );

      const result = await calculateScores.execute({ match: updatedMatch });
      calculatedPicks = result.calculatedPicks;
      totalPoints = result.totalPoints;
    }

    return {
      match: updatedMatch,
      calculatedPicks,
      totalPoints,
    };
  }
}
