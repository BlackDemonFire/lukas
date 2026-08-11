import { runSingleUserGifCommand } from "@/modules/command";
import { AppConfig } from "@/modules/settings";
import { declareCommand } from "@/types";
import type { Message } from "discord.js";
import { Effect } from "effect";

export const BlushCommand = declareCommand({
  name: "blush",
  category: "Gifs",
  usage: Effect.gen(function* () {
    const settings = yield* AppConfig;
    return settings.prefix + "blush";
  }),
  summary: "command.blush.description",
  run: Effect.fn("BlushCommand.run")(function* (message: Message, args: string[]) {
    yield* runSingleUserGifCommand(message, args, "blush");
  }),
});
