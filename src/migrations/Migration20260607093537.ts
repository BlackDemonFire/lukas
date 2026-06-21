import { Migration } from "@mikro-orm/migrations";

export class Migration20260607093537 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`alter table "userdb" alter column "giftype" type varchar(255) using ("giftype"::varchar(255));`);
    this.addSql(`alter table "userdb" alter column "color" type varchar(255) using ("color"::varchar(255));`);
    this.addSql(`alter table "userdb" alter column "name" type varchar(255) using ("name"::varchar(255));`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "userdb" alter column "giftype" type text using ("giftype"::text);`);
    this.addSql(`alter table "userdb" alter column "color" type text using ("color"::text);`);
    this.addSql(`alter table "userdb" alter column "name" type text using ("name"::text);`);
  }
}
