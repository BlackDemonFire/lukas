import { CommandMap } from "@/CommandMap.js";
import { Layer } from "effect";
import { AdminCommands } from "./Admin/index.js";
import { DSACommands } from "./DSA/index.js";
import { GifCommands } from "./Gifs/index.js";
import { SettingsCommands } from "./Settings/index.js";
import { UtilityCommands } from "./Utility/index.js";

const commandList = [...AdminCommands, ...DSACommands, ...GifCommands, ...SettingsCommands, ...UtilityCommands];

const commands = new Map<string, (typeof commandList)[number]>();
for (const command of commandList) {
  commands.set(command.name, command);
}
export const CommandMapLive = Layer.succeed(CommandMap, { map: commands });
