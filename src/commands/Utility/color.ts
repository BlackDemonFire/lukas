import { Bot } from "../../bot.js";
import { Command, CommandInput } from "../../modules/command.js";
import type { ILanguage } from "../../types.js";

export default class Color extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  async run(
    client: Bot,
    message: CommandInput,
    _args: string[],
    language: ILanguage,
  ) {
    const current_colors = new Set(
      (await client.db.getColor(message.author)).split(";"),
    );
    const colors = [...current_colors].join(", ");
    await message.channel.send({
      content: language.command.color.show_colors.replace("{c}", colors),
    });
  }
  help = {
    show: true,
    usage: `${this.prefix}color`,
  };
}
