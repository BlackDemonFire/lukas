import { Bot } from "../../bot.js";
import { Command, CommandInput } from "../../modules/command.js";
import type { ILanguage } from "../../types.js";

export default class Giftype extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  async run(
    client: Bot,
    message: CommandInput,
    args: string[],
    language: ILanguage,
  ) {
    const types = await client.db.getGiftypes();
    let typesstring = "";
    switch (types.length) {
      case 1:
        typesstring = types[0];
        break;
      case 2:
        typesstring = types.join(` ${language.general.and} `);
        break;
      default:
        break;
    }

    const giftype: string = args.length == 0 ? "" : args[0].toLowerCase();
    if (args.length == 0 || !types.includes(giftype)) {
      await message.channel.send({
        content: language.command.giftype.availableTypes.replace(
          "{types}",
          typesstring,
        ),
      });
      return;
    }
    await client.db.setGiftype(message.author, giftype);
  }
  help = {
    show: true,
    usage: `${this.prefix}giftype <type>`,
  };
}
