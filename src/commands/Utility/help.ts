import { EmbedBuilder, Message } from "discord.js";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import type { ILanguage as lang } from "../../types.js";

export default class Help extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  help = {
    show: true,
    usage: `${this.prefix}help [command]`,
  };
  run(client: Bot, message: Message, args: string[], language: lang) {
    const embed = new EmbedBuilder();
    if (args && args[0]) {
      const cmd = args[0].replace(client.prefix, "").toLowerCase();
      const command = client.commands.get(cmd);
      if (command) {
        const langcmds = language.command;

        const desc: string = langcmds[cmd as keyof lang["command"]].description;
        embed
          .setDescription(desc)
          .setFooter({ text: command.category })
          .setTitle(command.name)
          .setAuthor({ name: "Help" })
          .addFields(
            {
              name: language.command.help.usage.Usage,
              value: command.help.usage,
            },
            {
              name: language.command.help.usage.Usage,
              value: language.command.help.usage.args,
            },
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
        const category: string = cmd.category;
        if (!categories[category]) {
          categories[category] = [cmd.name];
        } else {
          categories[cmd.category].push(cmd.name);
        }
      });
      for (const category in categories) {
        embed.addFields({
          name: category,
          value: categories[category].join(", "),
        });
      }
      embed.setTitle("Help");
    }
    message.channel.send({ embeds: [embed] });
  }
}
