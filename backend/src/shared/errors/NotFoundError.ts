import { BaseError } from "./BaseError";

export class NotFoundError extends BaseError {
  constructor(message = "Resource not found", errors: unknown[] = []) {
    super(message, 404, errors);
  }
}
