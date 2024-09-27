import { nanoid } from "nanoid";
import pg from "pg";
import bcrypt from "bcrypt";
import { User } from "./schemas/user.ts";
const { Pool } = pg;

export const pool = new Pool();

export const addUser = async (userBody: User) => {
  const id = nanoid();
  const { username, password, fullname } = userBody;
  const passwordHash = await bcrypt.hash(password, 10);
  const client = await pool.connect();
  await client.query(
    `
      INSERT INTO users (id, username, password, fullname)
      VALUES ($1, $2, $3, $4)
    `,
    [id, username, passwordHash, fullname],
  );
  await client.release();
  return id;
};

export const checkUserUsername = async (userBody: User) => {
  const { username } = userBody;
  const client = await pool.connect();
  const usernames = await client.query(
    `
      SELECT username
      FROM users
      WHERE username=$1
    `,
    [username],
  );
  await client.release();
  return usernames;
};

export const getUserId = async (username: string) => {
  const client = await pool.connect();
  const user = await client.query<{ id: string; password: string }>(
    `
      SELECT id, password
      FROM users
      WHERE username=$1
    `,
    [username],
  );
  await client.release();
  return user;
};

export const addRefreshToken = async (refreshToken: string) => {
  const client = await pool.connect();
  await client.query(
    `
      INSERT INTO authentications (token)
      VALUES ($1)
    `,
    [refreshToken],
  );
  await client.release();
};

export const deleteRefreshToken = async (refreshToken: string) => {
  const client = await pool.connect();
  await client.query(
    `
      DELETE FROM authentications
      WHERE token=$1
    `,
    [refreshToken],
  );
  await client.release();
};

export const getRefreshToken = async (refreshToken: string) => {
  const client = await pool.connect();
  const res = await client.query(
    `
      SELECT token
      FROM authentications
      WHERE token=$1
    `,
    [refreshToken],
  );
  await client.release();
  return res;
};

export const addPlaylist = async (name: string, userId: string) => {
  const id = nanoid();
  const client = await pool.connect();
  await client.query(
    `
      INSERT INTO playlists (id, name, owner)
      VALUES ($1, $2, $3)
    `,
    [id, name, userId],
  );
  await client.release();
  return id;
};

export const getAllPlaylists = async (userId: string) => {
  const client = await pool.connect();
  const res = client.query(
    `
SELECT playlists.id, playlists.name, users.username
FROM playlists
JOIN users ON playlists.owner=users.id
WHERE owner=$1
    `,
    [userId],
  );
  await client.release();
  return res;
};

export const addSongToPlaylist = async (playlistId: string, songId: string) => {
  const id = nanoid();
  const client = await pool.connect();
  await client.query(
    `
INSERT INTO playlist_songs (id, playlist_id, song_id)
VALUES ($1, $2, $3)
    `,
    [id, playlistId, songId],
  );
  await client.release();
  return id;
};

export const validatePlaylistUser = async (
  playlistId: string,
  userId: string,
) => {
  const client = await pool.connect();
  const res = await client.query(
    `
SELECT name
FROM playlists
WHERE id=$1 AND owner=$2
    `,
    [playlistId, userId],
  );
  await client.release();
  return res;
};

export const getPlaylist = async (playlistId: string) => {
  const client = await pool.connect();
  const res = await client.query(
    `
SELECT playlists.id, playlists.name, users.username
FROM playlists
JOIN users ON playlists.owner=users.id
WHERE playlists.id=$1
    `,
    [playlistId],
  );
  await client.release();
  return res;
};

export const getPlaylistSongs = async (playlistId: string) => {
  const client = await pool.connect();
  const res = client.query(
    `--sql
SELECT songs.id, songs.title, songs.performer
FROM songs
JOIN playlist_songs ON playlist_songs.song_id=songs.id
WHERE playlist_songs.playlist_id=$1
    `,
    [playlistId],
  );
  await client.release();
  return res;
};

export const deletePlaylistSong = async (songId: string) => {
  const client = await pool.connect();
  await client.query(
    `--sql
DELETE FROM playlist_songs
WHERE song_id=$1
    `,
    [songId],
  );
  await client.release();
};

export const deletePlaylist = async (playlistId: string) => {
  const client = await pool.connect();
  await client.query(
    `--sql
DELETE FROM playlists
WHERE id=$1
    `,
    [playlistId],
  );
  await client.release();
};
