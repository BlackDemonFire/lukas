import { Bot } from "bot";
import { Message, MessageEmbed } from "discord.js";
import { Command } from "../modules/command";

export default class help extends Command {
    constructor(client: Bot) {
        super(client);
    }
    help = {
        show: true,
        name: "help",
        usage: `${this.prefix}help [command]`,
        category: "Utility"
    }
    run(client: Bot, message: Message, args: string[], language: language) {
        const embed = new MessageEmbed();
        if (args && args[0]) {
            var cmd = args[0];
            if (cmd.startsWith(client.config.prefix)) cmd = cmd.slice(client.config.prefix.length).toLowerCase();
            var command = client.commands.get(cmd);
            if (command) {
                embed.setDescription(language[cmd].description)
                    .setFooter(command.help.category)
                    .setTitle(command.help.name)
                    .setAuthor("Help")
                    .addField(language.command.help.usage.Usage, command.help.usage)
                    .addField(language.command.help.usage.Usage, language.command.help.usage.args);
            } else {
                embed.setDescription(language.command.help.commandNotFound.replace("{cmd}", args[0]));
            }
        } else {
            var categories = [];
            client.commands.map((cmd, _name) => {
                if (!cmd.help.show) return;
                if (!categories[cmd.help.category]) {
                    categories[cmd.help.category] = [cmd.help.name];
                } else {
                    categories[cmd.help.category].push(cmd.help.name);
                }
            })
            for (const category in categories) {
                embed.addField(category, categories[category].join(", "));
            }
            embed.setTitle("Help");
        }
        message.channel.send(embed);
    }
}