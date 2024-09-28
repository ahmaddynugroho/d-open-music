import { ServerRoute } from "@hapi/hapi";
import {
  badPayloadResponse,
  forbiddenResponse,
  getRequestBody,
  getRequestParams,
  notFoundResponse,
  serverErrorResponse,
} from "../utils/hapi.ts";
import {
  exportPlaylistPayload,
  playlistPayload,
  playlistSongPayload,
} from "../schemas/playlist.ts";
import {
  addPlaylist,
  addSongToPlaylist,
  deletePlaylist,
  deletePlaylistSong,
  getAllPlaylists,
  getPlaylist,
  getPlaylistSongs,
  validatePlaylistUser,
} from "../database/playlists.ts";
import { getSong } from "../database/songs.ts";
import { sendAmqpMessage } from "../amqp.ts";

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
  {
    method: "GET",
    path: "/playlists",
    options: { auth: "open-music-jwt" },
    handler: async (request, h) => {
      try {
        const artifacts = request.auth.artifacts.decoded as {
          payload: {
            userId: string;
          };
        };

        const userId = artifacts.payload.userId;
        const playlists = await getAllPlaylists(userId);

        return h.response({
          status: "success",
          data: {
            playlists: playlists.rows,
          },
        });
      } catch (error) {
        console.log(error);
        return serverErrorResponse(h);
      }
    },
  },
  {
    method: "POST",
    path: "/playlists/{id}/songs",
    options: { auth: "open-music-jwt" },
    handler: async (request, h) => {
      try {
        const playlistSongParam = await getRequestParams<{ id: string }>(
          request,
        );
        const playlistSongBody = await getRequestBody<{ songId: string }>(
          request,
        );
        const { error } = playlistSongPayload.validate(playlistSongBody);
        if (error) return badPayloadResponse(h);

        const song = await getSong(playlistSongBody.songId);
        if (song.rows.length === 0) return notFoundResponse(h);

        const artifacts = request.auth.artifacts as {
          decoded: { payload: { userId: string } };
        };
        const userId = artifacts.decoded.payload.userId;

        const isValidUser = await validatePlaylistUser(
          playlistSongParam.id,
          userId,
        );
        if (isValidUser.rows.length === 0) return forbiddenResponse(h);

        const playlistSongId = await addSongToPlaylist(
          playlistSongParam.id,
          playlistSongBody.songId,
        );

        return h
          .response({
            status: "success",
            message: "inserted",
            data: {
              playlistSongId: playlistSongId,
            },
          })
          .code(201);
      } catch (error) {
        console.log(error);
        return serverErrorResponse(h);
      }
    },
  },
  {
    method: "GET",
    path: "/playlists/{id}/songs",
    options: { auth: "open-music-jwt" },
    handler: async (request, h) => {
      try {
        const artifacts = request.auth.artifacts as {
          decoded: { payload: { userId: string } };
        };
        const userId = artifacts.decoded.payload.userId;
        const playlistParam = getRequestParams<{ id: string }>(request);

        const isPlaylistExist = await getPlaylist(playlistParam.id);
        if (isPlaylistExist.rows.length === 0) return notFoundResponse(h);

        const isValidUser = await validatePlaylistUser(
          playlistParam.id,
          userId,
        );
        if (isValidUser.rows.length === 0) return forbiddenResponse(h);

        return h.response({
          status: "success",
          data: {
            playlist: {
              ...(await getPlaylist(playlistParam.id)).rows[0],
              songs: (await getPlaylistSongs(playlistParam.id)).rows,
            },
          },
        });
      } catch (error) {
        console.log(error);
        return serverErrorResponse(h);
      }
    },
  },
  {
    method: "delete",
    path: "/playlists/{id}/songs",
    options: { auth: "open-music-jwt" },
    handler: async (request, h) => {
      try {
        const playlistSongBody = await getRequestBody<{ songId: string }>(
          request,
        );
        const { error } = playlistSongPayload.validate(playlistSongBody);
        if (error) return badPayloadResponse(h);

        const artifacts = request.auth.artifacts as {
          decoded: { payload: { userId: string } };
        };
        const userId = artifacts.decoded.payload.userId;
        const playlistParam = getRequestParams<{ id: string }>(request);
        const isValidUser = await validatePlaylistUser(
          playlistParam.id,
          userId,
        );
        if (isValidUser.rows.length === 0) return forbiddenResponse(h);

        await deletePlaylistSong(playlistSongBody.songId);

        return h.response({
          status: "success",
          message: "deleted",
        });
      } catch (error) {
        console.log(error);
        return serverErrorResponse(h);
      }
    },
  },
  {
    method: "delete",
    path: "/playlists/{id}",
    options: { auth: "open-music-jwt" },
    handler: async (request, h) => {
      try {
        const artifacts = request.auth.artifacts as {
          decoded: { payload: { userId: string } };
        };
        const userId = artifacts.decoded.payload.userId;
        const playlistParam = getRequestParams<{ id: string }>(request);
        const isValidUser = await validatePlaylistUser(
          playlistParam.id,
          userId,
        );
        if (isValidUser.rows.length === 0) return forbiddenResponse(h);

        await deletePlaylist(playlistParam.id);

        return h.response({
          status: "success",
          message: "deleted",
        });
      } catch (error) {
        console.log(error);
        return serverErrorResponse(h);
      }
    },
  },
  {
    method: "post",
    path: "/export/playlists/{id}",
    options: { auth: "open-music-jwt" },
    handler: async (request, h) => {
      try {
        const body = await getRequestBody<{ name: string }>(request);
        const { error } = exportPlaylistPayload.validate(body);
        if (error) return badPayloadResponse(h);

        const playlistParam = getRequestParams<{ id: string }>(request);
        const isPlaylistExist = await getPlaylist(playlistParam.id);
        if (isPlaylistExist.rows.length === 0) return notFoundResponse(h);

        const artifacts = request.auth.artifacts.decoded as {
          payload: {
            userId: string;
          };
        };

        const userId = artifacts.payload.userId;
        const isValidUser = await validatePlaylistUser(
          playlistParam.id,
          userId,
        );
        if (isValidUser.rows.length === 0) return forbiddenResponse(h);

        await sendAmqpMessage("export:playlist", "awikwok");

        return h
          .response({
            status: "success",
            message: "sent to queue",
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
