import { Bot } from "bot";
import { Message } from "discord.js";
import { Command } from "../modules/command";

export default class Lang extends Command {
    constructor(client: Bot) {
        super(client);
    }
    run(client: Bot, message: Message, args: string[], language: language) {
        let lang: string;
        var languages: string;
        if (!message.guild) return message.channel.send(language.general.guildOnly);
        if (!(message.member.permissions.has("ADMINISTRATOR") || this.isOwner(message))) return message.channel.send(language.command.lang.permissionError);
        if (!args || args == []) {
            lang = "";
        } else {
            lang = args.join(" ");
        }
        if (!client.languages.has(lang)) {
            var langs = Array.from(client.languages.keys());
            switch (langs.length) {
                case 1:
                    languages = langs[0]
                    break;
                case 2:
                    languages = langs.join(` ${language.general.and} `)
                default:
                    break;
            }
            return message.channel.send(language.command.lang.noSuchLanguage.replace("{languages}", languages));
        }
        client.db.setLang(message.guild, lang);
        message.channel.send(language.command.lang.success.replace("{lang}", lang))
    }
    help = {
        show: true,
        name: "lang",
        usage: `${this.prefix}lang <lang>`,
        category: "Settings"
    }
}