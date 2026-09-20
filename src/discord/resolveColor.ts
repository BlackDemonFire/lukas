import {
  DiscordjsRangeError,
  DiscordjsTypeError,
  resolveColor as djsResolveColor,
  type ColorResolvable,
} from "discord.js";
import { Effect } from "effect";

export const resolveColor = (color: ColorResolvable) =>
  Effect.try<number, DiscordjsRangeError | DiscordjsTypeError>({
    try: () => djsResolveColor(color),
    catch: (e) => e as DiscordjsRangeError | DiscordjsTypeError,
  });
