import { runMultiUserGifCommand } from "@/modules/command.js";
import { AppConfig } from "@/modules/settings";
import { declareCommand } from "@/types";
import type { Message } from "discord.js";
import { Effect } from "effect";

export const HugCommand = declareCommand({
  name: "hug",
  usage: Effect.gen(function* () {
    const cfg = yield* AppConfig;
    return `${cfg.prefix}hug [user]`;
  }),
  category: "Gifs",
  summary: "command.hug.description",
  run: Effect.fn("HugCommand.run")(function* (message: Message, args: string[]) {
    yield* runMultiUserGifCommand(message, args, "hug");
  }),
});
