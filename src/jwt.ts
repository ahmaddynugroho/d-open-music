import "dotenv/config";
import Jwt, { HapiJwt } from "@hapi/jwt";

export const generateAccessToken = (userId) => {
  return Jwt.token.generate(
    { userId },
    process.env.ACCESS_TOKEN_KEY as HapiJwt.Secret,
  );
};

export const generateRefreshToken = (userId) => {
  return Jwt.token.generate(
    { userId },
    process.env.REFRESH_TOKEN_KEY as HapiJwt.Secret,
  );
};

export const verifyRefreshToken = (refreshToken) => {
  try {
    const artifatcs = Jwt.token.decode(refreshToken);
    Jwt.token.verify(
      artifatcs,
      process.env.REFRESH_TOKEN_KEY as HapiJwt.Secret,
    );
    return { isValid: true, userId: artifatcs.decoded.payload.userId };
  } catch (error) {
    console.log(error);
    return { isValid: false };
  }
};
