import { Bot } from "../../bot.js";
import { Command, CommandInput } from "../../modules/command.js";
import type { ILanguage as lang } from "../../types.js";

export default class Dsarm extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  help = {
    show: true,
    usage: `${this.prefix}dsarm <character>`,
  };
  async run(
    client: Bot,
    message: CommandInput,
    args: string[],
    language: lang,
  ) {
    const pref: string | undefined = args.shift()?.slice().toLowerCase();
    if (!pref) {
      await message.channel.send({ content: language.command.dsarm.args });
      return;
    }
    if (!(await client.db.getDSAChar(pref))) {
      await message.channel.send({
        content: language.command.dsarm.noSuchChar.replace("{pref}", pref),
      });
      return;
    }
    await client.db.deleteDSAChar(pref);
    await message.channel.send({
      content: language.command.dsarm.success.replace("{pref}", pref),
    });
  }
}
