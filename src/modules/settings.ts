import { z } from "zod";

const settingsSchema = z.object({
  PREFIX: z.string(),
  DEFAULTLANG: z.string().default("en_US"),

  LOG_LEVEL: z.string().default("info"),

  TOKEN: z.string(),
  RANDOMKEY: z.string().nullish(),

  DB_NAME: z.string(),
  DB_HOST: z.string(),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_PORT: z.preprocess(
    (p) => (typeof p === "string" ? parseInt(p) : p),
    z.number().int().min(1024).max(65535).default(5432),
  ),
});

const settings = settingsSchema.parse(process.env);

export default settings;
