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