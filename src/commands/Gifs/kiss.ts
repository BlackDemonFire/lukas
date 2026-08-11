import { runMultiUserGifCommand } from "@/modules/command.js";
import { AppConfig } from "@/modules/settings";
import { declareCommand } from "@/types";
import type { Message } from "discord.js";
import { Effect } from "effect";

export const KissCommand = declareCommand({
  name: "kiss",
  usage: Effect.gen(function* () {
    const cfg = yield* AppConfig;
    return `${cfg.prefix}kiss [user]`;
  }),
  category: "Gifs",
  summary: "command.kiss.description",
  run: Effect.fn("KissCommand.run")(function* (message: Message, args: string[]) {
    yield* runMultiUserGifCommand(message, args, "kiss");
  }),
});
