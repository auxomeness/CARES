import { BaseError } from "./BaseError";

export class BadRequestError extends BaseError {
  constructor(message = "Bad request", errors: unknown[] = []) {
    super(message, 400, errors);
  }
}
