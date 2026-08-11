import { runSingleUserGifCommand } from "@/modules/command.js";
import { AppConfig } from "@/modules/settings";
import { declareCommand } from "@/types";
import type { Message } from "discord.js";
import { Effect } from "effect";

export const PurrCommand = declareCommand({
  name: "purr",
  usage: Effect.gen(function* () {
    const cfg = yield* AppConfig;
    return `${cfg.prefix}purr [user]`;
  }),
  category: "Gifs",
  summary: "command.purr.description",
  run: Effect.fn("PurrCommand.run")(function* (message: Message, args: string[]) {
    yield* runSingleUserGifCommand(message, args, "purr");
  }),
});
