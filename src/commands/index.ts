import type { Command } from "@/modules/command.js";
import { AdminCommands } from "./Admin/index.js";
import { DSACommands } from "./DSA/index.js";
import { GifCommands } from "./Gifs/index.js";
import { SettingsCommands } from "./Settings/index.js";
import { UtilityCommands } from "./Utility/index.js";

export const allCommands: (typeof Command)[] = AdminCommands.concat(DSACommands)
  .concat(GifCommands)
  .concat(SettingsCommands)
  .concat(UtilityCommands);
