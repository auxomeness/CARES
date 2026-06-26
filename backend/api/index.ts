import { IncomingMessage, ServerResponse } from "node:http";

import { app } from "../src/app";
import { logger } from "../src/shared/utils/logger";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    return app(req, res);
  } catch (error) {
    logger.error({ error }, "Failed to handle serverless request");
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        success: false,
        message: "Internal server error",
        errors: []
      })
    );
  }
}
