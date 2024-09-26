import { nanoid } from "nanoid";
import pg from "pg";
import { Album } from "./schemas/album.ts";
import { Song } from "./schemas/song.ts";
const { Pool } = pg;

const pool = new Pool();

export const addAlbum = async (name: string, year: number) => {
  const id = nanoid();
  const client = await pool.connect();
  await client.query(
    `
      INSERT INTO album (id, name, year)
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
      FROM album
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
      UPDATE album
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
      DELETE FROM album
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
      INSERT INTO song (id, title, year, performer, genre, duration, album_id)
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
      FROM song
    `,
  );
  await client.release();
  return res;
};
