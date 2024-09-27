import { pool } from "../db.ts";

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
