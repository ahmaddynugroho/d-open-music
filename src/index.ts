import "dotenv/config";
import Hapi from "@hapi/hapi";
import HapiJwt from "@hapi/jwt";
import routes from "./routes/index.ts";
import "./db.ts";

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
  });

  await server.register(HapiJwt);

  server.auth.strategy("my_jwt_strategy", "jwt", {
    keys: "some_shared_secret",
    verify: {
      aud: "urn:audience:music",
      iss: "urn:issuer:music",
      sub: false,
      nbf: true,
      exp: true,
      maxAgeSec: 14400, // 4 hours
      timeSkewSec: 15,
    },
    validate: (artifacts) => {
      return {
        isValid: true,
        credentials: { user: artifacts.decoded.payload.userId },
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
