import { defineEntity, p } from "@mikro-orm/core";

const SettingsSchema = defineEntity({
  name: "Settings",
  properties: {
    id: p.text().primary().name("guild"),
    language: p.text().nullable(),
    autorollEnabled: p.boolean().default(false),
  },
});
export class Settings extends SettingsSchema.class {}

SettingsSchema.setClass(Settings);
