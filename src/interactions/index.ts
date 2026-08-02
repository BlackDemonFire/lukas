import runNewgif from "./newgif.js";
import runRemovegif from "./removegif.js";

export const interactions = [
  { name: "newgif", run: runNewgif },
  { name: "removegif", run: runRemovegif },
];
