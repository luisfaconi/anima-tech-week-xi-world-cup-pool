import { ScoringRules } from '../../domain/entities/Pool';

export interface PoolDto {
  id: number;
  name: string;
  description?: string;
  inviteCode: string;
  ownerId: number;
  scoringRules: ScoringRules;
  isActive: boolean;
  createdAt: Date;
  memberCount?: number;
}

export interface CreatePoolDto {
  name: string;
  description?: string;
  ownerId: number;
  scoringRules?: ScoringRules;
}

export interface UpdatePoolDto {
  name?: string;
  description?: string;
  scoringRules?: ScoringRules;
}

export interface JoinPoolDto {
  userId: number;
  inviteCode: string;
}

export interface PoolMemberDto {
  id: number;
  poolId: number;
  userId: number;
  userName?: string;
  joinedAt: Date;
}
