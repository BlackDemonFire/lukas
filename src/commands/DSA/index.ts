import type { ICommand } from "@/types.js";
import { DsaCommand } from "./dsa.js";
import { DsaAddCommand } from "./dsaadd.js";
import { DsaRmCommand } from "./dsarm.js";
import { NewCommand } from "./new.js";
import { RollCommand } from "./roll.js";

export const DSACommands = [DsaCommand, DsaAddCommand, DsaRmCommand, NewCommand, RollCommand] satisfies ICommand<
  unknown,
  unknown,
  unknown,
  unknown
>[];
