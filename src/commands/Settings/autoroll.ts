import { sendMessage } from "@/discord/sendMessage";
import { ChannelNotSendableError } from "@/errors/ChannelNotSendable";
import { I18nService } from "@/i18n/I18n";
import { isOwner } from "@/modules/command";
import { AppConfig } from "@/modules/settings";
import { SettingsRepository } from "@/repositories/SettingsRepository";
import { declareCommand } from "@/types.js";
import { Message, PermissionFlagsBits } from "discord.js";
import { Effect } from "effect";

export const AutoRollCommand = declareCommand({
  name: "autoroll",
  usage: Effect.gen(function* () {
    const settings = yield* AppConfig;
    return `${settings.prefix}autoroll <y/n>`;
  }),
  category: "Settings",
  summary: "command.autoroll.description",
  run: Effect.fn("AutoRollCommand.run")(function* (message: Message, args: string[]) {
    const { channel } = message;
    if (!channel.isSendable()) {
      yield* Effect.logError(`channel ${message.channel.id} is not sendable`);
      return yield* new ChannelNotSendableError({ channelId: message.channelId });
    }
    const i18n = yield* I18nService;
    if (!message.inGuild()) {
      const msg = yield* i18n.t(null, "general.guildOnly");
      yield* sendMessage(channel, { content: msg });
      return;
    }
    if (
      !(
        message.member!.permissions.has(PermissionFlagsBits.Administrator) ||
        (yield* isOwner(message.author))
      )
    ) {
      const permissionError = yield* i18n.t(message.guildId, "command.autoroll.permissionError");
      yield* sendMessage(message.channel, { content: permissionError });
      return;
    }
    const arg = !args || args.length === 0 ? "" : args.join(" ").toLowerCase().trim();

    const invalidArgMsg = yield* i18n.t(message.guildId, "command.autoroll.invalidArg");
    if (!arg) {
      yield* sendMessage(message.channel, { content: invalidArgMsg });
      return;
    }
    const parsed = ["t", "true", "y", "yes", "j"].includes(arg)
      ? true
      : ["f", "false", "n", "no"].includes(arg)
        ? false
        : undefined;
    if (parsed === undefined) {
      yield* sendMessage(message.channel, { content: invalidArgMsg });
      return;
    }
    const settingsRepo = yield* SettingsRepository;
    yield* settingsRepo.setAutorollEnabled(message.guild, parsed);
    const activePart = yield* i18n.t(
      message.guildId,
      parsed ? "command.autoroll.active" : "command.autoroll.inactive",
    );
    const successMsg = yield* i18n.t(message.guildId, "command.autoroll.success", {
      active: activePart,
    });
    yield* sendMessage(message.channel, { content: successMsg });
  }),
});
