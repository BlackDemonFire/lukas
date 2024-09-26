import {
  type ClientApplication,
  type ColorResolvable,
  Colors,
  EmbedBuilder,
  type Message,
  Team,
  User,
} from "discord.js";
import { and, eq } from "drizzle-orm";
import { Bot } from "../bot.js";
import { gifdb } from "../db/gifdb.js";
import { userdb } from "../db/userdb.js";
import { db } from "../drizzle.js";
import type { command, ILanguage } from "../types.js";
import logger from "./logger.js";

abstract class Command implements command {
  protected prefix: string;
  abstract help: command["help"];
  private client: Bot;
  public readonly category: string;
  public readonly name: string;
  protected constructor(client: Bot, category: string, name: string) {
    this.prefix = client.prefix;
    this.client = client;
    this.category = category;
    this.name = name;
  }
  abstract run(
    client: Bot,
    message: Message,
    args: string[],
    language: ILanguage,
  ): Promise<void>;
  isAprilFools() {
    const date = new Date();
    const myDate = date.toLocaleDateString();
    const datesplit: string[] = myDate.split("/");
    const mon = datesplit.shift();
    const dom = datesplit.shift();
    return dom == "1" && mon == "4";
  }
  isOwner(message: Message): boolean {
    const apk: ClientApplication = this.client.application!;
    if (apk.owner instanceof Team) {
      return apk.owner.members.has(message.author.id);
    } else if (apk.owner instanceof User) {
      return apk.owner.id == message.author.id;
    }
    return false;
  }
}

abstract class GifCommand extends Command {
  protected constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  async parseUser(client: Bot, message: Message, args: string[]) {
    let userB: string = "";
    const mentioned: string[] = [];
    let self: boolean = false;
    if (args && args.length > 0) {
      for (const arg of args) {
        let name: string | null = null;
        const ping = arg.match(/<@!?(\d+)>/);
        if (ping) {
          const user = await client.users.fetch(ping[1]).catch((e) => {
            logger.error(e);
            return null;
          });
          if (user) {
            const [dbUser] = await db
              .select({ name: userdb.name })
              .from(userdb)
              .where(eq(userdb.id, user.id));
            if (dbUser) name = dbUser.name;
          }
          if (!user) {
            name = arg;
          } else if (!name || name == "") {
            const member = message.inGuild()
              ? message.guild.members.resolve(user)
              : null;
            name = member ? member.displayName : user.displayName;
          }
          if (user == message.author) {
            userB = "";
            self = true;
          }
          mentioned.push(name);
        } else if (arg && arg !== "") {
          mentioned.push(arg);
        }
      }
      if (userB == "" && !self) {
        const lf = new Intl.ListFormat("en"); // TODO: get locale from message
        userB = lf.format(mentioned);
      }
    }
    if (userB.length > 1792) userB = userB.substring(0, 1792) + "...";
    return userB;
  }

  protected getGifLanguageObject(language: ILanguage, attr: string) {
    type CommandKey = keyof typeof language.command;
    const commandName = this.name as CommandKey;

    const langCommand = language.command[commandName];

    type AttrKey = keyof typeof langCommand;
    const attrName = attr as AttrKey;
    // Unknown cast is necessary, as technically the result could be a `string` which cannot be cast directly to a `string[]`
    return langCommand[attrName] as unknown as string[];
  }

  protected async buildAndSendEmbed(
    gif: string,
    responseString: string,
    color: ColorResolvable,
    message: Message,
  ) {
    if (!message.channel.isSendable()) {
      throw new Error(`channel ${message.channel.id} is not sendable`);
    }
    const embed = new EmbedBuilder()
      .setImage(gif)
      .setAuthor({ name: this.name })
      .setDescription(responseString)
      .setColor(color);
    await message.channel.send({ embeds: [embed] });
  }

  protected async getColor(client: Bot, author: User) {
    const [user] = await db
      .select()
      .from(userdb)
      .where(eq(userdb.id, author.id));
    const rawColor = user?.color ?? "random";

    logger.debug(`available colors: ${rawColor.split(";")}`);
    return client.random.choice(rawColor.split(";"));
  }
}

abstract class SingleUserGifCommand extends GifCommand {
  protected constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }

  async run(
    client: Bot,
    message: Message,
    _args: string[],
    language: ILanguage,
  ) {
    const [user] = await db
      .select()
      .from(userdb)
      .where(eq(userdb.id, message.author.id));
    const filter = user?.giftype
      ? and(eq(gifdb.actiontype, this.name), eq(gifdb.giftype, user.giftype))
      : eq(gifdb.actiontype, this.name);
    const gifs = await db
      .select()
      .from(gifdb)
      .where(filter)
      .then((g) => g.map((g) => g.url));
    const gif = gifs[Math.floor(Math.random() * gifs.length)];
    let userA: string = user?.name ?? message.author.displayName;
    const rawColor = await this.getColor(client, message.author);
    let color: ColorResolvable;
    if (rawColor in Colors) color = rawColor as keyof typeof Colors;
    else color = "Random";
    if (userA == "")
      userA =
        user?.name ?? message.member?.displayName ?? message.author.displayName;
    const responseString: string = (
      await client.random.choice(
        this.getGifLanguageObject(language, "singleUser"),
      )
    ).replace(/{a}/g, userA);
    await this.buildAndSendEmbed(gif, responseString, color, message);
  }
}

abstract class MultiUserGifCommand extends GifCommand {
  protected constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }

  async run(
    client: Bot,
    message: Message,
    args: string[],
    language: ILanguage,
  ) {
    const [user] = await db
      .select()
      .from(userdb)
      .where(eq(userdb.id, message.author.id));
    const filter = user?.giftype
      ? and(eq(gifdb.actiontype, this.name), eq(gifdb.giftype, user.giftype))
      : eq(gifdb.actiontype, this.name);
    const gifs = await db
      .select()
      .from(gifdb)
      .where(filter)
      .then((g) => g.map((g) => g.url));
    const gif = gifs[Math.floor(Math.random() * gifs.length)];
    const userA: string =
      user?.name ?? message.member?.displayName ?? message.author.displayName;
    const rawColor = await this.getColor(client, message.author);
    const color: ColorResolvable = rawColor as ColorResolvable;

    const userB: string = await super.parseUser(client, message, args);
    let responseString: string;
    if (userB == "") {
      responseString = (
        await client.random.choice(
          this.getGifLanguageObject(language, "singleUser"),
        )
      ).replace(/{a}/g, userA);
    } else {
      responseString = (
        await client.random.choice(
          this.getGifLanguageObject(language, "multiUser"),
        )
      )
        .replace(/{a}/g, userA)
        .replace(/{b}/g, userB);
    }
    await this.buildAndSendEmbed(gif, responseString, color, message);
  }
}

export { Command, GifCommand, MultiUserGifCommand, SingleUserGifCommand };
