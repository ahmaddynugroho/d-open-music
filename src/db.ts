import { nanoid } from "nanoid";
import pg from "pg";
import { Album } from "./schemas/album.ts";
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
