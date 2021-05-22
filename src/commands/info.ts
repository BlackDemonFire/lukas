import { Bot } from "bot";
import { Message, MessageEmbed } from "discord.js";
import { Command } from "../modules/command";
import { freemem, hostname, totalmem, uptime as sUptime } from "os";
import { uptime as pUptime } from "process";
import { cpu } from "systeminformation";

export default class Info extends Command {
    constructor(client: Bot) {
        super(client);
    }
    async run(client: Bot, message: Message, args: string[], language: language) {
        let cpuData = await cpu();
        const embed: MessageEmbed = new MessageEmbed()
            .setTitle("Info")
            .addField("Host", hostname())
            .addField("RAM", `${Math.round(freemem() / 1024 / 1024)} MB/${Math.round(totalmem() / 1024 / 1024)} MB (${Math.round(10000 * freemem() / totalmem()) / 100}%)`)
            .addField("CPU", `${cpuData.manufacturer} ${cpuData.brand}`)
            .addField("Bot Uptime", new Date(1000 * pUptime()).toISOString().substr(11, 8))
            .addField("System Uptime", new Date(1000 * sUptime()).toISOString().substr(11, 8))
            .setColor(0xaa7777);
        message.channel.send(embed);
    }
    help = {
        show: true,
        name: "info",
        usage: `${this.prefix}info`,
        category: "Utility"
    }

}
