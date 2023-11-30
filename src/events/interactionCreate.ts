import { BaseInteraction } from "discord.js";
import { Bot } from "../bot.js";
import logger from "../modules/logger.js";
import settings from "../modules/settings.js";
import { ILanguage } from "src/types.js";

export async function event(client: Bot, interaction: BaseInteraction) {
  if (interaction.isMessageComponent()) {
    const args: string[] = interaction.customId.split(".");
    const name: string = args.shift() || "";

    const fn = client.interactions.get(name);

    if (!fn) {
      logger.warn(
        `No function for requested interaction ${name} (called with args ${args})`,
      );
      return;
    }
    await fn(client, interaction, args);
  } else if (interaction.isChatInputCommand()) {
    const commandname = interaction.commandName;
    const command = client.slashcommands.get(commandname);
    let language: ILanguage;
    if (interaction.guild) {
      language = client.languages.get(
        await client.db.getLang(interaction.guild),
      )!;
    } else {
      language = client.languages.get(settings.DEFAULTLANG)!;
    }
    if (command != undefined) {
      command.execute(client, interaction, language);
    } else {
      logger.warn(`No command with name ${commandname} found`);
    }
  } else {
    logger.warn(`unknown interaction type`);
  }
}
