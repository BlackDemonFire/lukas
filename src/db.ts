import { wrap } from "@mikro-orm/core";
import {
  EntityManager,
  MikroORM,
  PostgreSqlDriver,
} from "@mikro-orm/postgresql";
import { type Guild, type User } from "discord.js";
import { Dsachars } from "./entities/Dsachars.js";
import { Gifdb } from "./entities/Gifdb.js";
import { Settings } from "./entities/Settings.js";
import { Userdb } from "./entities/Userdb.js";
import mikroOrmConfig from "./mikro-orm.config.js";
import logger from "./modules/logger.js";

export class DB {
  protected _db?: EntityManager<PostgreSqlDriver>;
  private _orm?: MikroORM;
  constructor() {
    void MikroORM.init(mikroOrmConfig).then((orm) => {
      this._orm = orm;
      this._db = orm.em;
      void this.runMigration();
    });
  }
  private async runMigration() {
    logger.info("Running Database Migration");
    try {
      const migration = await this._orm!.getMigrator().up();
      migration.forEach((m) => logger.debug(m.name));
      logger.info("Database Migration successful");
    } catch (e) {
      logger.error("Database Migration failed");
      logger.error(e);
      process.exit(1);
    }
  }

  protected get db(): EntityManager {
    logger.debug("Getting Database session");
    if (!this._db) throw new Error("Database not initialized");
    return this._db.fork();
  }
  protected get gifRepository() {
    const db = this.db;
    return { db, repo: db.getRepository(Gifdb) };
  }
  protected get dsaCharRepository() {
    const db = this.db;
    return { db, repo: db.getRepository(Dsachars) };
  }
  protected get userRepository() {
    const db = this.db;
    return { db, repo: db.getRepository(Userdb) };
  }
  protected get settingsRepository() {
    const db = this.db;
    return { db, repo: db.getRepository(Settings) };
  }

  async deleteDSAChar(prefix: string) {
    const { repo } = this.dsaCharRepository;
    await repo.nativeDelete({ prefix });
  }
  async getColor(user: User): Promise<string> {
    const { repo } = this.userRepository;
    const data = await repo.findOne({ id: user.id }, { fields: ["color"] });
    return data?.color ?? "Random";
  }
  async getDSAChar(prefix: string): Promise<Dsachars | null> {
    const { repo } = this.dsaCharRepository;
    return await repo.findOne({ prefix });
  }
  async getGif(actiontype: string, giftype: string): Promise<string> {
    const { repo } = this.gifRepository;
    const totalCount = await repo.count({ actiontype, giftype });

    let data;
    if (totalCount == 0) {
      const cnt = await repo.count({ actiontype });
      data = await repo.findOne(
        { actiontype },
        { offset: Math.floor(Math.random() * cnt) },
      );
    } else {
      data = await repo.findOne(
        { giftype, actiontype },
        { offset: Math.floor(Math.random() * totalCount) },
      );
    }

    return data?.url ?? "";
  }
  async getGifactions(): Promise<string[]> {
    const db = this.db;
    const qb = db.createQueryBuilder(Gifdb);
    const data = await qb.select("actiontype").distinct().execute();
    return data.filter((row) => !!row.actiontype).map((row) => row.actiontype!);
  }
  async getGiftype(user: User): Promise<string> {
    const { repo } = this.userRepository;
    const data = await repo.findOne({ id: user.id });
    return data?.giftype ?? "anime";
  }

  async getGiftypes(): Promise<string[]> {
    const query = this.db.createQueryBuilder(Gifdb);
    const data = await query.select("giftype").distinct().execute();
    return data.filter((row) => !!row.giftype).map((row) => row.giftype!);
  }

  async getLang(guild: Guild): Promise<string> {
    const { repo } = this.settingsRepository;
    const data = await repo.findOne({ id: guild.id });
    return data?.language ?? "";
  }
  async getName(user: User): Promise<string> {
    const { repo } = this.userRepository;
    const data = await repo.findOne({ id: user.id });
    return data?.name ?? "";
  }
  async ensureGuildSettings(guild: Guild, lang: string) {
    const { repo, db } = this.settingsRepository;
    const existingSettings = await repo.findOne({
      id: guild.id,
    });
    if (existingSettings) return;
    const settings = repo.create({
      id: guild.id,
      language: lang,
    });
    await db.persistAndFlush(settings);
  }
  async newDSAChar(prefix: string, displayname: string, avatar: string) {
    const { repo, db } = this.dsaCharRepository;
    const char = repo.create({ prefix, avatar, displayname });
    await db.persistAndFlush(char);
  }
  async newGif(url: string, actiontype: string, giftype: string) {
    const { repo, db } = this.gifRepository;
    const gif = repo.create({ url, actiontype, giftype });
    await db.persistAndFlush(gif);
  }
  async removeGif(url: string) {
    const { repo } = this.gifRepository;
    await repo.nativeDelete({ url });
  }
  async ensureUser(user: User) {
    const { repo, db } = this.userRepository;
    const existingUser = await repo.findOne({ id: user.id });
    if (existingUser) return;
    const userDBO = repo.create({
      id: user.id,
      giftype: "anime",
      color: "Random",
      name: user.username ?? "",
      pkEnabled: false,
    });
    await db.persistAndFlush(userDBO);
  }
  async setColor(user: User, color: string) {
    const { repo, db } = this.userRepository;
    const userDBO = await repo.findOne({ id: user.id });
    wrap(userDBO).assign({ color });
    await db.flush();
  }
  async setGiftype(user: User, giftype: string) {
    const { repo, db } = this.userRepository;
    const userDBO = await repo.findOne({ id: user.id });
    wrap(userDBO).assign({ giftype });
    await db.flush();
  }
  async setLang(guild: Guild, lang: string) {
    const { repo, db } = this.settingsRepository;
    const settings = await repo.findOneOrFail({
      id: guild.id,
    });
    logger.debug(`Setting language for ${guild.name} to ${lang}`);
    wrap(settings).assign({ language: lang }, { mergeObjects: true });
    await db.flush();
  }
  async setName(user: User, name: string) {
    const { repo, db } = this.userRepository;
    const userDBO = await repo.findOne({ id: user.id });
    wrap(userDBO).assign({ name });
    await db.flush();
  }

  async getPkEnabled(user: User): Promise<boolean> {
    const { repo } = this.userRepository;
    const data = await repo.findOne({ id: user.id });
    return data?.pkEnabled ?? false;
  }

  async setPkEnabled(user: User, pkEnabled: boolean) {
    const { repo, db } = this.userRepository;
    const userDBO = await repo.findOne({ id: user.id });
    wrap(userDBO).assign({ pkEnabled });
    await db.flush();
  }
}
