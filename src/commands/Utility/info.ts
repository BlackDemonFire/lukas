import type { Bot } from "@/bot.js";
import { Command } from "@/modules/command.js";
import logger from "@/modules/logger.js";
import { EmbedBuilder, Message } from "discord.js";
import { freemem, hostname, uptime as sUptime, totalmem } from "node:os";
import { uptime as pUptime } from "node:process";
import { cpu } from "systeminformation";

export default class Info extends Command {
  readonly name = "info";
  constructor(client: Bot) {
    super(client, "Utility");
  }
  async run(_client: Bot, message: Message) {
    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    const cpuData = await cpu();
    const humanReadableFreemem = Math.round(freemem() / 1024 / 1024);
    const humanReadableTotalmem = Math.round(totalmem() / 1024 / 1024);
    const memPercent = Math.round((10000 * freemem()) / totalmem()) / 100;
    const embed: EmbedBuilder = new EmbedBuilder()
      .setTitle("Info")
      .addFields(
        { name: "Host", value: hostname() },
        { name: "RAM", value: `${humanReadableFreemem} MB/${humanReadableTotalmem} MB (${memPercent}%)` },
        { name: "CPU", value: `${cpuData.manufacturer} ${cpuData.brand}` },
        { name: "Bot Uptime", value: new Date(1000 * pUptime()).toLocaleTimeString() },
        { name: "System Uptime", value: new Date(1000 * sUptime()).toLocaleTimeString() },
      )
      .setColor(0xaa7777);
    await message.channel.send({ embeds: [embed] });
  }
  help = { show: true, usage: `${this.prefix}info` };
}
