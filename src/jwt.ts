import "dotenv/config";
import Jwt, { HapiJwt } from "@hapi/jwt";
import { addRefreshToken, getRefreshToken } from "./db.ts";

export const generateAccessToken = (userId) => {
  return Jwt.token.generate(
    { userId },
    process.env.ACCESS_TOKEN_KEY as HapiJwt.Secret,
  );
};

export const generateRefreshToken = async (userId) => {
  const token = Jwt.token.generate(
    { userId },
    process.env.REFRESH_TOKEN_KEY as HapiJwt.Secret,
  );
  await addRefreshToken(token);
  return token;
};

export const verifyRefreshToken = async (refreshToken) => {
  try {
    const isExist = await getRefreshToken(refreshToken);
    if (isExist.rows.length === 0) {
      throw new Error("token not exist in db");
    }
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
