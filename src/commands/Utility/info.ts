import { sendMessage } from "@/discord/sendMessage";
import { ChannelNotSendableError } from "@/errors/ChannelNotSendable";
import { AppConfig } from "@/modules/settings";
import { declareCommand } from "@/types";
import { EmbedBuilder, Message } from "discord.js";
import { Duration, Effect } from "effect";
import { freemem, hostname, uptime as sUptime, totalmem } from "node:os";
import { uptime as pUptime } from "node:process";
import { cpu } from "systeminformation";

export const InfoCommand = declareCommand({
  name: "info",
  category: "Utility",
  run: Effect.fn("InfoCommand.run")(function* (message: Message) {
    const { channel } = message;
    if (!channel.isSendable()) {
      yield* Effect.logError(`channel ${message.channel.id} is not sendable`);
      return yield* new ChannelNotSendableError({ channelId: message.channelId });
    }
    const cpuData = yield* Effect.promise(() => cpu());
    const humanReadableFreemem = Math.round(freemem() / 1024 / 1024);
    const humanReadableTotalmem = Math.round(totalmem() / 1024 / 1024);
    const memPercent = Math.round((10000 * freemem()) / totalmem()) / 100;
    const embed: EmbedBuilder = new EmbedBuilder()
      .setTitle("Info")
      .addFields(
        { name: "Host", value: hostname() },
        { name: "RAM", value: `${humanReadableFreemem} MB/${humanReadableTotalmem} MB (${memPercent}%)` },
        { name: "CPU", value: `${cpuData.manufacturer} ${cpuData.brand}` },
        { name: "Bot Uptime", value: Duration.seconds(pUptime()).toString() },
        { name: "System Uptime", value: Duration.seconds(sUptime()).toString() },
      )
      .setColor(0xaa7777);
    yield* sendMessage(channel, { embeds: [embed] });
  }),
  usage: Effect.gen(function* () {
    const cfg = yield* AppConfig;
    return cfg.prefix + "info";
  }),
  summary: "command.info.description",
});
