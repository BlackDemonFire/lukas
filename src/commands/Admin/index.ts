import type { Command } from "@/modules/command.js";
import EvalCommand from "./eval.js";
import KillCommand from "./kill.js";
import PurgeCommand from "./purge.js";
import RestartCommand from "./restart.js";

export const AdminCommands: (typeof Command)[] = [EvalCommand, KillCommand, PurgeCommand, RestartCommand];
