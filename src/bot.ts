import { Client, ClientApplication, ClientOptions, Collection, Snowflake } from "discord.js";
import { DB } from "./db";
import { Logger } from './modules/logger';
import { FakeRandom, Random } from "./modules/random";
import { Command } from "./modules/command";

export class Bot extends Client {
    constructor(opts?: ClientOptions) {
        super(opts);
    }
    application: ClientApplication
    commands: Collection<string, Command> = new Collection();
    commandusage: Map<Snowflake, Array<number>> = new Map();
    config: config = require("../config.json");
    db: DB = new DB();
    languages: Map<string, language> = new Map();
    logger = new Logger(this.config["logging"]);
    random: Random | FakeRandom = this.config.randomAPIKey ? new Random(this.config.randomAPIKey) : new FakeRandom();
}