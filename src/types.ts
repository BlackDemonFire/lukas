import { Message } from "discord.js";
import { Effect } from "effect";
import type { ConfigError } from "effect/Config";
import type { MessageKey } from "./i18n/types";

export interface ICommand<out MetaE = ConfigError, out MetaR = never, out ExecE = never, out ExecR = never> {
  run: (message: Message<boolean>, args: string[]) => Effect.Effect<void, ExecE, ExecR>;
  readonly name: string;
  readonly summary: MessageKey;
  readonly usage: Effect.Effect<string, MetaE, MetaR>;
  readonly category: string;
  readonly hidden?: boolean;
}

export function declareCommand<MetaE, MetaR, ExecE, ExecR>(
  command: ICommand<MetaE, MetaR, ExecE, ExecR>,
): ICommand<MetaE, MetaR, ExecE, ExecR> {
  return command;
}
