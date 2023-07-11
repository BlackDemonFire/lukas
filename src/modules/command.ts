import { ClientApplication, Message, Team, User } from "discord.js";
import type { command, language as lang, nil } from "src/types";
import { Bot } from "../bot.js";
import logger from "./logger.js";

abstract class Command {
  protected prefix: string;
  abstract help: command["help"];
  private client: Bot;
  constructor(client: Bot) {
    this.prefix = process.env.PREFIX || "^";
    this.client = client;
  }
  // eslint-disable-next-line no-unused-vars
  abstract run(
    client: Bot,
    message: Message,
    args: string[],
    language: lang,
  ): void | Promise<void>;
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
  constructor(client: Bot) {
    super(client);
  }
  async parseUser(
    client: Bot,
    message: Message,
    args: string[],
    language: lang,
  ) {
    let userB: string = "";
    const mentioned: string[] = [];
    let self: boolean = false;
    if (args && args.length > 0) {
      for (const arg of args) {
        let name: string = "";
        const ping = arg.match(/<@!?(\d+)>/);
        if (ping) {
          let user: User | nil;
          user = await client.users.fetch(ping[1]).catch((e) => {
            logger.error(e);
            user = null;
          });
          if (user) name = await client.db.getname(user);
          if (!user) {
            name = arg;
          } else if (!name || name == "") {
            const member = message.guild
              ? message.guild.members.resolve(user)
              : null;
            name = member ? member.displayName : user.username;
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
        switch (mentioned.length) {
          case 1:
            userB = mentioned[0];
            break;
          case 2:
            userB = mentioned.join(` ${language.general.and} `);
            break;
          default:
            {
              const last = mentioned.pop();
              userB = mentioned.join(", ");
              userB += ` ${language.general.and} `;
              userB += last;
            }
            break;
        }
      }
    } else {
      userB = "";
    }
    if (userB.length > 1792) userB = userB.substring(0, 1792) + "...";
    return userB;
  }
}

export { Command, GifCommand };
