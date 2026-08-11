import { runMultiUserGifCommand } from "@/modules/command.js";
import { AppConfig } from "@/modules/settings";
import { declareCommand } from "@/types";
import type { Message } from "discord.js";
import { Effect } from "effect";

export const HoldCommand = declareCommand({
  name: "hold",
  usage: Effect.gen(function* () {
    const cfg = yield* AppConfig;
    return `${cfg.prefix}hold [user]`;
  }),
  category: "Gifs",
  summary: "command.hold.description",
  run: Effect.fn("HoldCommand.run")(function* (message: Message, args: string[]) {
    yield* runMultiUserGifCommand(message, args, "hold");
  }),
});
