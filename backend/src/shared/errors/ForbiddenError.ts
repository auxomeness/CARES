import { BaseError } from "./BaseError";

export class ForbiddenError extends BaseError {
  constructor(message = "Forbidden", errors: unknown[] = []) {
    super(message, 403, errors);
  }
}
