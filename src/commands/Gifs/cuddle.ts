import { runMultiUserGifCommand } from "@/modules/command.js";
import { AppConfig } from "@/modules/settings";
import { declareCommand } from "@/types";
import type { Message } from "discord.js";
import { Effect } from "effect";

export const CuddleCommand = declareCommand({
  name: "cuddle",
  usage: Effect.gen(function* () {
    const cfg = yield* AppConfig;
    return `${cfg.prefix}cuddle [user]`;
  }),
  category: "Gifs",
  run: Effect.fn("CuddleCommand.run")(function* (message: Message, args: string[]) {
    yield* runMultiUserGifCommand(message, args, "cuddle");
  }),
  summary: "command.cuddle.description",
});
