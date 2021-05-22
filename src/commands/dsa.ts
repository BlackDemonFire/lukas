import { Bot } from "bot";
import { DMChannel, Message, TextChannel, Webhook } from "discord.js";
import { Command } from "../modules/command";
export default class Dsa extends Command {
    constructor(client: Bot) {
        super(client);
    }
    help = {
        show: true,
        name: "dsa",
        usage: `${this.prefix}dsa [character] <message>`,
        category: "dsa"
    }
    run(client: Bot, message: Message, args: string[], language: language) {
        if (message.channel instanceof DMChannel) return message.channel.send(language.general.guildOnly);
        if (!message.channel.permissionsFor(message.guild.me).has(["MANAGE_MESSAGES", "MANAGE_WEBHOOKS"])) return message.channel.send(language.command.dsa.permissions);
        if (args && args[0]) {
            if (!args[0].startsWith("$")) {
                var sl = true;
            } else {
                var sl = false;
            }
        } else {
            if (message.attachments.size > 1) {
                var sl = true;
            } else {
                message.delete();
                message.author.send(language.command.dsa.contentRequired);
            }
        }
        var clean = args[0].slice().toLowerCase();
        console.log(clean);
        var count = 0;
        var npc: string = "";
        var displayName: string;
        var displayImg: string;
        while (args[0].indexOf("$") == 0) {
            npc = npc + args.shift();
            count = count + 1;
        }
        var char = client.db.getDSAChar(clean);
        if (char) {
            displayName = char.displayname;
            displayImg = char.avatar;
        } else {
            var i = 0
            while (i < count) {
                var npc = npc.replace("$", " ");
                i = i + 1;
            }
            displayName = npc.substr(1);
        }
        if (sl) {
            displayName = language.command.dsa.gameMaster;
            displayImg = "https://cdn.discordapp.com/icons/790938544293019649/d0843b10f5e7dabd10ebbea93acfca28.webp";
        }
        if (message.channel instanceof TextChannel) message.channel.createWebhook(displayName, { avatar: displayImg }).then(async (npc: Webhook) => {
            if (message.attachments.size == 0) {
                await npc.send(args.join(" "));
                npc.delete();
                message.delete();
            } else {
                let attarr = [];
                message.attachments.forEach(a => { attarr.push(a.url) });
                await npc.send(args.join(" "), { files: attarr });
                npc.delete();
                message.delete();
            }
        })
    }
}
