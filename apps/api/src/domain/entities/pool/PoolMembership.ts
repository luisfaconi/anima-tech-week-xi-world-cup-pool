export interface PoolMembershipProps {
  id?: number;
  poolId: number;
  userId: number;
  joinedAt?: Date;
}

export class PoolMembership {
  private constructor(private props: PoolMembershipProps) {
    this.validate();
  }

  static create(poolId: number, userId: number): PoolMembership {
    return new PoolMembership({
      poolId,
      userId,
      joinedAt: new Date(),
    });
  }

  static reconstitute(props: PoolMembershipProps): PoolMembership {
    return new PoolMembership(props);
  }

  private validate(): void {
    if (!this.props.poolId || this.props.poolId <= 0) {
      throw new Error('Pool ID is required');
    }

    if (!this.props.userId || this.props.userId <= 0) {
      throw new Error('User ID is required');
    }
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get poolId(): number {
    return this.props.poolId;
  }

  get userId(): number {
    return this.props.userId;
  }

  get joinedAt(): Date | undefined {
    return this.props.joinedAt;
  }
}
