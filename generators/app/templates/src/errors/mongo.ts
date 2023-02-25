export class PopulateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PopulateError';
  }
}

export class AggregationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AggregationError';
  }
}

export class CreateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CreateError';
  }
}

export class InsertManyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsertManyError';
  }
}

export class UpdateManyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UpdateManyError';
  }
}

export class UpdateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UpdateError';
  }
}

export class BulkWriteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BulkError';
  }
}

export class DeleteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeleteError';
  }
}

export class DeleteManyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeleteManyError';
  }
}
