import type { Guild, User } from "discord.js";
import pg, { QueryResult } from "pg";
import logger from "./modules/logger.js";
import type { dsachar, nil } from "./types";
import settings from "./modules/settings.js";

const { Pool } = pg;

export class DB {
  protected db;
  constructor() {
    this.db = new Pool({
      application_name: "lukas",
      database: settings.DB_NAME,
      host: settings.DB_HOST,
      keepAlive: true,
      log: (...messages) => logger.debug(messages),
      port: settings.DB_PORT,
      password: settings.DB_PASS,
      user: settings.DB_USER,
    });
    this.ensureTables();
  }
  private async ensureTables() {
    const client = await this.db.connect();
    try {
      const tables = (
        await client.query(
          "SELECT * FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';",
        )
      ).rows;
      logger.debug(
        "Existing databases: " + tables.map((t) => t.tablename).join(", "),
      );
      let todoTables = [
        [
          "dsachars",
          "CREATE TABLE dsachars (prefix TEXT PRIMARY KEY, avatar TEXT, displayname TEXT);",
        ],
        [
          "settings",
          `CREATE TABLE settings
                (guild TEXT PRIMARY KEY, language TEXT);`,
        ],
        [
          "userdb",
          `CREATE TABLE userdb
                (id TEXT PRIMARY KEY,
                giftype TEXT,
                color TEXT,
                name TEXT);`,
        ],
        [
          "gifdb",
          `CREATE TABLE gifdb
                (url TEXT PRIMARY KEY,
                giftype TEXT,
                actiontype TEXT);`,
        ],
      ];
      if (tables && tables.length > 0) {
        /** @type {string[]}*/
        const tablenames = tables.map((t) => t.tablename);
        todoTables = todoTables.filter(
          (val) => tablenames.indexOf(val[0]) == -1,
        );
      }
      for (const stmt of todoTables) {
        logger.debug(`creating table ${stmt[0]}`);
        client.query(stmt[1]);
      }
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      client.release();
    }
  }

  private async query(
    sql: string,
    data: unknown[],
  ): Promise<QueryResult | nil> {
    const client = await this.db.connect();
    try {
      const res = await client.query(sql, data).catch((e) => {
        throw e;
      });
      if (res) return res;
    } catch (e) {
      logger.error(e);
    } finally {
      client.release();
    }
  }
  deleteDSAChar(prefix: string) {
    this.query("DELETE FROM dsachars WHERE prefix = $1;", [prefix]);
  }
  async getcolor(user: User) {
    const data = await this.query("SELECT color FROM userdb WHERE id = $1;", [
      user.id,
    ]);
    if (!data) return "Random";
    return data.rows ? data.rows[0].color : "Random";
  }
  async getDSAChar(prefix: string): Promise<dsachar | nil> {
    const data = await this.query("SELECT * FROM dsachars WHERE prefix = $1;", [
      prefix,
    ]);
    if (!data) return;
  }
  async getgif(actiontype: string, giftype: string): Promise<string> {
    const amount = (await this.query(
      "SELECT COUNT(*) FROM gifdb WHERE giftype = $1 AND actiontype = $2;",
      [giftype, actiontype],
    ))!.rows[0] as number;
    if (amount === 0 || giftype == "any") {
      const data = await this.query(
        "SELECT url FROM gifdb WHERE actiontype = $1 ORDER BY random() LIMIT 1;",
        [actiontype],
      );
      if (!data) return "";
      return data.rows ? data.rows[0].url : "";
    }
    const data = await this.query(
      "SELECT url FROM gifdb WHERE giftype = $1 AND actiontype = $2 ORDER BY random() LIMIT 1;",
      [giftype, actiontype],
    );
    if (!data) return "";
    return data.rows ? data.rows[0].url : "";
  }
  async getgifactions(): Promise<string[]> {
    const data = await this.query("SELECT DISTINCT actiontype FROM gifdb;", []);
    return data ? data.rows.map((row) => row.actiontype) : [];
  }
  async getgiftypes() {
    const data = await this.query("select distinct giftype from gifdb;", []);
    return data ? data.rows.map((row) => row.giftype) : [];
  }
  async getgiftype(user: User): Promise<string> {
    const data = await this.query("SELECT giftype FROM userdb WHERE id = $1;", [
      user.id,
    ]);
    if (!data) return "anime";
    return data.rows ? data.rows[0].giftype : "anime";
  }
  async getLang(guild: Guild): Promise<string> {
    const data = await this.query(
      "SELECT language FROM settings WHERE guild = $1;",
      [guild.id],
    );
    if (!data) return "";
    return data.rows ? data.rows[0].language : "";
  }
  async getname(user: User): Promise<string> {
    const data = await this.query("SELECT name FROM userdb WHERE id = $1;", [
      user.id,
    ]);
    if (!data) return "";
    return data.rows ? data.rows[0].name : "";
  }
  initLang(guild: Guild, lang: string) {
    this.query("INSERT INTO settings VALUES ($1, $2) ON CONFLICT DO NOTHING;", [
      guild.id,
      lang,
    ]);
  }
  newDSAChar(prefix: string, displayname: string, avatar: string) {
    this.query(
      "INSERT INTO dsachars VALUES ($1, $2, $3) ON CONFLICT DO NOTHING;",
      [prefix, avatar, displayname],
    );
  }
  newgif(url: string, actiontype: string, giftype: string) {
    this.query(
      "INSERT INTO gifdb VALUES ($1, $2, $3) ON CONFLICT DO NOTHING;",
      [url, giftype, actiontype],
    );
  }
  removegif(url: string) {
    this.query("DELETE FROM gifdb WHERE url = $1", [url]);
  }
  newuser(user: User) {
    this.query(
      "INSERT INTO userdb VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING;",
      [user.id, "anime", "Random", ""],
    );
  }
  setcolor(user: User, color: string) {
    this.query("UPDATE userdb SET color = $2 WHERE id = $1;", [user.id, color]);
  }
  setgiftype(user: User, giftype: string) {
    this.query("UPDATE userdb SET giftype = $2 WHERE id = $1;", [
      user.id,
      giftype,
    ]);
  }
  setLang(guild: Guild, lang: string) {
    this.query("UPDATE settings SET language = $2 WHERE guild = $1;", [
      guild.id,
      lang,
    ]);
  }
  setname(user: User, name: string) {
    this.query("UPDATE userdb SET name = $2 WHERE id = $1;", [user.id, name]);
  }
}
