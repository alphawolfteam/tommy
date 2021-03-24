import { Server } from "./server";
import { logger } from "./utils/logger-client";
import menash from "menashmq";
import { config } from "./config";
import { createGetAccessTokenConsumer } from "./access-token/access-token-client";


process.on("uncaughtException", logger);

(async () => {
  await menash.connect(config.rabbitmq.url);
  await menash.declareTopology({
    queues: [
      { name: config.rabbitmq.logger_queue_name },
      { name: config.rabbitmq.access_token_rpc_queue },
      { name: config.rabbitmq.access_token_return_queue },
    ],
  });
  await createGetAccessTokenConsumer();

  const server: Server = Server.bootstrap();
  server.app.on("close", () => {
    logger({ message: "Server closed" });
  });
})();
