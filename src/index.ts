import "dotenv/config";
import Hapi from "@hapi/hapi";
import Jwt from "@hapi/jwt";
import routes from "./routes/index.ts";
import "./db.ts";

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
  });

  await server.register(Jwt);

  server.auth.strategy("open-music-jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: 14400, // 4 hours
    },
    validate: (artifacts) => {
      return {
        isValid: true,
        userId: artifacts.decoded.payload.userId,
      };
    },
  });

  server.route(routes);

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
