import { CommandMap } from "@/CommandMap";
import { sendMessage } from "@/discord/sendMessage";
import { ChannelNotSendableError } from "@/errors/ChannelNotSendable";
import { I18nService } from "@/i18n/I18n";
import { AppConfig } from "@/modules/settings";
import { declareCommand } from "@/types.js";
import { EmbedBuilder, Message } from "discord.js";
import { Effect } from "effect";

export const HelpCommand = declareCommand({
  name: "help",
  summary: "command.help.description",
  usage: Effect.gen(function* () {
    const cfg = yield* AppConfig;
    return cfg.prefix + "help [command]";
  }),
  category: "Utility",
  run: Effect.fn("HelpCommand.run")(function* (message: Message, args: string[]) {
    const { channel } = message;
    if (!channel.isSendable()) {
      yield* Effect.logError(`channel ${message.channel.id} is not sendable`);
      return yield* new ChannelNotSendableError({ channelId: message.channelId });
    }
    const embed = new EmbedBuilder();
    const cfg = yield* AppConfig;
    const i18n = yield* I18nService;
    const { map: commands } = yield* CommandMap;
    if (args?.[0]) {
      const cmd = args[0].replace(cfg.prefix, "").toLowerCase();
      const command = commands.get(cmd);
      if (command) {
        const desc: string = yield* i18n.t(message.guildId, command.summary);
        const usage = yield* i18n.t(message.guildId, "command.help.usage.Usage");
        embed
          .setDescription(desc)
          .setFooter({ text: command.category })
          .setTitle(command.name)
          .setAuthor({ name: "Help" })
          .addFields(
            { name: usage, value: yield* command.usage },
            { name: usage, value: yield* i18n.t(message.guildId, "command.help.usage.args") },
          );
      } else {
        const cnf = yield* i18n.t(message.guildId, "command.help.commandNotFound", { cmd: args[0] });
        embed.setDescription(cnf);
      }
    } else {
      const categories: { [key: string]: string[] } = {};
      commands
        .values()
        .filter((cmd) => !cmd.hidden)
        .map((cmd) => {
          const category: string = cmd.category;
          if (!categories[category]) {
            categories[category] = [cmd.name];
          } else {
            categories[cmd.category]!.push(cmd.name);
          }
        });
      for (const category in categories) {
        embed.addFields({ name: category, value: categories[category]!.join(", ") });
      }
      embed.setTitle("Help");
    }
    yield* sendMessage(channel, { embeds: [embed] });
  }),
});
