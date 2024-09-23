import { ServerRoute } from "@hapi/hapi";
import { getRequestBody } from "../utils/hapi.ts";
import { nanoid } from "nanoid";

type postAlbumBody = {
  name: string;
  year: number;
};

const post: ServerRoute = {
  method: "POST",
  path: "/albums",
  handler: (request, h) => {
    const body = getRequestBody<postAlbumBody>(request);
    const id = nanoid();
    console.log(body);
    return h
      .response({
        status: "success",
        data: {
          albumId: id,
        },
      })
      .code(201);
  },
};

export default [post];
