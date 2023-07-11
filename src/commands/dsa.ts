import {
  BaseGuildTextChannel,
  Message,
  TextChannel,
  Webhook,
} from "discord.js";
import type { language as lang } from "src/types";
import { Bot } from "../bot.js";
import { Command } from "../modules/command.js";

export default class Dsa extends Command {
  constructor(client: Bot) {
    super(client);
  }
  help = {
    show: true,
    name: "dsa",
    usage: `${this.prefix}dsa [character] <message>`,
    category: "dsa",
  };
  async run(client: Bot, message: Message, args: string[], language: lang) {
    if (!(message.channel instanceof BaseGuildTextChannel)) {
      message.channel.send(language.general.guildOnly);
      return;
    }
    if (
      !message.guild?.me
        ?.permissionsIn(message.channel)
        .has(["MANAGE_MESSAGES", "MANAGE_WEBHOOKS"])
    ) {
      message.channel.send(language.command.dsa.permissions);
      return;
    }
    let sl: boolean = true;
    if (args && args[0]) {
      sl = !args[0].startsWith("$");
    } else if (message.attachments.size > 1) {
      sl = true;
    } else {
      message.delete();
      message.author.send(language.command.dsa.contentRequired);
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
      displayName = char.displayname;
      displayImg = char.avatar;
    } else {
      let i = 0;
      while (i < count) {
        npc = npc.replace("$", " ");
        i = i + 1;
      }
      displayName = npc.substr(1);
    }
    if (sl) {
      displayName = language.command.dsa.gameMaster;
      displayImg =
        "https://cdn.discordapp.com/icons/790938544293019649/d0843b10f5e7dabd10ebbea93acfca28.webp";
    }
    if (message.channel instanceof TextChannel) {
      message.channel
        .createWebhook(displayName, { avatar: displayImg })
        .then(async (webhook: Webhook) => {
          if (message.attachments.size == 0) {
            await webhook.send({ content: args.join(" ") });
            webhook.delete();
            message.delete();
          } else {
            const attarr: string[] = [];
            message.attachments.forEach((a) => {
              attarr.push(a.url);
            });
            await webhook.send({ content: args.join(" "), files: attarr });
            webhook.delete();
            message.delete();
          }
        });
    }
  }
}
