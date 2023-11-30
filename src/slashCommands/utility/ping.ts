import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { CommandInput, CustomSlashCommand } from "../../modules/command.js";
import { Bot } from "../../bot.js";
import { ILanguage } from "src/types.js";

export default class PingCommand extends CustomSlashCommand {
  async execute(
    client: Bot,
    interaction: ChatInputCommandInteraction,
    language: ILanguage,
  ) {
    await client.commands
      .get("ping")!
      .run(client, new CommandInput(null, interaction), [], language);
  }

  getBuilder(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Replies with Pong!");
  }
}
