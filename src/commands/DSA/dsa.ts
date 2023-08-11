import {
  BaseGuildTextChannel,
  Message,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import type { ILanguage as lang } from "../../types.js";

export default class Dsa extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  help = {
    show: true,
    usage: `${this.prefix}dsa [character] <message>`,
  };
  async run(client: Bot, message: Message, args: string[], language: lang) {
    if (!(message.channel instanceof BaseGuildTextChannel)) {
      await message.channel.send(language.general.guildOnly);
      return;
    }
    if (
      !message.guild?.members.me
        ?.permissionsIn(message.channel)
        .has([
          PermissionFlagsBits.ManageMessages,
          PermissionFlagsBits.ManageWebhooks,
        ])
    ) {
      await message.channel.send(language.command.dsa.permissions);
      return;
    }
    let sl: boolean = true;
    if (args && args[0]) {
      sl = !args[0].startsWith("$");
    } else if (message.attachments.size > 1) {
      sl = true;
    } else {
      await message.delete();
      await message.author.send({
        content: language.command.dsa.contentRequired,
      });
    }
    const clean = args[0].slice().toLowerCase();
    let count = 0;
    let npc: string = "";
    let displayName: string;
    let displayImg: string | undefined = undefined;
    while (args[0].indexOf("$") == 0) {
      npc = npc + args.shift();
      count = count + 1;
    }
    const char = await client.db.getDSAChar(clean);
    if (char) {
      displayName = char.displayname ?? "unknown";
      displayImg = char.avatar;
    } else {
      let i = 0;
      while (i < count) {
        npc = npc.replace("$", " ");
        i = i + 1;
      }
      displayName = npc.substring(1);
    }
    if (sl) {
      displayName = language.command.dsa.gameMaster;
      displayImg =
        "https://cdn.discordapp.com/icons/790938544293019649/d0843b10f5e7dabd10ebbea93acfca28.webp";
    }
    if (message.channel instanceof TextChannel) {
      const webhook = await message.channel.createWebhook({
        name: displayName,
        avatar: displayImg,
      });
      if (message.attachments.size == 0) {
        await webhook.send({ content: args.join(" ") });
      } else {
        const attarr: string[] = [];
        message.attachments.forEach((a) => {
          attarr.push(a.url);
        });
        await webhook.send({ content: args.join(" "), files: attarr });
      }
      await webhook.delete();
      await message.delete();
    }
  }
}
