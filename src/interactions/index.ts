import { Layer } from "effect";
import runNewgif from "./newgif.js";
import runRemovegif from "./removegif.js";
import { InteractionMap } from "@/InteractionMap.js";

export const interactions = [
  { name: "newgif", run: runNewgif },
  { name: "removegif", run: runRemovegif },
];

export const InteractionMapLive = Layer.succeed(InteractionMap, {
  map: new Map(interactions.map(({ name, run }) => [name, run])),
});
