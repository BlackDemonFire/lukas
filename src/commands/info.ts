import { EmbedBuilder, Message } from "discord.js";
import { freemem, hostname, uptime as sUptime, totalmem } from "os";
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
    const humanReadableFreemem = Math.round(freemem() / 1024 / 1024);
    const humanReadableTotalmem = Math.round(totalmem() / 1024 / 1024);
    const memPercent = Math.round((10000 * freemem()) / totalmem()) / 100;
    const embed: EmbedBuilder = new EmbedBuilder()
      .setTitle("Info")
      .addFields(
        { name: "Host", value: hostname() },
        {
          name: "RAM",
          value: `${humanReadableFreemem} MB/${humanReadableTotalmem} MB (${memPercent}%)`,
        },
        { name: "CPU", value: `${cpuData.manufacturer} ${cpuData.brand}` },
        {
          name: "Bot Uptime",
          value: new Date(1000 * pUptime()).toISOString().substr(11, 8),
        },
        {
          name: "System Uptime",
          value: new Date(1000 * sUptime()).toISOString().substr(11, 8),
        },
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
