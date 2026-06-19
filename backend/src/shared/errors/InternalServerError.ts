import { BaseError } from "./BaseError";

export class InternalServerError extends BaseError {
  constructor(message = "Internal server error", errors: unknown[] = []) {
    super(message, 500, errors);
  }
}
