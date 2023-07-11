import { Message, MessageEmbed } from "discord.js";
import type { language as lang } from "src/types";
import { Bot } from "../bot.js";
import { Command } from "../modules/command.js";

export default class Help extends Command {
  constructor(client: Bot) {
    super(client);
  }
  help = {
    show: true,
    name: "help",
    usage: `${this.prefix}help [command]`,
    category: "Utility",
  };
  run(client: Bot, message: Message, args: string[], language: lang) {
    const embed = new MessageEmbed();
    if (args && args[0]) {
      const prefix = process.env.PREFIX || "^";
      const cmd = args[0].replace(prefix, "").toLowerCase();
      const command = client.commands.get(cmd);
      if (command) {
        const langcmds = language.command;

        const desc: string = langcmds[cmd as keyof lang["command"]].description;
        embed
          .setDescription(desc)
          .setFooter(command.help.category)
          .setTitle(command.help.name)
          .setAuthor({ name: "Help" })
          .addField(language.command.help.usage.Usage, command.help.usage)
          .addField(
            language.command.help.usage.Usage,
            language.command.help.usage.args,
          );
      } else {
        embed.setDescription(
          language.command.help.commandNotFound.replace("{cmd}", args[0]),
        );
      }
    } else {
      const categories: { [key: string]: string[] } = {};
      client.commands.map((cmd) => {
        if (!cmd.help.show) return;
        const category: string = cmd.help.category;
        if (!categories[category]) {
          categories[category] = [cmd.help.name];
        } else {
          categories[cmd.help.category].push(cmd.help.name);
        }
      });
      for (const category in categories) {
        embed.addField(category, categories[category].join(", "));
      }
      embed.setTitle("Help");
    }
    message.channel.send({ embeds: [embed] });
  }
}
