import path from "path";
import fs from "fs";
import { ReqRefDefaults, ServerRoute } from "@hapi/hapi";
import {
  badPayloadResponse,
  getRequestBody,
  getRequestParams,
  HapiReadableStream,
  notFoundResponse,
  serverErrorResponse,
} from "../utils/hapi.ts";
import {
  addAlbum,
  addCover,
  countAlbumLikes,
  deleteAlbum,
  getAlbum,
  getLikedAlbum,
  likeAlbum,
  putAlbum,
  unlikeAlbum,
} from "../database/albums.ts";
import { Album, albumPayload } from "../schemas/album.ts";
import { ResponseToolkit } from "@hapi/hapi";
import { deleteRedisCache, getRedisCache, setRedisCache } from "../redis.ts";

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
      const { id: albumId, name, year, cover_url: coverUrl } = album.rows[0];

      return h
        .response({
          status: "success",
          data: {
            album: {
              id: albumId,
              name,
              year,
              coverUrl:
                `${process.env.HOST}:${process.env.PORT}/uploads/` + coverUrl,
            },
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

const postCovers: ServerRoute = {
  method: "post",
  path: "/albums/{id}/covers",
  options: {
    payload: {
      output: "stream",
      allow: "multipart/form-data",
      multipart: true,
      maxBytes: 512000,
    },
  },
  handler: async (request, h) => {
    try {
      const { id } = getRequestParams<{ id: string }>(request);
      const { cover } = request.payload as { cover: HapiReadableStream };
      const allowedMimeType = ["image/png", "image/jpg"];
      const mimeType = cover.hapi.headers["content-type"];
      if (!allowedMimeType.includes(mimeType)) {
        return h
          .response({
            status: "fail",
            message: "unsupported image. use png/jpg",
          })
          .code(400);
      }

      const filename =
        Date.now().toString() + "_" + cover.hapi.filename.replace(/ /g, "_");
      const directory = path.resolve(process.cwd(), "uploads");
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
      }
      const location = `${directory}/${filename}`;
      const writableStream = fs.createWriteStream(location);

      const result = await new Promise((resolve, reject) => {
        writableStream.on("error", () => reject("error saving file"));
        cover.pipe(writableStream);
        cover.on("end", () => resolve(location));
      });

      console.log(result);
      await addCover(id, filename);
      return h
        .response({
          status: "success",
          message: "berhasil upload",
        })
        .code(201);
    } catch (error) {
      console.error(error);
      return serverErrorResponse(h);
    }
  },
};

const uploads: ServerRoute = {
  method: "get",
  path: "/uploads/{filename}",
  handler: (
    request,
    h: ResponseToolkit<ReqRefDefaults> & { file: (location: string) => void },
  ) => {
    try {
      const { filename } = getRequestParams<{ filename: string }>(request);
      const location = process.cwd() + "/uploads/" + filename;
      return h.file(location);
    } catch (error) {
      console.error(error);
      return serverErrorResponse(h);
    }
  },
};

const likeRoute: ServerRoute = {
  method: "post",
  path: "/albums/{id}/likes",
  options: { auth: "open-music-jwt" },
  handler: async (request, h) => {
    try {
      const { id } = getRequestParams<{ id: string }>(request);

      await deleteRedisCache(`likecount:${id}`);

      const album = await getAlbum(id);

      if (album.rows.length === 0) return notFoundResponse(h);

      const decoded = request.auth.artifacts.decoded as {
        payload: { userId: string };
      };
      const userId = decoded.payload.userId;

      const likedAlbum = await getLikedAlbum(userId);
      if (likedAlbum.rows.length > 0)
        return h
          .response({
            status: "fail",
            message: "already liked",
          })
          .code(400);

      await likeAlbum(userId, id);
      return h
        .response({
          status: "success",
          message: "liked",
        })
        .code(201);
    } catch (error) {
      console.error(error);
      return serverErrorResponse(h);
    }
  },
};

const getLikeRoute: ServerRoute = {
  method: "get",
  path: "/albums/{id}/likes",
  handler: async (request, h) => {
    try {
      const { id } = getRequestParams<{ id: string }>(request);

      const cache = await getRedisCache(`likecount:${id}`);
      if (cache) {
        return h
          .response({
            status: "success",
            data: {
              likes: Number(cache),
            },
          })
          .header("X-Data-Source", "cache");
      }

      const likeCount = (await countAlbumLikes(id)).rows[0].count;
      await setRedisCache(`likecount:${id}`, likeCount);
      return h.response({
        status: "success",
        data: {
          likes: Number(likeCount),
        },
      });
    } catch (error) {
      console.error(error);
      return serverErrorResponse(h);
    }
  },
};

const unlikeRoute: ServerRoute = {
  method: "delete",
  path: "/albums/{id}/likes",
  options: { auth: "open-music-jwt" },
  handler: async (request, h) => {
    try {
      const { id } = getRequestParams<{ id: string }>(request);
      const album = await getAlbum(id);

      if (album.rows.length === 0) return notFoundResponse(h);

      const decoded = request.auth.artifacts.decoded as {
        payload: { userId: string };
      };
      const userId = decoded.payload.userId;

      await unlikeAlbum(userId);

      return h.response({
        status: "success",
        message: "liked",
      });
    } catch (error) {
      console.error(error);
      return serverErrorResponse(h);
    }
  },
};

export default [
  post,
  get,
  put,
  deleteRoute,
  postCovers,
  uploads,
  likeRoute,
  getLikeRoute,
  unlikeRoute,
];
