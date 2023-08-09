import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Dsachars {
  @PrimaryKey({ columnType: "text" })
  prefix!: string;

  @Property({ columnType: "text", nullable: true })
  avatar?: string;

  @Property({ columnType: "text", nullable: true })
  displayname?: string;
}
