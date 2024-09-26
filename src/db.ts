import { nanoid } from "nanoid";
import pg from "pg";
import bcrypt from "bcrypt";
import { Album } from "./schemas/album.ts";
import { Song } from "./schemas/song.ts";
import { User } from "./schemas/user.ts";
const { Pool } = pg;

const pool = new Pool();

export const addAlbum = async (name: string, year: number) => {
  const id = nanoid();
  const client = await pool.connect();
  await client.query(
    `
      INSERT INTO albums (id, name, year)
      VALUES ($1, $2, $3)
    `,
    [id, name, year],
  );
  await client.release();
  return id;
};

export const getAlbum = async (id: string) => {
  const client = await pool.connect();
  const album: pg.QueryResult<Album> = await client.query(
    `
      SELECT *
      FROM albums
      WHERE id=$1
    `,
    [id],
  );
  await client.release();
  return album;
};

export const putAlbum = async (id: string, name: string, year: number) => {
  const client = await pool.connect();
  await client.query(
    `
      UPDATE albums
      SET name=$1, year=$2
      WHERE id=$3
    `,
    [name, year, id],
  );
  await client.release();
};

export const deleteAlbum = async (id: string) => {
  const client = await pool.connect();
  await client.query(
    `
      DELETE FROM albums
      WHERE id=$1
    `,
    [id],
  );
  await client.release();
};

export const addSong = async (songBody: Song) => {
  const { title, year, performer, genre, duration, albumId } = songBody;
  const id = nanoid();
  const client = await pool.connect();
  await client.query(
    `
      INSERT INTO songs (id, title, year, performer, genre, duration, album_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [id, title, year, performer, genre, duration, albumId],
  );
  await client.release();
  return id;
};

export const getAllSong = async () => {
  const client = await pool.connect();
  const res = await client.query(
    `
      SELECT id, title, performer
      FROM songs
    `,
  );
  await client.release();
  return res;
};

export const getSong = async (id: string) => {
  const client = await pool.connect();
  const song: pg.QueryResult<Song> = await client.query(
    `
      SELECT *
      FROM songs
      WHERE id=$1
    `,
    [id],
  );
  await client.release();
  return song;
};

export const putSong = async (id: string, songBody: Song) => {
  const { title, year, performer, genre, duration, albumId } = songBody;
  const client = await pool.connect();
  await client.query(
    `
      UPDATE songs
      SET title=$2, year=$3, performer=$4, genre=$5, duration=$6, album_id=$7
      WHERE id=$1
    `,
    [id, title, year, performer, genre, duration, albumId],
  );
  await client.release();
};

export const deleteSong = async (id: string) => {
  const client = await pool.connect();
  await client.query(
    `
      DELETE FROM songs
      WHERE id=$1
    `,
    [id],
  );
  await client.release();
};

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
