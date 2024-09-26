import { ServerRoute } from "@hapi/hapi";
import {
  badPayloadResponse,
  getRequestBody,
  getRequestParams,
  notFoundResponse,
  serverErrorResponse,
} from "../utils/hapi.ts";
import {
  addAlbum,
  addSong,
  deleteAlbum,
  getAlbum,
  getAllSong,
  getSong,
  putAlbum,
  putSong,
} from "../db.ts";
import { Album, albumPayload } from "../schemas/album.ts";
import { Song, songPayload } from "../schemas/song.ts";

const postRoute: ServerRoute = {
  method: "POST",
  path: "/songs",
  handler: async (request, h) => {
    try {
      const songBody = getRequestBody<Song>(request);

      const { error } = songPayload.validate(songBody);
      if (error) return badPayloadResponse(h, error.details[0].message);

      const returnedId = await addSong(songBody);

      return h
        .response({
          status: "success",
          data: {
            songId: returnedId,
          },
        })
        .code(201);
    } catch (error) {
      console.error(error);
      return serverErrorResponse(h);
    }
  },
};

const getAllRoute: ServerRoute = {
  method: "GET",
  path: "/songs",
  handler: async (request, h) => {
    try {
      const songs = await getAllSong();

      if (songs.rows.length === 0) return notFoundResponse(h);

      return h
        .response({
          status: "success",
          data: {
            songs: songs.rows,
          },
        })
        .code(200);
    } catch (error) {
      console.error(error);
      return serverErrorResponse(h);
    }
  },
};

const getRoute: ServerRoute = {
  method: "GET",
  path: "/songs/{id}",
  handler: async (request, h) => {
    try {
      const { id } = getRequestParams<{ id: string }>(request);
      const song = await getSong(id);

      if (song.rows.length === 0) return notFoundResponse(h);

      return h
        .response({
          status: "success",
          data: {
            song: song.rows[0],
          },
        })
        .code(200);
    } catch (error) {
      console.error(error);
      return serverErrorResponse(h);
    }
  },
};

const putRoute: ServerRoute = {
  method: "PUT",
  path: "/songs/{id}",
  handler: async (request, h) => {
    try {
      const songBody = getRequestBody<Song>(request);
      const { id } = getRequestParams<{ id: string }>(request);
      const song = await getSong(id);

      if (song.rows.length === 0) return notFoundResponse(h);

      const { error } = songPayload.validate(songBody);
      if (error) return badPayloadResponse(h, error.details[0].message);

      await putSong(id, songBody);

      return h
        .response({
          status: "success",
          message: "updated",
        })
        .code(200);
    } catch (error) {
      console.error(error);
      return serverErrorResponse(h);
    }
  },
};

// const deleteRoute: ServerRoute = {
//   method: "DELETE",
//   path: "/albums/{id}",
//   handler: async (request, h) => {
//     try {
//       const { id } = getRequestParams<{ id: string }>(request);
//       const album = await getAlbum(id);

//       if (album.rows.length === 0) return notFoundResponse(h);

//       await deleteAlbum(id);

//       return h
//         .response({
//           status: "success",
//           message: "updated",
//         })
//         .code(200);
//     } catch (error) {
//       console.error(error);
//       return serverErrorResponse(h);
//     }
//   },
// };

export default [
  postRoute,
  getAllRoute,
  getRoute,
  putRoute,
  // deleteRoute
];
