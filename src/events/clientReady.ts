import { DiscordClient } from "@/DiscordGateway";
import { Team, User } from "discord.js";
import { Effect } from "effect";

export const event = Effect.gen(function* () {
  const client = yield* DiscordClient;
  yield* Effect.logInfo(
    `I'm Ready on ${client.guilds.cache.size} Servers serving ${client.channels.cache.size} Channels`,
  );
  client.application = yield* Effect.promise(() => client.application!.fetch());
  const owner = client.application.owner;
  let ownerstring = "someone unknown";
  if (owner instanceof User) ownerstring = owner.tag;
  if (owner instanceof Team)
    ownerstring = `a team consisting of ${owner.members.map((member) => member.user.tag).join(", ")}`;
  yield* Effect.logInfo(`I belong to ${ownerstring}.`);
});
