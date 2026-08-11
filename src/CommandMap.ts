import type { Client, DiscordAPIError, DiscordjsRangeError, DiscordjsTypeError } from "discord.js";
import { Context, Deferred } from "effect";
import type { NoSuchElementError } from "effect/Cause";
import type { ConfigError } from "effect/Config";
import type { CurrentTimeZone } from "effect/DateTime";
import type { SchemaError } from "effect/Schema";
import type { CommandUsage } from "./CommandUsage";
import type { ChannelNotSendableError } from "./errors/ChannelNotSendable";
import type { I18n } from "./i18n/I18n";
import type { IRandom } from "./modules/random";
import type { DsaCharRepository } from "./repositories/DsaCharRepository";
import type { GifRepository } from "./repositories/GifRepository";
import type { SettingsRepository } from "./repositories/SettingsRepository";
import type { UserRepository } from "./repositories/UserRepository";
import type { ICommand } from "./types";

export class CommandMap extends Context.Service<
  CommandMap,
  {
    readonly map: ReadonlyMap<
      string,
      ICommand<
        ConfigError,
        never,
        | ConfigError
        | DiscordAPIError
        | NoSuchElementError
        | ChannelNotSendableError
        | SchemaError
        | DiscordjsRangeError
        | DiscordjsTypeError,
        | Deferred.Deferred<void, never>
        | Client
        | CommandMap
        | I18n
        | IRandom
        | UserRepository
        | GifRepository
        | DsaCharRepository
        | SettingsRepository
        | CommandUsage
        | CurrentTimeZone
      >
    >;
  }
>()("CommandMap") {}
