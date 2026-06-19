import mysql from "mysql2/promise";

import { env } from "./env";

export const databasePool = mysql.createPool({
  host: env.database.host,
  port: env.database.port,
  database: env.database.name,
  user: env.database.user,
  password: env.database.password,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true
});
