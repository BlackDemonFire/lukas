import { runSingleUserGifCommand } from "@/modules/command";
import { AppConfig } from "@/modules/settings";
import { declareCommand } from "@/types";
import type { Message } from "discord.js";
import { Effect } from "effect";

export const CryCommand = declareCommand({
  name: "cry",
  category: "Gifs",
  summary: "command.cry.description",
  usage: Effect.gen(function* () {
    const settings = yield* AppConfig;
    return settings.prefix + "cry";
  }),
  run: Effect.fn("CryCommand.run")(function* (message: Message, args: string[]) {
    yield* runSingleUserGifCommand(message, args, "cry");
  }),
});
