import { ServerRoute } from "@hapi/hapi";
import { getRequestBody } from "../utils/hapi.ts";

type postAlbumBody = {
  name: string;
  year: number;
};

const post: ServerRoute = {
  method: "POST",
  path: "/albums",
  handler: (request, h) => {
    const body = getRequestBody<postAlbumBody>(request);
    console.log(body);
    return h
      .response({
        status: "success",
        data: {
          albumId: "awikwok",
        },
      })
      .code(201);
  },
};

export default [post];
