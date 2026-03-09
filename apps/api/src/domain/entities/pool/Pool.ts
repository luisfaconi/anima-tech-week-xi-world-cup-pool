export interface ScoringRules {
  exact_score: number;
  goal_difference?: number;
  correct_winner: number;
  wrong: number;
}

export interface PoolProps {
  id?: number;
  name: string;
  description?: string;
  inviteCode: string;
  ownerId: number;
  scoringRules: ScoringRules;
  isActive: boolean;
  createdAt?: Date;
}

export class Pool {
  private constructor(private props: PoolProps) {
    this.validate();
  }

  static create(props: Omit<PoolProps, 'id' | 'createdAt' | 'inviteCode' | 'isActive'>): Pool {
    return new Pool({
      ...props,
      inviteCode: Pool.generateInviteCode(),
      isActive: true,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: PoolProps): Pool {
    return new Pool(props);
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error('Pool name is required');
    }

    if (this.props.name.length > 100) {
      throw new Error('Pool name must not exceed 100 characters');
    }

    if (!this.props.inviteCode || this.props.inviteCode.length === 0) {
      throw new Error('Invite code is required');
    }

    if (!this.props.ownerId || this.props.ownerId <= 0) {
      throw new Error('Pool owner is required');
    }

    this.validateScoringRules();
  }

  private validateScoringRules(): void {
    const rules = this.props.scoringRules;

    if (typeof rules.exact_score !== 'number' || rules.exact_score < 0) {
      throw new Error('Exact score points must be a non-negative number');
    }

    if (rules.goal_difference !== undefined && (typeof rules.goal_difference !== 'number' || rules.goal_difference < 0)) {
      throw new Error('Goal difference points must be a non-negative number');
    }

    if (typeof rules.correct_winner !== 'number' || rules.correct_winner < 0) {
      throw new Error('Correct winner points must be a non-negative number');
    }

    if (typeof rules.wrong !== 'number' || rules.wrong < 0) {
      throw new Error('Wrong prediction points must be a non-negative number');
    }
  }

  private static generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  updateDetails(name: string, description?: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Pool name is required');
    }

    if (name.length > 100) {
      throw new Error('Pool name must not exceed 100 characters');
    }

    this.props.name = name;
    this.props.description = description;
  }

  updateScoringRules(rules: ScoringRules): void {
    this.props.scoringRules = rules;
    this.validateScoringRules();
  }

  deactivate(): void {
    this.props.isActive = false;
  }

  activate(): void {
    this.props.isActive = true;
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get inviteCode(): string {
    return this.props.inviteCode;
  }

  get ownerId(): number {
    return this.props.ownerId;
  }

  get scoringRules(): ScoringRules {
    return { ...this.props.scoringRules };
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  isOwner(userId: number): boolean {
    return this.props.ownerId === userId;
  }
}
