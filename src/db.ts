import { EntityManager, MikroORM } from "@mikro-orm/postgresql";
import { type Guild, type User } from "discord.js";
import { Dsachars } from "./entities/Dsachars.js";
import { Gifdb } from "./entities/Gifdb.js";
import { Settings } from "./entities/Settings.js";
import { Userdb } from "./entities/Userdb.js";
import mikroOrmConfig from "./mikro-orm.config.js";
import logger from "./modules/logger.js";

export class DB {
  protected _db?: EntityManager;
  constructor() {
    void MikroORM.init(mikroOrmConfig).then((orm) => {
      this._db = orm.em;
      orm
        .getMigrator()
        .up()
        .catch((e) => {
          logger.error("Migration failed");
          logger.error(e);
          process.exit(1);
        });
    });
  }
  protected get db(): EntityManager {
    if (!this._db) throw new Error("Database not initialized");
    return this._db.fork();
  }
  protected get gifRepository() {
    return this.db.getRepository(Gifdb);
  }
  protected get dsaCharRepository() {
    return this.db.getRepository(Dsachars);
  }
  protected get userRepository() {
    return this.db.getRepository(Userdb);
  }
  protected get settingsRepository() {
    return this.db.getRepository(Settings);
  }

  async deleteDSAChar(prefix: string) {
    await this.dsaCharRepository.nativeDelete({ prefix });
  }

  async getColor(user: User): Promise<string> {
    const data = await this.userRepository.findOne(
      { id: user.id },
      { fields: ["color"] },
    );
    return data?.color ?? "Random";
  }
  async getDSAChar(prefix: string): Promise<Dsachars | null> {
    const data = await this.dsaCharRepository.findOne({ prefix });
    return data;
  }
  async getGif(actiontype: string, giftype: string): Promise<string> {
    const totalCount = await this.gifRepository.count({ actiontype, giftype });
    const data = await this.gifRepository.findOne(
      { giftype, actiontype },
      { offset: Math.floor(Math.random() * totalCount) },
    );
    return data?.url ?? "";
  }
  async getGifactions(): Promise<string[]> {
    const qb = this.db.createQueryBuilder(Gifdb);
    const data = await qb.select("actiontype").distinct().execute();
    return data.filter((row) => !!row.actiontype).map((row) => row.actiontype!);
  }
  async getGiftype(user: User): Promise<string> {
    const data = await this.userRepository.findOne({ id: user.id });
    return data?.giftype ?? "anime";
  }
  async getLang(guild: Guild): Promise<string> {
    const data = await this.settingsRepository.findOne({ id: guild.id });
    return data?.language ?? "";
  }
  async getName(user: User): Promise<string> {
    const data = await this.userRepository.findOne({ id: user.id });
    return data?.name ?? "";
  }
  async initLang(guild: Guild, lang: string) {
    this.settingsRepository.create(
      { id: guild.id, language: lang },
      { persist: true },
    );
    await this.db.flush();
  }
  async newDSAChar(prefix: string, displayname: string, avatar: string) {
    this.dsaCharRepository.create(
      { prefix, avatar, displayname },
      { persist: true },
    );
    await this.db.flush();
  }
  async newGif(url: string, actiontype: string, giftype: string) {
    this.gifRepository.create({ url, actiontype, giftype });
    await this.db.flush();
  }
  async removeGif(url: string) {
    await this.gifRepository.nativeDelete({ url });
  }
  async newUser(user: User) {
    this.userRepository.create(
      {
        id: user.id,
        giftype: "anime",
        color: "Random",
        name: user.username ?? "",
      },
      { persist: true },
    );
    await this.db.flush();
  }
  async setColor(user: User, color: string) {
    const ref = this.db.getReference(Userdb, user.id);
    ref.color = color;
    await this.db.flush();
  }
  async setGiftype(user: User, giftype: string) {
    const ref = this.db.getReference(Userdb, user.id);
    ref.giftype = giftype;
    await this.db.flush();
  }
  async setLang(guild: Guild, lang: string) {
    const ref = this.db.getReference(Settings, guild.id);
    ref.language = lang;
    await this.db.flush();
  }
  async setName(user: User, name: string) {
    const ref = this.db.getReference(Userdb, user.id);
    ref.name = name;
    await this.db.flush();
  }
}
