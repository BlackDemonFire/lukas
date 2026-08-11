import { sendMessage } from "@/discord/sendMessage.js";
import { DiscordClient } from "@/DiscordGateway.js";
import { ChannelNotSendableError } from "@/errors/ChannelNotSendable.js";
import { I18nService } from "@/i18n/I18n.js";
import type { MessageKey } from "@/i18n/types.js";
import { GifRepository } from "@/repositories/GifRepository.js";
import { UserRepository } from "@/repositories/UserRepository.js";
import { type ColorResolvable, Colors, DiscordAPIError, EmbedBuilder, Message, Team, User } from "discord.js";
import { DateTime, Effect, Option, pipe } from "effect";
import { LukasRandom } from "./random.js";

type MiddlePart<
  T extends string,
  Prefix extends string,
  Suffix extends string,
> = T extends `${Prefix}${infer Middle}${Suffix}` ? Middle : never;

export const isAprilFools = Effect.gen(function* () {
  const date = yield* DateTime.nowInCurrentZone;
  const mon = DateTime.getPart("month")(date);
  const dom = DateTime.getPart("day")(date);
  return dom === 1 && mon === 4;
});

export const isOwner = Effect.fnUntraced(function* (user: User) {
  const client = yield* DiscordClient;
  const apk = client.application!;
  if (apk.owner instanceof Team) {
    return apk.owner.members.has(user.id);
  } else if (apk.owner instanceof User) {
    return apk.owner.id == user.id;
  }
  return false;
});

const userMentionRegex = /<@!?(\d+)>/;
export const parseUser = Effect.fn("parseUser")(function* (message: Message, args: string[]) {
  let userB: string = "";
  const mentioned: string[] = [];
  let self: boolean = false;
  if (args && args.length > 0) {
    for (const arg of args) {
      let name: string = "";
      const ping = userMentionRegex.exec(arg);
      if (ping) {
        const client = yield* DiscordClient;
        const maybeUser = yield* pipe(
          Effect.tryPromise<User, DiscordAPIError>(() => client.users.fetch(ping[1]!)),
          Effect.option,
        );
        const userRepo = yield* UserRepository;
        name = yield* Option.match(maybeUser, {
          onSome: (user) => userRepo.getName(user),
          onNone: () => Effect.succeed(arg),
        });
        if (!name || name == "") {
          const member = message.guild ? message.guild.members.resolve(maybeUser.valueOrUndefined!) : null;
          name = member ? member.displayName : maybeUser.valueOrUndefined!.username;
        }
        if (maybeUser.valueOrUndefined == message.author) {
          self = true;
        }
        mentioned.push(name);
      } else if (arg && arg !== "") {
        mentioned.push(arg);
      }
    }
    const i18n = yield* I18nService;
    const and = yield* i18n.t(message.guildId, "general.and");
    if (userB == "" && !self) {
      switch (mentioned.length) {
        case 1:
          userB = mentioned[0]!;
          break;
        case 2:
          userB = mentioned.join(` ${and} `);
          break;
        default:
          {
            const last = mentioned.pop();
            userB = mentioned.join(", ");
            userB += ` ${and} `;
            userB += last;
          }
          break;
      }
    }
  }
  if (userB.length > 1792) userB = userB.substring(0, 1792) + "...";
  return userB;
});

const getColor = Effect.fn("getColor")(function* (author: User) {
  const userRepo = yield* UserRepository;
  const rawColor = yield* userRepo.getColor(author);
  const listFmt = new Intl.ListFormat();
  yield* Effect.logDebug(`available colors: ${listFmt.format(rawColor.split(";"))}`);
  const rand = yield* LukasRandom;
  return yield* rand.choice(rawColor.split(";"));
});
const buildAndSendEmbed = Effect.fnUntraced(function* (
  gif: string,
  responseString: string,
  color: ColorResolvable,
  message: Message,
  name: string,
) {
  const { channel } = message;
  if (!channel.isSendable()) {
    return yield* new ChannelNotSendableError({ channelId: message.channel.id });
  }
  const embed = new EmbedBuilder().setImage(gif).setAuthor({ name }).setDescription(responseString).setColor(color);
  yield* sendMessage(channel, { embeds: [embed] });
});

const runSingleUserGifCommand = Effect.fn("SingleUserGifCommand.run")(function* (
  message: Message,
  _args: string[],
  name: MiddlePart<MessageKey, `command.`, ".singleUser">,
) {
  const userRepo = yield* UserRepository;
  const gifType = yield* userRepo.getGifType(message.author);
  const gifRepo = yield* GifRepository;
  const gif = yield* gifRepo.getGif(name, gifType);
  let userA = yield* userRepo.getName(message.author);
  const rawColor = yield* getColor(message.author);
  let color: ColorResolvable;
  if (rawColor in Colors) color = rawColor as keyof typeof Colors;
  else color = "Random";
  if (userA == "") userA = message.guild ? message.member!.displayName : message.author.username;
  const i18n = yield* I18nService;
  const responseString: string = yield* i18n.t(message.guildId, `command.${name}.singleUser`, { a: userA });
  yield* buildAndSendEmbed(gif, responseString, color, message, name);
});

const runMultiUserGifCommand = Effect.fn("MultiUserGifCommand.run")(function* (
  message: Message,
  args: string[],
  name: MiddlePart<MessageKey, `command.`, ".singleUser"> & MiddlePart<MessageKey, `command.`, ".multiUser">,
) {
  const userRepo = yield* UserRepository;
  const gifType = yield* userRepo.getGifType(message.author);
  const gifRepo = yield* GifRepository;
  const gif = yield* gifRepo.getGif(name, gifType);
  let userA: string = yield* userRepo.getName(message.author);
  const rawColor = yield* getColor(message.author);
  const color: ColorResolvable = rawColor as ColorResolvable;

  if (userA == "") userA = message.guild ? message.member!.displayName : message.author.username;
  const userB: string = yield* parseUser(message, args);
  let responseString: string;
  const i18n = yield* I18nService;
  if (userB == "") {
    const huhu = yield* i18n.t(message.guildId, `command.${name}.singleUser`, { a: userA });
    responseString = huhu;
  } else {
    responseString = yield* i18n.t(message.guildId, `command.${name}.multiUser`, { a: userA, b: userB });
  }
  yield* buildAndSendEmbed(gif, responseString, color, message, name);
});

export { runMultiUserGifCommand, runSingleUserGifCommand };
