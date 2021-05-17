import { Bot } from "bot";
import { Message } from "discord.js";

function cmd(client: Bot, message: Message) {
    let args = message.content.slice(client.config["prefix"].length).trim().split(" ")
    const cmd = args.shift().toLowerCase();
    const command = client.commands.get(cmd);
    if (!command) return;
    if (!client.commandusage.has(message.author.id)) client.commandusage.set(message.author.id, [])
    if (cmd == "ping") {
        var commandusage = client.commandusage.get(message.author.id)
        commandusage.push(message.createdTimestamp)
        client.commandusage.set(message.author.id, commandusage)
    } else {
        client.commandusage.set(message.author.id, [])
    }
    var language: language
    if (message.guild) {
        language = client.languages.get(client.db.getLang(message.guild));
    } else {
        language = client.languages.get(client.config.defaultLanguage);
    }
    command.run(client, message, args, language)
}


export function event(client: Bot, message: Message) {
    if (message.author.bot) return;
    if (message.guild) client.db.initLang(message.guild, client.config.defaultLanguage);
    client.db.newuser(message.author);
    if (message.content.startsWith(client.config.prefix)) return cmd(client, message);
}
