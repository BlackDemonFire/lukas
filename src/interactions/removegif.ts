import { BaseInteraction, GuildChannel } from "discord.js";
import { Bot } from "../bot.js";
import { activeRequests } from "../modules/dbo/gifRequest.js";
import logger from "../modules/logger.js";

export default async function run(
  client: Bot,
  interaction: BaseInteraction,
  args: string[],
) {
  if (!interaction.isButton()) {
    logger.warn("Got non-button interaction for removegif command");
    return;
  }
  const request = activeRequests.get(args[1]);
  if (!request) {
    await interaction.update("Unable to find request");
    return;
  }
  if (request.accepted !== undefined) {
    await interaction.update({
      content: `Request was **${
        request.accepted ? "ACCEPTED" : "REJECTED"
      }** by ${request.acceptedBy}`,
      components: [],
    });
    return;
  }
  if (args[0] == "accept") {
    client.db.removeGif(request.gifUrl);
    await request.message.edit("The owner accepted your request");
    await interaction.update({
      content: `**ACCEPTED**\nGif remove request from in <#${
        request.message.channel.id
      }> (${
        request.message.channel instanceof GuildChannel
          ? request.message.channel.name
          : "DM"
      })\ngif: ${request.gifUrl} `,
      components: [],
    });
    request.accepted = true;
    request.acceptedBy = interaction.user.username;
  } else if (args[0] == "reject") {
    await request.message.edit("The owner rejected your request");
    await interaction.update({
      content: `**REJECTED**\nGif remove request from in <#${
        request.message.channel.id
      }> (${
        request.message.channel instanceof GuildChannel
          ? request.message.channel.name
          : "DM"
      })\ngif: ${request.gifUrl}`,
      components: [],
    });
    request.accepted = false;
    request.acceptedBy = interaction.user.username;
  }
}
