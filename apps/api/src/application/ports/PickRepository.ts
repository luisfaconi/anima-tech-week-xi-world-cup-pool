import { Pick, CreatePickData, UpdatePickData } from '@/domain/entities/Pick';

export interface PickRepository {
  create(pickData: CreatePickData): Promise<Pick>;
  findById(id: number): Promise<Pick | null>;
  findByUserAndMatch(userId: number, matchId: number): Promise<Pick | null>;
  findByUserId(userId: number): Promise<Pick[]>;
  findByMatchId(matchId: number): Promise<Pick[]>;
  update(id: number, pickData: UpdatePickData): Promise<Pick>;
}