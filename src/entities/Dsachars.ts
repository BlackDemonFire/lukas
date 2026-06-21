import { defineEntity, p } from "@mikro-orm/core";

const DsacharsSchema = defineEntity({
  name: "Dsachars",
  properties: { prefix: p.text().primary(), avatar: p.text().nullable(), displayname: p.text().nullable() },
});

export class Dsachars extends DsacharsSchema.class {}

DsacharsSchema.setClass(Dsachars);
