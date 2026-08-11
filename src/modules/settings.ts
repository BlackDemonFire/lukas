import { Config } from "effect";

export const AppConfig = Config.all({
  prefix: Config.string("PREFIX"),
  defaultLanguage: Config.string("DEFAULTLANG").pipe(Config.withDefault("en_US")),

  logLevel: Config.string().pipe(Config.withDefault("info")),

  TOKEN: Config.redacted("TOKEN"),
  RANDOMKEY: Config.redacted("RANDOMKEY").pipe(Config.option),

  DB_NAME: Config.string("DB_NAME"),
  DB_HOST: Config.string("DB_HOST"),
  DB_USER: Config.string("DB_USER"),
  DB_PASS: Config.redacted("DB_PASS"),
  DB_PORT: Config.port("DB_PORT").pipe(Config.withDefault(5432)),
});

export default AppConfig;
