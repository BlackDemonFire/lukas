import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Settings {
  @PrimaryKey({ columnType: "text", name: "guild" })
  id!: string;

  @Property({ columnType: "text", nullable: true })
  language?: string;
}
