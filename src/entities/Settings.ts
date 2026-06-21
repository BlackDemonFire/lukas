import { defineEntity, p } from "@mikro-orm/core";

const SettingsSchema = defineEntity({
  name: "Settings",
  properties: { id: p.text().primary().name("guild"), language: p.text().nullable() },
});
export class Settings extends SettingsSchema.class {}

SettingsSchema.setClass(Settings);
