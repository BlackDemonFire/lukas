import { Config } from "effect";

export const AppConfig = Config.all({
  prefix: Config.String("PREFIX"),
  defaultLanguage: Config.String("DEFAULTLANG").pipe(Config.withDefault("en_US")),

  logLevel: Config.String().pipe(Config.withDefault("info")),

  TOKEN: Config.Redacted("TOKEN"),
  RANDOMKEY: Config.Redacted("RANDOMKEY").pipe(Config.option),

  DB_NAME: Config.String("DB_NAME"),
  DB_HOST: Config.String("DB_HOST"),
  DB_USER: Config.String("DB_USER"),
  DB_PASS: Config.Redacted("DB_PASS"),
  DB_PORT: Config.Port("DB_PORT").pipe(Config.withDefault(5432)),
});

export default AppConfig;
