import { Bot } from "../../bot.js";
import { Command, CommandInput } from "../../modules/command.js";
import type { ILanguage } from "../../types.js";

export default class Gifaction extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  async run(
    client: Bot,
    message: CommandInput,
    _args: string[],
    language: ILanguage,
  ) {
    const actions = await client.db.getGifactions();
    let actionsstring: string = "";
    switch (actions.length) {
      case 1:
        actionsstring = actions[0];
        break;
      case 2:
        actionsstring = actions.join(` ${language.general.and} `);
        break;
      default:
        actionsstring = `${actions
          .slice(0, -1)
          .map((action) => `\`${action}\``)
          .join(", ")} ${language.general.and} \`${actions.slice(-1)}\``;
        break;
    }
    await message.channel.send({
      content: language.command.gifactions.response.replace(
        "{actions}",
        actionsstring,
      ),
    });
  }
  help = {
    show: true,
    usage: `${this.prefix}gifaction`,
  };
}
