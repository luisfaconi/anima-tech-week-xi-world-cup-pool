export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UserNotFoundError extends DomainError {
  readonly code = 'USER_NOT_FOUND';

  constructor(userId: number) {
    super(`User with ID ${userId} not found`);
  }
}

export class UserAlreadyExistsError extends DomainError {
  readonly code = 'USER_ALREADY_EXISTS';

  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}

export class MatchNotFoundError extends DomainError {
  readonly code = 'MATCH_NOT_FOUND';

  constructor(matchId: number) {
    super(`Match with ID ${matchId} not found`);
  }
}

export class PickNotFoundError extends DomainError {
  readonly code = 'PICK_NOT_FOUND';

  constructor(pickId: number) {
    super(`Pick with ID ${pickId} not found`);
  }
}

export class DuplicatePickError extends DomainError {
  readonly code = 'DUPLICATE_PICK';

  constructor(userId: number, matchId: number) {
    super(`User ${userId} already has a pick for match ${matchId}`);
  }
}

export class MatchAlreadyStartedError extends DomainError {
  readonly code = 'MATCH_STARTED';

  constructor(matchId: number) {
    super(`Cannot modify pick for match ${matchId} - match has already started`);
  }
}

export class PoolNotFoundError extends DomainError {
  readonly code = 'POOL_NOT_FOUND';

  constructor(poolId: number) {
    super(`Pool with ID ${poolId} not found`);
  }
}

export class PoolNotFoundByCodeError extends DomainError {
  readonly code = 'POOL_NOT_FOUND';

  constructor(inviteCode: string) {
    super(`Pool with invite code ${inviteCode} not found`);
  }
}

export class PoolInactiveError extends DomainError {
  readonly code = 'POOL_INACTIVE';

  constructor(poolId: number) {
    super(`Pool ${poolId} is inactive and cannot accept new members or picks`);
  }
}

export class UserAlreadyInPoolError extends DomainError {
  readonly code = 'USER_ALREADY_IN_POOL';

  constructor(userId: number, poolId: number) {
    super(`User ${userId} is already a member of pool ${poolId}`);
  }
}

export class UserNotPoolMemberError extends DomainError {
  readonly code = 'USER_NOT_POOL_MEMBER';

  constructor(userId: number, poolId: number) {
    super(`User ${userId} is not a member of pool ${poolId}`);
  }
}

export class UnauthorizedPoolActionError extends DomainError {
  readonly code = 'UNAUTHORIZED_POOL_ACTION';

  constructor(action: string) {
    super(`Unauthorized: ${action}`);
  }
}