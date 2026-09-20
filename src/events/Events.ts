import type { Message, Interaction } from "discord.js";

export interface MessageCreateEvent {
  readonly _tag: "MessageCreate";
  readonly id: string;
  readonly message: Message;
}

export interface InteractionCreateEvent {
  readonly _tag: "InteractionCreate";
  readonly id: string;
  readonly interaction: Interaction;
}

export type Event = MessageCreateEvent | InteractionCreateEvent;
