import { ServerRoute } from "@hapi/hapi";
import {
  badPayloadResponse,
  getRequestBody,
  serverErrorResponse,
  failedLoginResponse,
} from "../utils/hapi.ts";
import { User, userLoginPayload, userPayload } from "../schemas/user.ts";
import { addUser, checkUserUsername, getUserId } from "../db.ts";
import { compare, hash } from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../jwt.ts";

export default [
  {
    method: "POST",
    path: "/users",
    handler: async (request, h) => {
      try {
        const userBody = await getRequestBody<User>(request);
        const { error } = userPayload.validate(userBody);
        if (error) return badPayloadResponse(h, error.details[0].message);
        const usernames = await checkUserUsername(userBody);
        console.log(usernames);
        if (usernames.rows.length > 0)
          return badPayloadResponse(h, "username is taken");

        const userId = await addUser(userBody);

        return h
          .response({
            status: "success",
            data: {
              userId: userId,
            },
          })
          .code(201);
      } catch (error) {
        console.log(error);
        return serverErrorResponse(h);
      }
    },
  },
  {
    method: "POST",
    path: "/authentications",
    handler: async (request, h) => {
      try {
        const userBody = await getRequestBody<User>(request);
        const { error } = userLoginPayload.validate(userBody);
        if (error) return badPayloadResponse(h, error.details[0].message);

        const user = await getUserId(userBody.username);

        if (user.rows.length === 0)
          return failedLoginResponse(h, "user not found");
        const passwordHash = await hash(userBody.password, 10);
        const isPasswordCorrect = await compare(
          passwordHash,
          user.rows[0].password,
        );

        if (!isPasswordCorrect)
          return failedLoginResponse(h, "wrong password dawg");

        const accessToken = generateAccessToken(user.rows[0].id);
        const refreshToken = generateRefreshToken(user.rows[0].id);

        return h
          .response({
            status: "success",
            data: {
              accessToken: accessToken,
              refreshToken: refreshToken,
            },
          })
          .code(201);
      } catch (error) {
        console.log(error);
        return serverErrorResponse(h);
      }
    },
  },
] as ServerRoute[];
