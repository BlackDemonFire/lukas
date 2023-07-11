import { Client, Collection, Intents, Snowflake } from "discord.js";
import { DB } from "./db.js";
import { Command } from "./modules/command.js";
import { FakeRandom, Random } from "./modules/random.js";
import type { language } from "./types";

export class Bot extends Client {
  constructor() {
    super({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGES,
      ],
    });
  }
  commands: Collection<string, Command> = new Collection();
  commandusage: Map<Snowflake, Array<number>> = new Map();
  db: DB = new DB();
  languages: Map<string, language> = new Map();
  random: Random | FakeRandom = process.env.RANDOMKEY
    ? new Random(process.env.RANDOMKEY)
    : new FakeRandom();
}
