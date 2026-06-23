import { EmbedBuilder, type Message } from "discord.js";
import type { Bot } from "../bot.js";
import logger from "./logger.js";

const rollArgRegex = /^(\d)*(?:d|w)(\d+)$/;

/**
 *
 * @param client Bot instance
 * @param message The message to check/roll for
 * @returns true if a dice-roll was executed.
 */
export async function executeRollIfEnabled(client: Bot, message: Message<boolean>): Promise<boolean> {
  if (!message.inGuild()) {
    logger.debug("[autoroll]: not in guild");
    return false;
  }
  if (!(await client.db.getAutorollEnabled(message.guild))) {
    logger.debug("[autoroll]: autoroll disabled");
    return false;
  }
  const args = message.content.toLowerCase().split(" ");
  if (!args.length) return false;
  if (!args.every((a) => rollArgRegex.test(a))) {
    logger.debug("[autoroll]: not all args are roll-args");
    logger.debug(JSON.stringify(args));
    return false;
  }
  const dice: { count: number; max: number }[] = args.map((arg) => {
    const [count, max] = arg.split(/(?:w|d)/);
    return { count: Number.parseInt(count || "1", 10), max: Number.parseInt(max, 10) };
  });
  let result = "";
  const language = client.languages.get(await client.db.getLang(message.guild))!;

  if (dice.some((d) => d.max === 0)) {
    await message.channel.send({ content: `<:warn_3:498277726604754946> ${language.command.roll.errors.noSides}` });
    return true;
  }
  const diceCount = dice.reduce((a, b) => a + b.count, 0);
  const msgauthor: string = message.author.username;
  if (diceCount === 0) {
    const plaintext = language.command.roll.results.noDice.plaintext.replace("{msgauthor}", msgauthor);
    const embed = new EmbedBuilder()
      .setColor(0x36393e)
      .setDescription(`<:info_1:498285998346731530> ${language.command.roll.results.noDice.embed}`)
      .setFooter({ text: `@${msgauthor}` });
    await message.channel.send({ content: `*${plaintext}*`, embeds: [embed] });
    return true;
  }
  if (diceCount > 70) {
    await message.channel.send({ content: `<:warn_3:498277726604754946> ${language.command.roll.errors.tooManyDice}` });
    return true;
  }
  let nums: number[] = [];
  logger.debug("executing dice: " + JSON.stringify(dice));
  logger.debug("message content: " + message.content);
  for (const { count, max } of dice) {
    const results = await client.random.ints(1, max, count);
    nums = nums.concat(results);
    if (max < 10) {
      result += results.map(diceToEmoji).join("") + " ";
    } else {
      result += results.map((d) => d.toString()).join(" ") + " ";
    }
  }
  logger.debug("executed dice: " + JSON.stringify(nums));
  if (diceCount === 1) {
    const plaintext = language.command.roll.results.singleDice.replace("{rolltype}", dice[0].max.toString());
    const embed = new EmbedBuilder().setColor(0x36393e).setFooter({ text: `@${msgauthor}` });
    // includes an emote
    if (result.includes("<")) {
      embed.setDescription(result);
    } else {
      embed.setAuthor({ name: result });
    }

    await message.channel.send({ content: plaintext, embeds: [embed] });
    return true;
  } else {
    const plaintext = language.command.roll.results.multiDice
      .replace("{rolltype}", Math.max(...dice.map((d) => d.max)).toString())
      .replace("{rollcountmax}", diceCount.toString());
    const embed = new EmbedBuilder().setColor(0x36393e).setFooter({ text: `@${msgauthor}` });
    if (result.includes("<")) {
      embed.setDescription(result);
    } else {
      embed.setAuthor({ name: result });
    }

    await message.channel.send({ content: plaintext, embeds: [embed] });
    return true;
  }
}

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
