import { Migration } from "@mikro-orm/migrations";

export class Migration20260622203007 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`alter table "settings" add "autoroll_enabled" boolean not null default false;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "settings" drop column "autoroll_enabled";`);
  }
}
