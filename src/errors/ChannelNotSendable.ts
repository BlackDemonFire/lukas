import type { Snowflake } from "discord.js";
import { Data } from "effect";

export class ChannelNotSendableError extends Data.TaggedError("ChannelNotSendable")<{ channelId: Snowflake }> {}
