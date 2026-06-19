import { BaseError } from "./BaseError";

export class UnauthorizedError extends BaseError {
  constructor(message = "Unauthorized", errors: unknown[] = []) {
    super(message, 401, errors);
  }
}
