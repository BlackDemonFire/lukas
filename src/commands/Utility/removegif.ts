import { sendMessage } from "@/discord/sendMessage";
import { DiscordClient } from "@/Discord.js";
import { ChannelNotSendableError } from "@/errors/ChannelNotSendable";
import { I18nService } from "@/i18n/I18n.js";
import { isOwner } from "@/modules/command.js";
import { GifRequest, activeRequests } from "@/modules/dbo/gifRequest.js";
import { AppConfig } from "@/modules/settings";
import { GifRepository } from "@/repositories/GifRepository.js";
import { declareCommand } from "@/types.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message, Team, User } from "discord.js";
import { Effect } from "effect";
import { sendUserMessage } from "@/discord/sendUserMessage";

export const RemovegifCommand = declareCommand({
  category: "Utility",
  run: Effect.fn("RemovegifCommand.run")(function* (message: Message, args: string[]) {
    const channel = message.channel;
    if (!channel.isSendable()) {
      yield* Effect.logError(`channel ${channel.id} is not sendable`);
      return yield* new ChannelNotSendableError({ channelId: channel.id });
    }
    const i18n = yield* I18nService;
    if (args.length !== 1) {
      const msg = yield* i18n.t("command.removegif.wrongArgs");
      yield* sendMessage(channel, { content: msg });
      return;
    }
    const url: string = args[0]!;
    if (yield* isOwner(message.author)) {
      const gifRepo = yield* GifRepository;
      yield* gifRepo.removeGif(url);
      const msg = yield* i18n.t("command.removegif.success");
      yield* sendMessage(channel, { content: msg });
      return;
    }
    const response: string = yield* i18n.t("command.removegif.checking");
    const client = yield* DiscordClient;
    if (!client.isReady()) {
      yield* Effect.logError("Unable to determine bot administrators");
      return yield* Effect.die("Client not initialized");
    }
    const owner = client.application.owner;
    if (!owner) {
      yield* Effect.logError("Bot Owner is not set.");
      return yield* Effect.die("ClientApplication.owner is not set");
    }
    let admins: User[];
    if (owner instanceof Team) {
      admins = owner.members.map((tmember) => tmember.user);
    } else {
      admins = [owner];
    }
    const requestMessage = yield* sendMessage(channel, { content: response });
    activeRequests.set(
      requestMessage.id,
      new GifRequest(requestMessage, requestMessage.id, message.channel.id, url, null, null),
    );
    const content = `Gif check request from ${message.author.tag} in <#${message.channel.id}> (${
      message.inGuild() ? message.channel.name : "DM"
    })\ngif: ${url}`;
    yield* Effect.all(
      admins.map((admin) =>
        sendUserMessage(admin, {
          content,
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents([
              new ButtonBuilder()
                .setLabel("Accept")
                .setCustomId(`removegif.accept.${requestMessage.id}`)
                .setStyle(ButtonStyle.Success),
              new ButtonBuilder()
                .setLabel("Reject")
                .setCustomId(`removegif.reject.${requestMessage.id}`)
                .setStyle(ButtonStyle.Danger),
            ]),
          ],
        }),
      ),
    );
  }),
  name: "removegif",
  summary: "command.removegif.description",
  usage: Effect.gen(function* () {
    const cfg = yield* AppConfig;
    return cfg.prefix + "removegif <url>";
  }),
});
