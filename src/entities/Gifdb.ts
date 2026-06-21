import { defineEntity, p } from "@mikro-orm/core";

const GifdbSchema = defineEntity({
  name: "Gifdb",
  properties: { url: p.text().primary(), giftype: p.text().nullable(), actiontype: p.text().nullable() },
});
export class Gifdb extends GifdbSchema.class {}

GifdbSchema.setClass(Gifdb);
