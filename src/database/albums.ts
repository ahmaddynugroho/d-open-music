import { nanoid } from "nanoid";
import { pool } from "../db.ts";
import pg from "pg";
import { Album } from "../schemas/album.ts";

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
