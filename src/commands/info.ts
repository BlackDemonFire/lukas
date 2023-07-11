import { Message, MessageEmbed } from "discord.js";
import { freemem, hostname, totalmem, uptime as sUptime } from "os";
import { uptime as pUptime } from "process";
import { cpu } from "systeminformation";
import { Bot } from "../bot.js";
import { Command } from "../modules/command.js";

export default class Info extends Command {
  constructor(client: Bot) {
    super(client);
  }
  async run(_client: Bot, message: Message) {
    const cpuData = await cpu();
    const embed: MessageEmbed = new MessageEmbed()
      .setTitle("Info")
      .addField("Host", hostname())
      .addField(
        "RAM",
        `${Math.round(freemem() / 1024 / 1024)} MB/${Math.round(
          totalmem() / 1024 / 1024,
        )} MB (${Math.round((10000 * freemem()) / totalmem()) / 100}%)`,
      )
      .addField("CPU", `${cpuData.manufacturer} ${cpuData.brand}`)
      .addField(
        "Bot Uptime",
        new Date(1000 * pUptime()).toISOString().substr(11, 8),
      )
      .addField(
        "System Uptime",
        new Date(1000 * sUptime()).toISOString().substr(11, 8),
      )
      .setColor(0xaa7777);
    message.channel.send({ embeds: [embed] });
  }
  help = {
    show: true,
    name: "info",
    usage: `${this.prefix}info`,
    category: "Utility",
  };
}
