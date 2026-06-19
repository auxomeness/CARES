import { BaseError } from "./BaseError";

export class ConflictError extends BaseError {
  constructor(message = "Conflict", errors: unknown[] = []) {
    super(message, 409, errors);
  }
}
