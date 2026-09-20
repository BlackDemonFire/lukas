import { DiscordClient } from "@/Discord";
import { sendMessage } from "@/discord/sendMessage";
import { sendUserMessage } from "@/discord/sendUserMessage";
import { ChannelNotSendableError } from "@/errors/ChannelNotSendable";
import { I18nService } from "@/i18n/I18n";
import { isOwner } from "@/modules/command.js";
import { GifRequest, activeRequests } from "@/modules/dbo/gifRequest.js";
import { AppConfig } from "@/modules/settings";
import { GifRepository } from "@/repositories/GifRepository";
import { declareCommand } from "@/types.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildChannel, Message, Team, User } from "discord.js";
import { Effect } from "effect";

export const NewgifCommand = declareCommand({
  name: "newgif",
  category: "Utility",
  summary: "command.newgif.description",
  usage: Effect.gen(function* () {
    const settings = yield* AppConfig;
    return `${settings.prefix}newgif <url> <command> [type (defaults to anime)]`;
  }),
  run: Effect.fn("NewGifCommand.run")(function* (message: Message, args: string[]) {
    const { channel } = message;
    if (!channel.isSendable()) {
      yield* Effect.logError(`channel ${message.channel.id} is not sendable`);
      return yield* new ChannelNotSendableError({ channelId: message.channelId });
    }
    const i18n = yield* I18nService;
    if (args?.length !== 3) {
      const wrongArgs = yield* i18n.t("command.newgif.wrongArgs");
      yield* sendMessage(channel, { content: wrongArgs });
      return;
    }
    const url: string = args[0]!;
    const action: string = args[1]!.toLowerCase();
    const type: string = args[2]!.toLowerCase();
    const gifRepo = yield* GifRepository;
    if (yield* isOwner(message.author)) {
      yield* gifRepo.createGif(url, action, type);
      const msg = yield* i18n.t("command.newgif.success");
      yield* sendMessage(channel, { content: msg });
      return;
    }
    const response: string = yield* i18n.t("command.newgif.checking");
    const client = yield* DiscordClient;
    const owner: Team | User = client.application!.owner!;
    let admins: User[];
    if (owner instanceof Team) {
      admins = owner.members.map((tmember) => tmember.user);
    } else {
      admins = [owner];
    }
    const requestMessage = yield* sendMessage(channel, { content: response });
    activeRequests.set(
      requestMessage.id,
      new GifRequest(requestMessage, requestMessage.id, message.channel.id, url, action, type),
    );
    const content = `Gif check request from ${message.author.tag} in <#${message.channel.id}> (${
      message.channel instanceof GuildChannel ? message.channel.name : "DM"
    })\ngif: ${url}\naction: ${action}\ntype: ${type}`;
    const messageComponents = [
      new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder()
          .setLabel("Accept")
          .setCustomId(`newgif.accept.${requestMessage.id}`)
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setLabel("Reject")
          .setCustomId(`newgif.reject.${requestMessage.id}`)
          .setStyle(ButtonStyle.Danger),
      ]),
    ];
    for (const admin of admins) {
      yield* sendUserMessage(admin, { content: content, components: messageComponents });
    }
  }),
});
