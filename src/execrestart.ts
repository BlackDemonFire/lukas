import { DMChannel, Message, TextChannel } from "discord.js";
import { Bot } from "./bot";
import logger from "./modules/logger.js";
import { start } from "./startclient.js";

export function restart(
  oldclient: Bot,
  restartmsg: Message | null,
  newtext: string,
) {
  // Neuen Client Herstellen

  const newclient = start();
  newclient.login(process.env.TOKEN);

  // Alten client Entfernen

  newclient.once("ready", async () => {
    for (const key of Object.keys(require.cache)) {
      if (key.indexOf("node_modules") == -1) {
        delete require.cache[key];
      }
    }

    oldclient.destroy();

    logger.info("swapped clients");
    logger.info(" ");

    if (restartmsg) {
      const channel = newclient.channels.resolve(restartmsg.channel.id);
      if (channel instanceof TextChannel || channel instanceof DMChannel) {
        const editMsg = await channel.messages.fetch(restartmsg.id);
        editMsg.edit({ content: newtext });
      }
    }
  });
  // client.once("ready")
}
