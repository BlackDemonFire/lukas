import type { MessageKey } from "@/i18n/types.js";

export const enTde = {
  "command.roll.description":
    "Wirf einen Würfel - standardmäßig wird 1 w6 verwendet. Um andere Würfel zu verwenden verwende [Anzahl]w[Würfeltyp]",
  "command.roll.errors.tooManyArgs":
    "Fehler: zu viele Argumente. Nur Würfeltyp und Würfelzahl sind erlaubt. Dieses Argument ist zu viel: ",
  "command.roll.errors.doubleDiceType": "Fehler: Das Argument `Würfeltyp` ist doppelt angegeben.",
  "command.roll.errors.doubleRollCount": "Fehler: Das Argument `Anzahl` ist doppelt angegeben.",
  "command.roll.errors.schroedingersArgument":
    "Sehr merkwürdiger Fehler: Schrödingers Argument - `Würfeltyp` ist definiert und nicht definiert.",
  "command.roll.errors.noDiceType":
    "Fehler: Nach dem validieren der Argumente ist immer noch kein Würfeltyp festgelegt.",
  "command.roll.errors.noSides": "Fehler: Du hast versucht, mit einem seitenlosen Würfel zu würfeln.",
  "command.roll.errors.rolltypeUndefined": "Fehler: Der Würfeltyp ist nicht definiert.",
  "command.roll.errors.tooManyDice": "Der Tisch ist zu klein für so viele Würfel. Es sind maximal 70 Würfel erlaubt",
  "command.roll.errors.rollcountNotNumeric":
    "Es wäre sinnvoll, eine Zahl und keine Buchstabensammlung an Würfeln anzugeben.",
  "command.roll.errors.rolltypeNotNumeric":
    "Es wäre sinnvoll, eine Zahl und keine Buchstabensammlung an Würfelseiten anzugeben.",
  "command.roll.results.noDice.plaintext":
    "...und {msgauthor} hörte leise wie der Wind über den leeren Tisch strich, auf dem nicht ein Würfel zu sehen war...",
  "command.roll.results.noDice.embed":
    "Wenn du ein Ergebnis erhalten möchtest, wäre es vermutlich sinnvoll, das nächste mal auch einen Würfel zu werfen.",
  "command.roll.results.singleDice": "es wurde mit einem {rolltype}-seitigen Würfel gewürfelt.",
  "command.roll.results.multiDice": "es wurde mit {rollcountmax} {rolltype}-seitigen Würfeln gewürfelt.",
} satisfies Partial<Record<MessageKey, string | string[]>>;
