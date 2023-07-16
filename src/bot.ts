import {
  BaseInteraction,
  Client,
  Collection,
  IntentsBitField,
  Snowflake,
} from "discord.js";
import { DB } from "./db.js";
import { Command } from "./modules/command.js";
import { FakeRandom, Random } from "./modules/random.js";
import type { ILanguage } from "./types";
import settings from "./modules/settings.js";

export class Bot extends Client {
  constructor() {
    super({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.MessageContent,
      ],
    });
  }
  prefix: string = settings.PREFIX;
  commands: Collection<string, Command> = new Collection();
  interactions: Collection<
    string,
    (client: Bot, interaction: BaseInteraction, args: string[]) => void
  > = new Collection();
  commandusage: Map<Snowflake, Array<number>> = new Map();
  db: DB = new DB();
  languages: Map<string, ILanguage> = new Map();
  random: Random | FakeRandom = settings.RANDOMKEY
    ? new Random(settings.RANDOMKEY!)
    : new FakeRandom();

  loadedEvents: string[] = [];
  loadedAll: boolean = false;
  executedReady: boolean = false;
}
