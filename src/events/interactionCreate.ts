import { BaseInteraction } from "discord.js";
import { Bot } from "../bot.js";
import logger from "../modules/logger.js";

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
  } else {
    logger.warn(`unknown interaction type`);
  }
}
