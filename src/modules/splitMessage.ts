// stolen from discord.js as they removed it

import { verifyString } from "discord.js";

/**
 * Options for splitting a message.
 */
interface SplitOptions {
  /**
   * Maximum character length per message piece
   * @default 2000
   */
  maxLength?: number;
  /**
   * Character(s) or Regex(es) to split the message with,
   * an array can be used to split multiple times
   * @default '\n'
   */
  char?: string | string[] | RegExp | RegExp[];
  /**
   * Text to prepend to every piece except the first
   * @default '''
   */
  prepend?: string;
  /**
   * Text to append to every piece except the lastu
   * @default '''
   */
  append?: string;
}

/**
 * Splits a string into multiple chunks at a designated character that do not exceed a specific length.
 * @param text Content to split
 * @param options Options controlling the behavior of the split
 */
export function splitMessage(
  text: string,
  { maxLength = 2_000, char = "\n", prepend = "", append = "" }: SplitOptions = {},
): string[] {
  text = verifyString(text);
  if (text.length <= maxLength) return [text];
  let splitText = [text];
  if (Array.isArray(char)) {
    while (char.length > 0 && splitText.some((elem) => elem.length > maxLength)) {
      const currentChar = char.shift();
      if (currentChar instanceof RegExp) {
        splitText = splitText.flatMap((chunk) => chunk.match(currentChar)!);
      } else {
        splitText = splitText.flatMap((chunk) => chunk.split(currentChar!));
      }
    }
  } else {
    splitText = text.split(char);
  }
  if (splitText.some((elem) => elem.length > maxLength)) throw new RangeError("SPLIT_MAX_LEN");
  const messages = [];
  let msg = "";
  for (const chunk of splitText) {
    if (msg && (msg + char.toString() + chunk + append).length > maxLength) {
      messages.push(msg + append);
      msg = prepend;
    }
    msg += (msg && msg !== prepend ? char.toString() : "") + chunk;
  }
  return messages.concat(msg).filter((m) => m);
}
