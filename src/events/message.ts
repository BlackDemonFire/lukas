import { Message } from "discord.js";
import { Bot } from "../bot.js";
import type { language as lang } from "../types";

async function cmd(client: Bot, message: Message) {
    const prefix: string = process.env.PREFIX || "^";
    const args = message.content.slice(prefix.length).trim().split(" ");
    let commandname = args.shift();
    if (commandname) commandname = commandname.toLowerCase();
    if (!commandname) commandname = "";
    const command = client.commands.get(commandname);
    if (!command) return;
    if (!client.commandusage.has(message.author.id)) client.commandusage.set(message.author.id, []);
    if (commandname == "ping") {
        const commandusage = client.commandusage.get(message.author.id)!;
        commandusage.push(message.createdTimestamp);
        client.commandusage.set(message.author.id, commandusage);
    } else {
        client.commandusage.set(message.author.id, []);
    }
    let language: lang;
    if (message.guild) {
        language = client.languages.get(await client.db.getLang(message.guild))!;
    } else {
        language = client.languages.get(process.env.DEFAULTLANG!)!;
    }
    command.run(client, message, args, language);
}


export async function event(client: Bot, message: Message) {
    if (message.author.bot) return;
    if (message.guild) client.db.initLang(message.guild, process.env.DEFAULTLANG!);
    client.db.newuser(message.author);
    if (message.content.startsWith(process.env.PREFIX!)) return await cmd(client, message);
}
