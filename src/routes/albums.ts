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
  deleteAlbum,
  getAlbum,
  putAlbum,
} from "../database/albums.ts";
import { Album, albumPayload } from "../schemas/album.ts";

const post: ServerRoute = {
  method: "POST",
  path: "/albums",
  handler: async (request, h) => {
    try {
      const { name, year } = getRequestBody<Album>(request);

      const { error } = albumPayload.validate({ name, year });
      if (error) return badPayloadResponse(h, error.details[0].message);

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
      return serverErrorResponse(h);
    }
  },
};

const get: ServerRoute = {
  method: "GET",
  path: "/albums/{id}",
  handler: async (request, h) => {
    try {
      const { id } = getRequestParams<{ id: string }>(request);
      const album = await getAlbum(id);

      if (album.rows.length === 0) return notFoundResponse(h);

      return h
        .response({
          status: "success",
          data: {
            album: album.rows[0],
          },
        })
        .code(200);
    } catch (error) {
      console.error(error);
      return serverErrorResponse(h);
    }
  },
};

const put: ServerRoute = {
  method: "PUT",
  path: "/albums/{id}",
  handler: async (request, h) => {
    try {
      const { name, year } = getRequestBody<Album>(request);
      const { id } = getRequestParams<{ id: string }>(request);
      const album = await getAlbum(id);

      if (album.rows.length === 0) return notFoundResponse(h);

      const { error } = albumPayload.validate({ name, year });
      if (error) return badPayloadResponse(h, error.details[0].message);

      await putAlbum(id, name, year);

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

const deleteRoute: ServerRoute = {
  method: "DELETE",
  path: "/albums/{id}",
  handler: async (request, h) => {
    try {
      const { id } = getRequestParams<{ id: string }>(request);
      const album = await getAlbum(id);

      if (album.rows.length === 0) return notFoundResponse(h);

      await deleteAlbum(id);

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

export default [post, get, put, deleteRoute];
