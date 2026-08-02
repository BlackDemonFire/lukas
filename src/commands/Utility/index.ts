import type { Command } from "@/modules/command.js";
import AddcolorCommand from "./addcolor.js";
import ColorCommand from "./color.js";
import GifactionCommand from "./gifactions.js";
import GiftypeCommand from "./giftype.js";
import HelpCommand from "./help.js";
import InfoCommand from "./info.js";
import LinkCommand from "./link.js";
import NameCommand from "./name.js";
import NewgifCommand from "./newgif.js";
import PingCommand from "./ping.js";
import RemovecolorCommand from "./removecolor.js";
import RemovegifCommand from "./removegif.js";
import SetcolorCommand from "./setcolor.js";

export const UtilityCommands: (typeof Command)[] = [
  AddcolorCommand,
  ColorCommand,
  GifactionCommand,
  GiftypeCommand,
  HelpCommand,
  InfoCommand,
  LinkCommand,
  NameCommand,
  NewgifCommand,
  PingCommand,
  RemovecolorCommand,
  RemovegifCommand,
  SetcolorCommand,
];
