import type { Command } from "@/modules/command.js";
import AutoRollCommand from "./autoroll.js";
import LangCommand from "./lang.js";

export const SettingsCommands: (typeof Command)[] = [AutoRollCommand, LangCommand];
