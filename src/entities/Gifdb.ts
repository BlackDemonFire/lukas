import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Gifdb {
  @PrimaryKey({ columnType: "text" })
  url!: string;

  @Property({ columnType: "text", nullable: true })
  giftype?: string;

  @Property({ columnType: "text", nullable: true })
  actiontype?: string;
}
