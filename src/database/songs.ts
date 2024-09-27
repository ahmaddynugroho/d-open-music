import { nanoid } from "nanoid";
import { pool } from "../db.ts";
import pg from "pg";
import { Song } from "../schemas/song.ts";

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
