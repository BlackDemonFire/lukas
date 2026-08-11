import { runMultiUserGifCommand } from "@/modules/command.js";
import { AppConfig } from "@/modules/settings";
import { declareCommand } from "@/types";
import type { Message } from "discord.js";
import { Effect } from "effect";

export const PatCommand = declareCommand({
  name: "pat",
  usage: Effect.gen(function* () {
    const cfg = yield* AppConfig;
    return `${cfg.prefix}pat [user]`;
  }),
  category: "Gifs",
  summary: "command.pat.description",
  run: Effect.fn("PatCommand.run")(function* (message: Message, args: string[]) {
    yield* runMultiUserGifCommand(message, args, "pat");
  }),
});
