import { EmbedBuilder, Message } from "discord.js";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import type { ILanguage as lang } from "../../types.js";
import logger from "../../modules/logger.js";

export default class Roll extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  help = {
    show: true,
    usage: `${this.prefix}roll [args]`,
  };
  async run(client: Bot, message: Message, args: string[], language: lang) {
    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    const msgauthor: string = message.author.username;
    // register args and variables

    let rollarga: string = args[0];
    let rollargb: string = args[1];
    const rollargerror: string = args[2];
    let rolltype: number = 0;
    let dicetype = "wx";
    let rollargs;

    if (args[0]) rollarga = rollarga.toLowerCase();
    if (args[1]) rollargb = rollargb.toLowerCase();

    if (!args[1] && args[0]) {
      if (rollarga[0] !== "w" && rollarga[0] !== "d") {
        if (rollarga.includes("w")) {
          rollargs = rollarga.split("w");
          rollarga = rollargs[0];
          rollargb = `w${rollargs[1]}`;
          args[1] = rollargb;
        } else if (rollarga.includes("d")) {
          rollargs = rollarga.split("d");
          rollarga = rollargs[0];
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

    if (args[2]) {
      await message.channel.send({
        content: `<:warn_3:498277726604754946> ${language.command.roll.errors.tooManyArgs}${rollargerror}`,
      });
      return;
    }

    // two arguments
    const checkregex: RegExp = /w|d/;

    if (args[0] && args[1]) {
      if (checkregex.test(rollarga) && checkregex.test(rollargb)) {
        await message.channel.send({
          content: `<:warn_3:498277726604754946> ${language.command.roll.errors.doubleDiceType}`,
        });
        return;
      }
      if (!checkregex.test(rollarga) && !checkregex.test(rollargb)) {
        await message.channel.send({
          content: `<:warn_3:498277726604754946> ${language.command.roll.errors.doubleRollCount}`,
        });
        return;
      }
      // process two arguments
      if (rollarga.indexOf("w") == 0 || rollarga.indexOf("d") == 0) {
        dicetype = rollarga;
        rollcountmax = rollargb;
      } else if (rollargb.indexOf("w") == 0 || rollargb.indexOf("d") == 0) {
        dicetype = rollargb;
        rollcountmax = rollarga;
      } else {
        await message.channel.send({
          content: `<:warn_3:498277726604754946> ${language.command.roll.errors.schroedingersArgument}`,
        });
        return;
      }
    }

    // process single argument

    if (args[0] && !args[1]) {
      detectedOnlyOneArg = true;

      if (rollarga.indexOf("w") == 0) {
        dicetype = rollarga;
        rollcountmax = "1";
        detectedDiceType = true;
      } else if (rollarga.indexOf("d") == 0) {
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
      await message.channel.send({
        content: `<:warn_3:498277726604754946> ${language.command.roll.errors.noDiceType}`,
      });
      return;
    }
    if (rolltype == 0 && dicetype == "w0") {
      await message.channel.send({
        content: `<:warn_3:498277726604754946> ${language.command.roll.errors.noSides}`,
      });
      return;
    }
    if (rolltype == 0 && dicetype == "d0") {
      await message.channel.send({
        content: `<:warn_3:498277726604754946> ${language.command.roll.errors.noSides}`,
      });
      return;
    }
    if (rolltype == 0) {
      dicetype = dicetype.substr(1);
      if (
        typeof dicetype === "number"
          ? isNaN(dicetype)
          : isNaN(parseInt(dicetype))
      ) {
        await message.channel.send({
          content: `<:warn_3:498277726604754946> ${language.command.roll.errors.rolltypeNotNumeric}`,
        });
        return;
      }
      rolltype = parseInt(dicetype);
      gotStringReadyToConvert = true;
    }

    if (rolltype == 0) {
      await message.channel.send({
        content: `<:warn_3:498277726604754946> ${language.command.roll.errors.rolltypeUndefined} \
                gotDefault = ${gotDefault}\
                gotStringReadyToConvert = ${gotStringReadyToConvert}\
                detectedOnlyOneArg = ${detectedOnlyOneArg}\
                detectedDiceType = ${detectedDiceType}`,
      });
      return;
    }
    if (rollcountmax == "0") {
      const plaintext = language.command.roll.results.noDice.plaintext.replace(
        "{msgauthor}",
        msgauthor,
      );
      const embed = new EmbedBuilder()
        .setColor(0x36393e)
        .setDescription(
          `<:info_1:498285998346731530> ${language.command.roll.results.noDice.embed}`,
        )
        .setFooter({ text: `@${msgauthor}` });
      await message.channel.send({
        content: `*${plaintext}*`,
        embeds: [embed],
      });
      return;
    }
    if (
      typeof rollcountmax === "number"
        ? isNaN(rollcountmax)
        : isNaN(parseInt(rollcountmax))
    ) {
      await message.channel.send({
        content: `<:warn_3:498277726604754946> ${language.command.roll.errors.rollcountNotNumeric}`,
      });
      return;
    }
    // roll the dice and display the result
    let rollresult: string = "";
    let useEmotes: boolean = false;
    let rollcount: number = parseInt(rollcountmax, 10);
    if (rollcount < 1) rollcount = 1;
    if (rollcount % 1 !== 0) rollcount = Math.round(rollcount);
    // is the response too long?

    if (rollcount > 70) {
      await message.channel.send({
        content: `<:warn_3:498277726604754946> ${language.command.roll.errors.tooManyDice}`,
      });
      return;
    }
    const result: number[] = await client.random.ints(1, rolltype, rollcount);
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
        //		}
      } else {
        // separated numbers
        useEmotes = false;
        rollcountcur++;
        rollresult += num;

        if (rollcount != rollcountcur) {
          rollresult += " | ";
        }
      }
      // else
    });
    // forEach(num)

    // response

    if (rollcountmax == "1") {
      const plaintext = language.command.roll.results.singleDice.replace(
        "{rolltype}",
        rolltype.toString(),
      );
      const embed = new EmbedBuilder()
        .setColor(0x36393e)
        .setFooter({ text: `@${msgauthor}` });
      if (useEmotes) {
        embed.setDescription(rollresult);
      } else {
        embed.setAuthor({ name: rollresult });
      }

      await message.channel.send({ content: plaintext, embeds: [embed] });
      return;
    } else {
      const plaintext = language.command.roll.results.multiDice
        .replace("{rolltype}", rolltype.toString())
        .replace("{rollcountmax}", rollcountmax.toString());
      const embed = new EmbedBuilder()
        .setColor(0x36393e)
        .setFooter({ text: `@${msgauthor}` });
      if (useEmotes) {
        embed.setDescription(rollresult);
      } else {
        embed.setAuthor({ name: rollresult });
      }

      await message.channel.send({ content: plaintext, embeds: [embed] });
      return;
    }
  }
}
