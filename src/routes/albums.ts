import { ServerRoute } from "@hapi/hapi";
import { badPayloadResponse, getRequestBody } from "../utils/hapi.ts";
import { addAlbum } from "../db.ts";
import albumPayload from "../schemas/album.ts";

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

      const { error } = albumPayload.validate({ name, year });
      if (error) {
        return badPayloadResponse(h, error.details[0].message);
      }

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
