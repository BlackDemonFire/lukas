import { Bot } from "bot"
import { Collection, DMChannel, Message, MessageCollector, Snowflake, TextChannel } from "discord.js"
import { Command } from "../modules/command";

export default class New extends Command {
    constructor(client: Bot) {
        super(client)
    }
    help = {
        show: true,
        name: "new",
        usage: `${this.prefix}new`,
        category: "dsa"
    }
    run(client: Bot, message: Message, args: string[], language: language) {
        var i = 0;
        var collector: MessageCollector;
        var av: string;
        var pref: string;
        message.channel.send(language.command.new.getPrefix);
        if (message.channel instanceof DMChannel || message.channel instanceof TextChannel) {
            collector = new MessageCollector(message.channel, (m: Message) => m.author.id === message.author.id, { time: 50000 });
            collector.on("end", (msgs: Collection<Snowflake, Message>) => { if (msgs.size == 0) return message.channel.send(language.general.timeout) });
            collector.on("collect", (msg: Message) => {
                if (i > 2) {
                    collector.stop();
                } else {
                    i = i + 1;
                }
                switch (i) {
                    case 1:
                        pref = msg.content.toLowerCase().split(' ')[0];
                        msg.channel.send(language.command.new.getAvatar);
                        if (!pref.startsWith("$")) pref = "$" + pref;
                        console.log(pref);
                        break;
                    case 2:
                        if (msg.content === 'n') {
                            av = '';
                        } else {
                            av = msg.content;
                        }
                        console.log("av", av);
                        msg.channel.send(language.command.new.getName);
                        break;
                    case 3:
                        var name = msg.content;
                        collector.stop();
                        msg.channel.send(language.command.new.success.replace("{name}", name).replace("{pref}", pref))
                        client.db.newDSAChar(pref, name, av);
                        break;
                }
            })
        }
    }
}