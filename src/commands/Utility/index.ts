import type { ICommand } from "@/types.js";
import { AddcolorCommand } from "./addcolor.js";
import { ColorCommand } from "./color.js";
import { GifactionsCommand } from "./gifactions.js";
import { GiftypeCommand } from "./giftype.js";
import { HelpCommand } from "./help.js";
import { InfoCommand } from "./info.js";
import { LinkCommand } from "./link.js";
import { NameCommand } from "./name.js";
import { NewgifCommand } from "./newgif.js";
import { PingCommand } from "./ping.js";
import { RemoveColorCommand } from "./removecolor.js";
import { RemovegifCommand } from "./removegif.js";
import { SetcolorCommand } from "./setcolor.js";

export const UtilityCommands = [
  AddcolorCommand,
  ColorCommand,
  GifactionsCommand,
  GiftypeCommand,
  HelpCommand,
  InfoCommand,
  LinkCommand,
  NameCommand,
  NewgifCommand,
  PingCommand,
  RemoveColorCommand,
  RemovegifCommand,
  SetcolorCommand,
] satisfies ICommand<unknown, unknown, unknown, unknown>[];
