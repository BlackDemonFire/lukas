import type { ICommand } from "@/types.js";
import { AutoRollCommand } from "./autoroll.js";
import { LangCommand } from "./lang.js";

export const SettingsCommands = [AutoRollCommand, LangCommand] satisfies ICommand<unknown, unknown, unknown, unknown>[];
