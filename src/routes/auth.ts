import { ServerRoute } from "@hapi/hapi";
import {
  badPayloadResponse,
  getRequestBody,
  serverErrorResponse,
} from "../utils/hapi.ts";
import { User, userPayload } from "../schemas/user.ts";
import { addUser, checkUserUsername } from "../db.ts";

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
] as ServerRoute[];
