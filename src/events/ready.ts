import { Team, User } from "discord.js";
import { Bot } from "../bot.js";
import logger from "../modules/logger.js";

export async function event(client: Bot) {
  logger.info(
    `I'm Ready on ${client.guilds.cache.size} Servers serving ${client.channels.cache.size} Channels`,
  );
  client.application = await client.application!.fetch();
  const owner = client.application.owner;
  let ownerstring = "someone unknown";
  if (owner instanceof User) ownerstring = owner.tag;
  if (owner instanceof Team)
    ownerstring = `a team consisting of ${owner.members
      .map((member) => member.user.tag)
      .join(", ")}`;
  logger.info(`I belong to ${ownerstring}.`);

  logger.info("Publishing commands...");
  await client.application?.commands.set(
    client.slashcommands.map((cmd) => cmd.getBuilder().toJSON()),
  );
  client.executedReady = true;
}
