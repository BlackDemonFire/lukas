import {
  ActionRowBuilder,
  ButtonBuilder,
  GuildChannel,
  Message,
  MessageReaction,
  ReactionCollector,
  Snowflake,
  Team,
  User,
} from "discord.js";
import type { ILanguage as lang } from "src/types";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import logger from "../../modules/logger.js";

export default class Newgif extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  async run(client: Bot, message: Message, args: string[], language: lang) {
    if (!args || args.length !== 3) {
      message.channel.send(language.command.newgif.wrongArgs);
      return;
    }
    const url: string = args[0];
    const action: string = args[1].toLowerCase();
    let type: string = args[2].toLowerCase();
    if (!type || type == "") type = "anime";
    if (this.isOwner(message)) {
      client.db.newgif(url, action, type);
      message.channel.send(language.command.newgif.success);
      return;
    }
    const response: string = language.command.newgif.checking;
    const owner: Team | User = client.application!.owner!;
    let admins: User[];
    if (owner instanceof Team) {
      admins = owner.members.map((tmember) => tmember.user);
    } else {
      admins = [owner];
    }
    for (const admin of admins) {
      admin.send({
        content: `Gif check request from ${message.author.tag} in <#${
          message.channel.id
        }> (${
          message.channel instanceof GuildChannel ? message.channel.name : "DM"
        })\ngif: ${url}\naction: ${action}\ntype: ${type}`,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder().setEmoji("✅").setCustomId("newgif.accept"),
            new ButtonBuilder().setEmoji("❌").setCustomId("newgif.reject"),
          ]),
        ],
      });
    }

    message.channel.send({ content: response });
  }
  help = {
    show: true,
    usage: `${this.prefix}newgif <url> <command> [type (defaults to anime)]`,
  };
}
