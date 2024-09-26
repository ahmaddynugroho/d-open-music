import { ServerRoute } from "@hapi/hapi";
import { getRequestBody, serverErrorResponse } from "../utils/hapi.ts";

export default [
  {
    method: "POST",
    path: "/users",
    handler: async (request, h) => {
      try {
        const userBody = await getRequestBody(request);
        console.log(userBody);

        const userId = "user_id";

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
