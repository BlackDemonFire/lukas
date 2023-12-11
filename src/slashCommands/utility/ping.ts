import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { CommandInput, CustomSlashCommand } from "../../modules/command.js";
import { Bot } from "../../bot.js";
import { ILanguage } from "src/types.js";

export default class PingCommand extends CustomSlashCommand {
  async execute(
    client: Bot,
    interaction: ChatInputCommandInteraction<"cached">,
    language: ILanguage,
  ) {
    await interaction.reply("Pong!");
    await client.commands
      .get("ping")!
      .run(client, new CommandInput(null, interaction), [], language);
  }
  getBuilder(language: Map<string, ILanguage>): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("ping")
      .setDescription(language.get("en_US")!.command.ping.description);
  }
}
