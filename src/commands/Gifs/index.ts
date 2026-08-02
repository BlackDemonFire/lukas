import type { Command } from "@/modules/command.js";
import BlushCommand from "./blush.js";
import CryCommand from "./cry.js";
import CuddleCommand from "./cuddle.js";
import HoldCommand from "./hold.js";
import HugCommand from "./hug.js";
import KissCommand from "./kiss.js";
import PatCommand from "./pat.js";
import PurrCommand from "./purr.js";

export const GifCommands: (typeof Command)[] = [
  BlushCommand,
  CryCommand,
  CuddleCommand,
  HoldCommand,
  HugCommand,
  KissCommand,
  PatCommand,
  PurrCommand,
];
