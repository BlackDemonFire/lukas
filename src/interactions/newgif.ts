import { activeRequests } from "@/modules/dbo/gifRequest.js";
import { GifRepository } from "@/repositories/GifRepository";
import {
  BaseInteraction,
  DiscordAPIError,
  InteractionResponse,
  Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import { Effect } from "effect";

const run = Effect.fn("NewgifInteractionCommand.run")(function* (
  interaction: BaseInteraction,
  args: string[],
) {
  if (!interaction.isButton()) {
    yield* Effect.logWarning("Got non-button interaction for newgif command");
    return;
  }
  const request = args[1] ? activeRequests.get(args[1]) : undefined;
  if (!request) {
    yield* Effect.tryPromise<InteractionResponse, DiscordAPIError>(() =>
      interaction.update("Unable to find request"),
    );
    return;
  }
  if (request.accepted !== undefined) {
    yield* Effect.tryPromise<InteractionResponse, DiscordAPIError>(() =>
      interaction.update({
        content: `Request was **${request.accepted ? "ACCEPTED" : "REJECTED"}** by ${request.acceptedBy}`,
        components: [],
      }),
    );
    return;
  }
  const gifRepo = yield* GifRepository;
  if (args[0] == "accept") {
    yield* gifRepo.createGif(request.gifUrl, request.action!, request.gifType!);
    yield* Effect.tryPromise<OmitPartialGroupDMChannel<Message>, DiscordAPIError>(() =>
      request.message.edit("The owner accepted your request"),
    );
    yield* Effect.tryPromise<InteractionResponse, DiscordAPIError>(() =>
      interaction.update({
        content: `**ACCEPTED**\nGif check request from in <#${request.message.channel.id}> (${
          request.message.inGuild() ? request.message.channel.name : "DM"
        })\ngif: ${request.gifUrl}\naction: ${request.action}\ntype: ${request.gifType}`,
        components: [],
      }),
    );
    request.accepted = true;
    request.acceptedBy = interaction.user.username;
  } else if (args[0] == "reject") {
    yield* Effect.tryPromise<Message, DiscordAPIError>(() =>
      request.message.edit("The owner rejected your request"),
    );
    yield* Effect.tryPromise<InteractionResponse, DiscordAPIError>(() =>
      interaction.update({
        content: `**REJECTED**\nGif check request from in <#${request.message.channel.id}> (${
          request.message.inGuild() ? request.message.channel.name : "DM"
        })\ngif: ${request.gifUrl}\naction: ${request.action}\ntype: ${request.gifType}`,
        components: [],
      }),
    );
    request.accepted = false;
    request.acceptedBy = interaction.user.username;
  }
});
export default run;
