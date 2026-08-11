import { sendMessage } from "@/discord/sendMessage";
import { ChannelNotSendableError } from "@/errors/ChannelNotSendable";
import { I18nService } from "@/i18n/I18n";
import { LukasRandom } from "@/modules/random";
import { AppConfig } from "@/modules/settings";
import { declareCommand } from "@/types.js";
import { EmbedBuilder, Message } from "discord.js";
import { Effect } from "effect";

const startsWithWDRegex = /^[wd]/;

const WARN_EMOJI = "<:warn_3:498277726604754946>";
export const RollCommand = declareCommand({
  name: "roll",
  usage: Effect.gen(function* () {
    const settings = yield* AppConfig;
    return `${settings.prefix}roll [args]`;
  }),
  category: "DSA",
  summary: "command.roll.description",
  run: Effect.fn("RollCommand.run")(function* (message: Message, args: string[]) {
    const { channel } = message;
    if (!channel.isSendable()) {
      yield* Effect.logError(`channel ${message.channel.id} is not sendable`);
      return yield* new ChannelNotSendableError({ channelId: message.channelId });
    }
    const msgauthor: string = message.author.username;
    // register args and variables

    let rollarga: string = args[0]!;
    let rollargb: string = args[1]!;
    const rollargerror: string = args[2]!;
    let rolltype: number = 0;
    let dicetype = "wx";
    let rollargs;

    if (args[0]) rollarga = rollarga.toLowerCase();
    if (args[1]) rollargb = rollargb.toLowerCase();

    if (!args[1] && args[0]) {
      if (!startsWithWDRegex.test(rollarga)) {
        if (rollarga.includes("w")) {
          rollargs = rollarga.split("w");
          rollarga = rollargs[0]!;
          rollargb = `w${rollargs[1]}`;
          args[1] = rollargb;
        } else if (rollarga.includes("d")) {
          rollargs = rollarga.split("d");
          rollarga = rollargs[0]!;
          rollargb = `w${rollargs[1]}`;
          args[1] = rollargb;
        }
      }
    }

    let rollcountcur = 0;
    let rollcountmax = "0";

    let gotDefault = false;
    let gotStringReadyToConvert: boolean = false;
    let detectedDiceType = false;
    let detectedOnlyOneArg = false;

    // validify arguments
    const i18n = yield* I18nService;
    if (args[2]) {
      const tooManyArgs = yield* i18n.t(message.guildId, "command.roll.errors.tooManyArgs");
      yield* sendMessage(channel, { content: `${WARN_EMOJI} ${tooManyArgs}${rollargerror}` });
      return;
    }

    // two arguments
    const checkregex: RegExp = /[wd]/;

    if (args[0] && args[1]) {
      if (checkregex.test(rollarga) && checkregex.test(rollargb)) {
        const doubleDiceType = yield* i18n.t(message.guildId, "command.roll.errors.doubleDiceType");
        yield* sendMessage(channel, { content: `${WARN_EMOJI} ${doubleDiceType}` });
        return;
      }
      if (!checkregex.test(rollarga) && !checkregex.test(rollargb)) {
        const doubleRollCount = yield* i18n.t(message.guildId, "command.roll.errors.doubleRollCount");
        yield* sendMessage(channel, { content: `${WARN_EMOJI} ${doubleRollCount}` });
        return;
      }
      // process two arguments
      if (startsWithWDRegex.test(rollarga)) {
        dicetype = rollarga;
        rollcountmax = rollargb;
      } else if (startsWithWDRegex.test(rollargb)) {
        dicetype = rollargb;
        rollcountmax = rollarga;
      } else {
        const schroedingersArgument = yield* i18n.t(message.guildId, "command.roll.errors.schroedingersArgument");
        yield* sendMessage(channel, { content: `${WARN_EMOJI} ${schroedingersArgument}` });
        return;
      }
    }

    // process single argument

    if (args[0] && !args[1]) {
      detectedOnlyOneArg = true;

      if (startsWithWDRegex.test(rollarga)) {
        dicetype = rollarga;
        rollcountmax = "1";
        detectedDiceType = true;
      } else {
        rolltype = 6;
        rollcountmax = rollarga;
      }
    }

    // no argument: insert default

    if (!args[0]) {
      rolltype = 6;
      gotDefault = true;
      rollcountmax = "1";
    }

    // convert String dicetype to Const rolltype

    if (rolltype == 0 && dicetype == "wx") {
      const noDiceType = yield* i18n.t(message.guildId, "command.roll.errors.noDiceType");
      yield* sendMessage(channel, { content: `${WARN_EMOJI} ${noDiceType}` });
      return;
    }
    const noSides = yield* i18n.t(message.guildId, "command.roll.errors.noSides");
    if (rolltype == 0 && dicetype == "w0") {
      yield* sendMessage(channel, { content: `${WARN_EMOJI}} ${noSides}` });
      return;
    }
    if (rolltype == 0 && dicetype == "d0") {
      yield* sendMessage(channel, { content: `${WARN_EMOJI} ${noSides}` });
      return;
    }
    if (rolltype == 0) {
      dicetype = dicetype.substring(1);
      if (typeof dicetype === "number" ? Number.isNaN(dicetype) : Number.isNaN(Number.parseInt(dicetype))) {
        const rolltypeNotNumeric = yield* i18n.t(message.guildId, "command.roll.errors.rolltypeNotNumeric");
        yield* sendMessage(channel, { content: `${WARN_EMOJI} ${rolltypeNotNumeric}` });
        return;
      }
      rolltype = Number.parseInt(dicetype);
      gotStringReadyToConvert = true;
    }

    if (rolltype == 0) {
      const rolltypeUndefined = yield* i18n.t(message.guildId, "command.roll.errors.rolltypeUndefined");
      yield* sendMessage(channel, {
        content: `${WARN_EMOJI} ${rolltypeUndefined} \
                gotDefault = ${gotDefault}\
                gotStringReadyToConvert = ${gotStringReadyToConvert}\
                detectedOnlyOneArg = ${detectedOnlyOneArg}\
                detectedDiceType = ${detectedDiceType}`,
      });
      return;
    }
    if (rollcountmax == "0") {
      const plaintext = yield* i18n.t(message.guildId, "command.roll.results.noDice.plaintext", { msgauthor });
      const embedDescription = yield* i18n.t(message.guildId, "command.roll.results.noDice.embed");
      const embed = new EmbedBuilder()
        .setColor(0x36393e)
        .setDescription(`<:info_1:498285998346731530> ${embedDescription}`)
        .setFooter({ text: `@${msgauthor}` });
      yield* sendMessage(channel, { content: `*${plaintext}*`, embeds: [embed] });
      return;
    }
    if (typeof rollcountmax === "number" ? Number.isNaN(rollcountmax) : Number.isNaN(Number.parseInt(rollcountmax))) {
      const rollcountNotNumeric = yield* i18n.t(message.guildId, "command.roll.errors.rollcountNotNumeric");
      yield* sendMessage(channel, { content: `${WARN_EMOJI} ${rollcountNotNumeric}` });
      return;
    }
    // roll the dice and display the result
    let rollresult: string = "";
    let useEmotes: boolean = false;
    let rollcount: number = Number.parseInt(rollcountmax, 10);
    if (rollcount < 1) rollcount = 1;
    if (rollcount % 1 !== 0) rollcount = Math.round(rollcount);
    // is the response too long?

    if (rollcount > 70) {
      const tooManyDice = yield* i18n.t(message.guildId, "command.roll.errors.tooManyDice");
      yield* sendMessage(channel, { content: `${WARN_EMOJI} ${tooManyDice}` });
      return;
    }
    const random = yield* LukasRandom;
    const result: number[] = yield* random.ints(1, rolltype, rollcount);
    result.forEach((num: number) => {
      if (rolltype < 10) {
        useEmotes = true;
        rollcountcur++;
        switch (num) {
          case 1:
            rollresult += "<:dice1:601727730320670721> ";
            break;
          case 2:
            rollresult += "<:dice2:601730229513355284> ";
            break;
          case 3:
            rollresult += "<:dice3:601730229563686921> ";
            break;
          case 4:
            rollresult += "<:dice4:601730229538390017> ";
            break;
          case 5:
            rollresult += "<:dice5:601730229781790720> ";
            break;
          case 6:
            rollresult += "<:dice6:601730229597372416> ";
            break;
          case 7:
            rollresult += "<:dice7:601730229119090700> ";
            break;
          case 8:
            rollresult += "<:dice8:601730229211496454> ";
            break;
          case 9:
            rollresult += "<:dice9:601730229337063425> ";
            break;
        }
      } else {
        // separated numbers
        useEmotes = false;
        rollcountcur++;
        rollresult += num;

        if (rollcount != rollcountcur) {
          rollresult += " | ";
        }
      }
    });

    // response

    if (rollcountmax == "1") {
      const plaintext = yield* i18n.t(message.guildId, "command.roll.results.singleDice", { rolltype });
      const embed = new EmbedBuilder().setColor(0x36393e).setFooter({ text: `@${msgauthor}` });
      if (useEmotes) {
        embed.setDescription(rollresult);
      } else {
        embed.setAuthor({ name: rollresult });
      }

      yield* sendMessage(channel, { content: plaintext, embeds: [embed] });
      return;
    }

    const plaintext = yield* i18n.t(message.guildId, "command.roll.results.multiDice", {
      rolltype,
      rollcountmax: Number.parseInt(rollcountmax),
    });
    const embed = new EmbedBuilder().setColor(0x36393e).setFooter({ text: `@${msgauthor}` });
    if (useEmotes) {
      embed.setDescription(rollresult);
    } else {
      embed.setAuthor({ name: rollresult });
    }

    yield* sendMessage(channel, { content: plaintext, embeds: [embed] });
  }),
});
