import { deleteMessage } from "@/discord/deleteMessage";
import { deleteWebhook } from "@/discord/deleteWebhook";
import { sendMessage } from "@/discord/sendMessage";
import { sendUserMessage } from "@/discord/sendUserMessage";
import { sendWebhookMessage } from "@/discord/sendWebhookMessage";
import { ChannelNotSendableError } from "@/errors/ChannelNotSendable";
import { I18nService } from "@/i18n/I18n";
import { AppConfig } from "@/modules/settings";
import { DsaCharRepository } from "@/repositories/DsaCharRepository";
import { declareCommand } from "@/types.js";
import { DiscordAPIError, Message, PermissionFlagsBits, TextChannel, Webhook, WebhookType } from "discord.js";
import { Effect, Option } from "effect";

export const DsaCommand = declareCommand({
  name: "dsa",
  summary: "command.dsa.description",
  category: "DSA",
  usage: Effect.gen(function* () {
    const cfg = yield* AppConfig;
    const prefix = cfg.prefix;
    return `${prefix}dsa [character] <message>`;
  }),

  run: Effect.fn("DsaCommand.run")(function* (message: Message, args: string[]) {
    const { channel } = message;
    if (!channel.isSendable()) {
      yield* Effect.logError(`channel ${message.channel.id} is not sendable`);
      return yield* new ChannelNotSendableError({ channelId: message.channelId });
    }
    const i18n = yield* I18nService;
    if (!message.inGuild()) {
      const guildOnlyMessage = yield* i18n.t("general.guildOnly");
      yield* sendMessage(channel, { content: guildOnlyMessage });
      return;
    }
    if (
      !message.guild.members.me
        ?.permissionsIn(message.channel)
        .has([PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageWebhooks])
    ) {
      const permMessage = yield* i18n.t("command.dsa.permissions");
      yield* sendMessage(channel, { content: permMessage });
      return;
    }
    let sl: boolean = true;
    if (args?.[0]) {
      sl = !args[0].startsWith("$");
    } else if (message.attachments.size > 1) {
      sl = true;
    } else {
      yield* deleteMessage(message);
      const contentRequired = yield* i18n.t("command.dsa.contentRequired");
      yield* sendUserMessage(message.author, { content: contentRequired });
      return;
    }
    const clean = args[0]!.slice().toLowerCase();
    let count = 0;
    let npc: string = "";
    let displayName: string;
    let displayImg: string | undefined = undefined;
    while (args[0]!.startsWith("$")) {
      npc = npc + args.shift();
      count = count + 1;
    }
    const dsaCharRepo = yield* DsaCharRepository;
    const char = yield* dsaCharRepo.getCharacter(clean);
    Option.match(char, {
      onSome: (c) => {
        displayName = c.displayname ?? "unknown";
        displayImg = c.avatar ?? undefined;
      },
      onNone: () => {
        let i = 0;
        while (i < count) {
          npc = npc.replace("$", " ");
          i = i + 1;
        }
        displayName = npc.substring(1);
      },
    });
    if (sl) {
      displayName = yield* i18n.t("command.dsa.gameMaster");
      displayImg = "https://cdn.discordapp.com/icons/790938544293019649/d0843b10f5e7dabd10ebbea93acfca28.webp";
    }
    if (channel instanceof TextChannel) {
      const webhook = yield* Effect.tryPromise<Webhook<WebhookType.Incoming>, DiscordAPIError>({
        try: () => channel.createWebhook({ name: displayName, avatar: displayImg }),
        catch: (e) => e as DiscordAPIError,
      });
      if (message.attachments.size == 0) {
        yield* sendWebhookMessage(webhook, { content: args.join(" ") });
      } else {
        const attarr: string[] = message.attachments.map((a) => a.url);
        yield* sendWebhookMessage(webhook, { content: args.join(" "), files: attarr });
      }
      yield* deleteWebhook(webhook);
      yield* deleteMessage(message);
    }
  }),
});
