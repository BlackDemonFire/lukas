import { sendMessage } from "@/discord/sendMessage";
import { I18nService } from "@/i18n/I18n";
import { SettingsRepository } from "@/repositories/SettingsRepository";
import { EmbedBuilder, type Message } from "discord.js";
import { Effect, Match } from "effect";
import { LukasRandom } from "./random";

const rollArgRegex = /^(\d)*(?:[dw])(\d+)$/;
const dragonBaneArgRegex = /^db(\d+)(?:([-+])(\d+))?$/;
const dragonBaneSkillImproveArgRegex = /^dbs(\d+)$/;

/**
 *
 * @param message The message to check/roll for
 * @returns true if a dice-roll was executed.
 */
export const executeRollIfEnabled = Effect.fn("ExecuteRollIfEnabled")(function* (message: Message<true>) {
  const settingsRepo = yield* SettingsRepository;
  const autoRollEnabled = yield* settingsRepo.getAutorollEnabled(message.guild);
  yield* Effect.annotateCurrentSpan("enabled", autoRollEnabled);
  if (!autoRollEnabled) {
    yield* Effect.logDebug("[autoroll]: autoroll disabled");
    return false;
  }
  const args = message.content.toLowerCase().split(" ");
  if (!args.length) return false;
  if (args.length === 1) {
    const dragonBaneMatch = dragonBaneArgRegex.exec(args[0]!);
    if (dragonBaneMatch) {
      yield* runDragonBaneRoll(
        message,
        Number.parseInt(dragonBaneMatch[1]!),
        Number.parseInt(dragonBaneMatch[3] || "0"),
        dragonBaneMatch[2] as "-" | "+",
      );
      return true;
    }
    const dragonBaneSkillMatch = dragonBaneSkillImproveArgRegex.exec(args[0]!);
    if (dragonBaneSkillMatch) {
      yield* runDragonBaneSkillImproveRoll(message, Number.parseInt(dragonBaneSkillMatch[1]!));
      return true;
    }
  }
  if (!args.every((a) => rollArgRegex.test(a))) {
    yield* Effect.logDebug("[autoroll]: not all args are roll-args", args);
    return false;
  }
  const dice: { count: number; max: number }[] = args.map((arg) => {
    const [count, max] = arg.split(/(?:[wd])/);
    return { count: Number.parseInt(count || "1", 10), max: Number.parseInt(max!, 10) };
  });
  if (dice.length > 10) {
    // TODO: i18n message
    yield* sendMessage(message.channel, { content: "Das Maximum an Würfen ist 10." });
    return true;
  }
  const i18n = yield* I18nService;
  if (dice.some((d) => d.max === 0)) {
    const msg = yield* i18n.t("command.roll.errors.noSides");
    yield* sendMessage(message.channel, { content: `<:warn_3:498277726604754946> ${msg}` });
    return true;
  }
  const diceCount = dice.reduce((a, b) => a + b.count, 0);
  const msgauthor: string = message.author.username;
  if (diceCount === 0) {
    const plaintext = yield* i18n.t("command.roll.results.noDice.plaintext", { msgauthor });
    const embedText = yield* i18n.t("command.roll.results.noDice.embed");
    const embed = new EmbedBuilder()
      .setColor(0x36393e)
      .setDescription(`<:info_1:498285998346731530> ${embedText}`)
      .setFooter({ text: `@${msgauthor}` });
    yield* sendMessage(message.channel, { content: `*${plaintext}*`, embeds: [embed] });
    return true;
  }
  if (diceCount > 70) {
    const msg = yield* i18n.t("command.roll.errors.tooManyDice");
    yield* sendMessage(message.channel, { content: `<:warn_3:498277726604754946> ${msg}` });
    return true;
  }
  let nums: number[] = [];
  yield* Effect.logDebug("executing dice: ", dice);
  yield* Effect.logDebug("message content: ", message.content);
  const random = yield* LukasRandom;
  const embeds = [];
  for (const { count, max } of dice) {
    const results = yield* random.ints(1, max, count);
    nums = nums.concat(results);
    const embed = new EmbedBuilder().setColor(0x36393e).setFooter({ text: `@${msgauthor}` });
    if (max < 10) {
      embed.setDescription(results.map(diceToEmoji).join(""));
    } else {
      embed.setDescription(results.map((d) => d.toString()).join(" "));
    }
    const title = yield* count === 1
      ? i18n.t("command.roll.results.singleDice", { rolltype: dice[0]!.max })
      : i18n.t("command.roll.results.multiDice", { rolltype: max, rollcountmax: count });
    embed.setTitle(title);
    embeds.push(embed);
  }
  yield* Effect.logDebug("executed dice: ", nums);

  yield* sendMessage(message.channel, { embeds });
  return true;
});

