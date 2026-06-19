import { Server } from "node:http";

import { app } from "./app";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { env } from "./config/env";
import { logger } from "./shared/utils/logger";

let server: Server | undefined;

async function bootstrap(): Promise<void> {
  try {
    await connectDatabase();

    server = app.listen(env.PORT, () => {
      logger.info(`CARES API is running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error({ error }, "Failed to start CARES API");
    process.exit(1);
  }
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  logger.info(`${signal} received. Shutting down CARES API.`);

  if (server) {
    server.close(async () => {
      await disconnectDatabase();
      logger.info("CARES API shutdown complete.");
      process.exit(0);
    });
    return;
  }

  await disconnectDatabase();
  process.exit(0);
}

process.on("SIGINT", (signal) => {
  void shutdown(signal);
});

process.on("SIGTERM", (signal) => {
  void shutdown(signal);
});

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection");
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  logger.error({ error }, "Uncaught exception");
  process.exit(1);
});

void bootstrap();
