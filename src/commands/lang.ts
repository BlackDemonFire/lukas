import { Message } from "discord.js";
import type { language as lang } from "src/types";
import { Bot } from "../bot.js";
import { Command } from "../modules/command.js";

export default class Lang extends Command {
    constructor(client: Bot) {
        super(client);
    }
    run(client: Bot, message: Message, args: string[], language: lang) {
        let newLang: string;
        let languages: string = "";
        if (!message.guild) {
            message.channel.send(language.general.guildOnly);
            return;
        }
        if (!(message.member!.permissions.has("ADMINISTRATOR") || this.isOwner(message))) {
            message.channel.send({ content: language.command.lang.permissionError });
            return;
        }
        if (!args || args == []) {
            newLang = "";
        } else {
            newLang = args.join(" ");
        }
        if (!client.languages.has(newLang)) {
            const langs = Array.from(client.languages.keys());
            switch (langs.length) {
                case 1:
                    languages = langs[0];
                    break;
                case 2:
                    languages = langs.join(` ${language.general.and} `);
                    break;
                default:
                    break;
            }
            message.channel.send({ content: language.command.lang.noSuchLanguage.replace("{languages}", languages) });
            return;
        }
        client.db.setLang(message.guild, newLang);
        message.channel.send({ content: language.command.lang.success.replace("{lang}", newLang) });
    }
    help = {
        show: true,
        name: "lang",
        usage: `${this.prefix}lang <lang>`,
        category: "Settings",
    }
}