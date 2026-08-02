import type { Command } from "@/modules/command.js";
import DsaCommand from "./dsa.js";
import DsaAddCommand from "./dsaadd.js";
import DsaRmCommand from "./dsarm.js";
import NewCommand from "./new.js";
import RollCommand from "./roll.js";

export const DSACommands: (typeof Command)[] = [DsaCommand, DsaAddCommand, DsaRmCommand, NewCommand, RollCommand];
