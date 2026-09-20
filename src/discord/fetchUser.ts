import { DiscordClient } from "@/Discord";
import type { DiscordAPIError, User, UserResolvable } from "discord.js";
import { Effect } from "effect";

export const fetchUser = Effect.fn("Discord.fetchUser")(function* (userResolvable: UserResolvable) {
  const client = yield* DiscordClient;
  return yield* Effect.tryPromise<User, DiscordAPIError>({
    try: () => client.users.fetch(userResolvable),
    catch: (e) => e as DiscordAPIError,
  }).pipe(Effect.option);
});
