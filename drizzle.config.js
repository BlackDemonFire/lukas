/** @type { import("drizzle-kit").Config } */
export default {
  dialect: "postgresql",
  schema: "./src/db",
  out: "./drizzle",
  dbCredentials: {
    database: process.env.DB_NAME ?? "lukas",
    host: process.env.DB_HOST ?? "localhost",
    password: process.env.DB_PASS,
    port: process.env.DB_PORT ?? 5432,
    user: process.env.DB_USER ?? "lukas",
  },
};
