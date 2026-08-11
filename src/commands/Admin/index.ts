import type { ICommand } from "@/types.js";
import { KillCommand } from "./kill.js";
import { PurgeCommand } from "./purge.js";

export const AdminCommands = [KillCommand, PurgeCommand] satisfies ICommand<unknown, unknown, unknown, unknown>[];
