import { ServerRoute } from "@hapi/hapi";
import { getRequestBody } from "../utils/hapi.ts";
import { addAlbum } from "../db.ts";

type postAlbumBody = {
  name: string;
  year: number;
};

const post: ServerRoute = {
  method: "POST",
  path: "/albums",
  handler: async (request, h) => {
    try {
      const { name, year } = getRequestBody<postAlbumBody>(request);
      const returnedId = await addAlbum(name, year);
      return h
        .response({
          status: "success",
          data: {
            albumId: returnedId,
          },
        })
        .code(201);
    } catch (error) {
      console.error(error);
    }
  },
};

export default [post];
