import pinoHttp from "pino-http";

import { logger } from "../utils/logger";

export const requestLogger = pinoHttp({
  logger,
  customProps: (req) => ({
    requestId: req.id
  }),
  customSuccessMessage: (req, res) =>
    `${req.method} ${req.url} completed with ${res.statusCode}`,
  customErrorMessage: (req, res) =>
    `${req.method} ${req.url} failed with ${res.statusCode}`
});
