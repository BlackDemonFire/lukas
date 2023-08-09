import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Userdb {
  @PrimaryKey({ columnType: "text" })
  id!: string;

  @Property({ columnType: "text", nullable: true })
  giftype?: string;

  @Property({ columnType: "text", nullable: true })
  color?: string;

  @Property({ columnType: "text", nullable: true })
  name?: string;
}
