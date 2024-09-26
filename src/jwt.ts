import "dotenv/config";
import jwt, { HapiJwt } from "@hapi/jwt";

export const generateAccessToken = (userId) => {
  return jwt.token.generate(
    userId,
    process.env.ACCESS_TOKEN_KEY as HapiJwt.Secret,
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.token.generate(
    userId,
    process.env.REFRESH_TOKEN_KEY as HapiJwt.Secret,
  );
};
