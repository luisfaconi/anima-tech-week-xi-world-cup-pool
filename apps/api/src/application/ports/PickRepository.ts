import { Pick, CreatePickData, UpdatePickData } from '@/domain/entities/Pick';

export interface PickRepository {
  create(pickData: CreatePickData): Promise<Pick>;
  findById(id: number): Promise<Pick | null>;
  findByUserMatchAndPool(userId: number, matchId: number, poolId: number): Promise<Pick | null>;
  findByUserId(userId: number): Promise<Pick[]>;
  findByUserIdAndPoolId(userId: number, poolId: number): Promise<Pick[]>;
  findByMatchId(matchId: number): Promise<Pick[]>;
  findByPoolId(poolId: number): Promise<Pick[]>;
  update(id: number, pickData: UpdatePickData): Promise<Pick>;
  updatePoints(id: number, points: number): Promise<Pick>;
  delete(id: number): Promise<void>;
}