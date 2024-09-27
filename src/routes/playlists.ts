import { ServerRoute } from "@hapi/hapi";
import {
  badPayloadResponse,
  getRequestBody,
  serverErrorResponse,
} from "../utils/hapi.ts";
import { playlistPayload } from "../schemas/playlist.ts";
import { addPlaylist } from "../db.ts";

const playlists: ServerRoute[] = [
  {
    method: "POST",
    path: "/playlists",
    options: { auth: "open-music-jwt" },
    handler: async (request, h) => {
      try {
        const playlistBody = await getRequestBody<{ name: string }>(request);
        const { error } = playlistPayload.validate(playlistBody);
        if (error) return badPayloadResponse(h);

        const artifacts = request.auth.artifacts.decoded as {
          payload: {
            userId: string;
          };
        };

        const userId = artifacts.payload.userId;
        const playlistId = await addPlaylist(playlistBody.name, userId);

        return h
          .response({
            status: "success",
            data: {
              playlistId: playlistId,
            },
          })
          .code(201);
      } catch (error) {
        console.log(error);
        return serverErrorResponse(h);
      }
    },
  },
];

export default playlists;
