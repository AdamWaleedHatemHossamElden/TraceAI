import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { databasePool } from "../config/database";
import type { PublicUser, UserRecord, UserRole } from "../types/auth.types";

interface UserRow extends RowDataPacket {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
}

const toPublicUser = (row: UserRow): PublicUser => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  role: row.role
});

const toUserRecord = (row: UserRow): UserRecord => ({
  ...toPublicUser(row),
  passwordHash: row.password_hash
});

export const findUserByEmail = async (email: string): Promise<UserRecord | null> => {
  const [rows] = await databasePool.query<UserRow[]>(
    "SELECT id, full_name, email, password_hash, role FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  return rows[0] ? toUserRecord(rows[0]) : null;
};

export const findPublicUserById = async (id: number): Promise<PublicUser | null> => {
  const [rows] = await databasePool.query<UserRow[]>(
    "SELECT id, full_name, email, password_hash, role FROM users WHERE id = ? LIMIT 1",
    [id]
  );

  return rows[0] ? toPublicUser(rows[0]) : null;
};

export const createUser = async (input: {
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}): Promise<PublicUser> => {
  const [result] = await databasePool.query<ResultSetHeader>(
    "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [input.fullName, input.email, input.passwordHash, input.role]
  );

  return {
    id: result.insertId,
    fullName: input.fullName,
    email: input.email,
    role: input.role
  };
};
