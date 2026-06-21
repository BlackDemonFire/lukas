import { defineEntity, p } from "@mikro-orm/core";

const UserdbSchema = defineEntity({
  name: "Userdb",
  properties: {
    id: p.text().primary(),
    giftype: p.string().nullable(),
    color: p.string().nullable(),
    name: p.string().nullable(),
  },
});
export class Userdb extends UserdbSchema.class {}
UserdbSchema.setClass(Userdb);
