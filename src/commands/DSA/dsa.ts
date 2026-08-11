import { sendMessage } from "@/discord/sendMessage";
import { ChannelNotSendableError } from "@/errors/ChannelNotSendable";
import { I18nService } from "@/i18n/I18n";
import { AppConfig } from "@/modules/settings";
import { DsaCharRepository } from "@/repositories/DsaCharRepository";
import { declareCommand } from "@/types.js";
import {
  DiscordAPIError,
  Message,
  PermissionFlagsBits,
  TextChannel,
  Webhook,
  WebhookType,
  type OmitPartialGroupDMChannel,
} from "discord.js";
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
      const guildOnlyMessage = yield* i18n.t(null, "general.guildOnly");
      yield* sendMessage(channel, { content: guildOnlyMessage });
      return;
    }
    if (
      !message.guild.members.me
        ?.permissionsIn(message.channel)
        .has([PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageWebhooks])
    ) {
      const permMessage = yield* i18n.t(message.guildId, "command.dsa.permissions");
      yield* sendMessage(channel, { content: permMessage });
      return;
    }
    let sl: boolean = true;
    if (args?.[0]) {
      sl = !args[0].startsWith("$");
    } else if (message.attachments.size > 1) {
      sl = true;
    } else {
      yield* Effect.tryPromise<OmitPartialGroupDMChannel<Message<true>>, DiscordAPIError>(() => message.delete());
      const contentRequired = yield* i18n.t(message.guildId, "command.dsa.contentRequired");
      yield* Effect.tryPromise<Message<false>, DiscordAPIError>(() =>
        message.author.send({ content: contentRequired }),
      );
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
      displayName = yield* i18n.t(message.guildId, "command.dsa.gameMaster");
      displayImg = "https://cdn.discordapp.com/icons/790938544293019649/d0843b10f5e7dabd10ebbea93acfca28.webp";
    }
    if (channel instanceof TextChannel) {
      const webhook = yield* Effect.tryPromise<Webhook<WebhookType.Incoming>, DiscordAPIError>(() =>
        channel.createWebhook({ name: displayName, avatar: displayImg }),
      );
      if (message.attachments.size == 0) {
        yield* Effect.tryPromise<Message<true>, DiscordAPIError>(() => webhook.send({ content: args.join(" ") }));
      } else {
        const attarr: string[] = [];
        message.attachments.forEach((a) => {
          attarr.push(a.url);
        });
        yield* Effect.tryPromise<Message<true>, DiscordAPIError>(() =>
          webhook.send({ content: args.join(" "), files: attarr }),
        );
      }
      yield* Effect.tryPromise<void, DiscordAPIError>(() => webhook.delete());
      yield* Effect.tryPromise<OmitPartialGroupDMChannel<Message<true>>, DiscordAPIError>(() => message.delete());
    }
  }),
});
