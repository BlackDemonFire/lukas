import { Collection, DMChannel, Message, MessageCollector, Snowflake, TextChannel } from "discord.js";
import type { language as lang } from "src/types";
import { Bot } from "../bot.js";
import { Command } from "../modules/command.js";

export default class New extends Command {
    constructor(client: Bot) {
        super(client);
    }
    help = {
        show: true,
        name: "new",
        usage: `${this.prefix}new`,
        category: "dsa",
    }
    run(client: Bot, message: Message, _args: string[], language: lang) {
        let i = 0;
        let collector: MessageCollector;
        let av: string;
        let pref: string;
        message.channel.send({ content: language.command.new.getPrefix });
        if (message.channel instanceof DMChannel || message.channel instanceof TextChannel) {
            collector = new MessageCollector(message.channel, { filter: (m: Message) => m.author.id === message.author.id, time: 50000 });
            collector.on("end", (msgs: Collection<Snowflake, Message>) => {
                if (msgs.size == 0) {
                    message.channel.send({ content: language.general.timeout });
                    return;
                }
            });
            collector.on("collect", (msg: Message) => {
                if (i > 2) {
                    collector.stop();
                } else {
                    i = i + 1;
                }
                switch (i) {
                    case 1:
                        pref = msg.content.toLowerCase().split(" ")[0];
                        msg.channel.send({ content: language.command.new.getAvatar });
                        if (!pref.startsWith("$")) pref = `$${pref}`;
                        break;
                    case 2:
                        if (msg.content === "n") {
                            av = "";
                        } else {
                            av = msg.content;
                        }
                        msg.channel.send({ content: language.command.new.getName });
                        break;
                    case 3:
                        {
                            const name = msg.content;
                            collector.stop();
                            msg.channel.send({ content: language.command.new.success.replace("{name}", name).replace("{pref}", pref) });
                            client.db.newDSAChar(pref, name, av);
                        }
                        break;
                }
            });
        }
    }
}