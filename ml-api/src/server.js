import Hapi from "@hapi/hapi";
import admin from "firebase-admin";
import config from "./config/config.js";

(async () => {
  const server = Hapi.server({
    port: config.port,
    host: config.host,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  try {
    await server.start();

    console.log(`Server started at: ${server.info.uri}`);
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
})();
