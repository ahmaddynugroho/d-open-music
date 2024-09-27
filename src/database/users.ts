import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { pool } from "../db.ts";
import { User } from "../schemas/user.ts";

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