const runDragonBaneRoll = Effect.fn("DragonBaneRoll.run")(function* (
  message: Message<true>,
  toNotExceed: number,
  extraRolls: number = 0,
  sign: "-" | "+" = "-",
) {
  const i18n = yield* I18nService;
  if (toNotExceed > 19) {
    const msg = yield* i18n.t("dragonborn.dragonbornRoll.invalidArg");
    yield* sendMessage(message.channel, { content: msg });
    return;
  }
  const random = yield* LukasRandom;
  const rolls = yield* random.ints(1, 20, extraRolls + 1);
  const rollToEvaluate = sign === "-" ? rolls.toSorted((a, b) => b - a) : rolls.toSorted((a, b) => a - b);
  const msgauthor: string = message.author.username;
  const embed = new EmbedBuilder().setColor(0x36393e).setFooter({ text: `@${msgauthor}` });

  const msg = yield* Match.value(rollToEvaluate[0]!).pipe(
    Match.when(Match.is(20), () => i18n.t("dragonborn.dragonbornRoll.critFailure")),
    Match.when(
      (res) => res > toNotExceed,
      () => i18n.t("dragonborn.dragonbornRoll.failed", { dice: rollToEvaluate }),
    ),
    Match.when(Match.is(1), () => i18n.t("dragonborn.dragonbornRoll.critSuccess")),
    Match.orElse(() => i18n.t("dragonborn.dragonbornRoll.success", { dice: rollToEvaluate })),
  );
  embed.setTitle(msg);
  yield* sendMessage(message.channel, { embeds: [embed] });
});

const runDragonBaneSkillImproveRoll = Effect.fn("DragonBaneSkillImproveRoll.run")(function* (
  message: Message<true>,
  skillLevel: number,
) {
  const i18n = yield* I18nService;
  if (skillLevel >= 18) {
    const msg = yield* i18n.t("dragonborn.skillImprove.invalidArg");
    yield* sendMessage(message.channel, { content: msg });
    return;
  }
  const random = yield* LukasRandom;
  const roll = yield* random.int(1, 20);
  const msgauthor: string = message.author.username;
  const embed = new EmbedBuilder().setColor(0x36393e).setFooter({ text: `@${msgauthor}` });

  const msg = yield* Match.value(roll).pipe(
    Match.when(
      (res) => res > skillLevel,
      () => i18n.t("dragonborn.skillImprove.success", { dice: roll }),
    ),
    Match.orElse(() => i18n.t("dragonborn.skillImprove.failure", { dice: roll })),
  );
  embed.setTitle(msg);
  yield* sendMessage(message.channel, { embeds: [embed] });
});

/**
 *
 * @param die allowed values go from 1 to 9.
 * @returns a discord emoji
 */
function diceToEmoji(die: number): string {
  switch (die) {
    case 1:
      return "<:dice1:601727730320670721> ";
    case 2:
      return "<:dice2:601730229513355284> ";
    case 3:
      return "<:dice3:601730229563686921> ";
    case 4:
      return "<:dice4:601730229538390017> ";
    case 5:
      return "<:dice5:601730229781790720> ";
    case 6:
      return "<:dice6:601730229597372416> ";
    case 7:
      return "<:dice7:601730229119090700> ";
    case 8:
      return "<:dice8:601730229211496454> ";
    case 9:
      return "<:dice9:601730229337063425> ";
  }
  throw new Error("diceToEmoji only supports numbers from 1 to 9, received " + die);
}
