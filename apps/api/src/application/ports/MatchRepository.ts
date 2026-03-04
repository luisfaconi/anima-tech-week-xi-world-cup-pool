import { Match, CreateMatchData, UpdateMatchResultData } from '@/domain/entities/Match';

export interface MatchRepository {
  create(matchData: CreateMatchData): Promise<Match>;
  findById(id: number): Promise<Match | null>;
  list(): Promise<Match[]>;
  updateResult(id: number, resultData: UpdateMatchResultData): Promise<Match>;
}