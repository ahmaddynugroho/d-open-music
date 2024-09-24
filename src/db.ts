import { nanoid } from "nanoid";
import pg from "pg";
const Client = pg.Client;

const client = new Client();

export const addAlbum = async (name: string, year: number) => {
  const id = nanoid();
  await client.connect();
  await client.query(
    `
      INSERT INTO album (id, name, year)
      VALUES ($1, $2, $3)
    `,
    [id, name, year],
  );
  await client.end();
  return id;
};
