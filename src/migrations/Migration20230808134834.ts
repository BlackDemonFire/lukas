import { Migration } from "@mikro-orm/migrations";

export class Migration20230808134834 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "dsachars" ("prefix" text not null, "avatar" text null, "displayname" text null, constraint "dsachars_pkey" primary key ("prefix"));',
    );

    this.addSql(
      'create table "gifdb" ("url" text not null, "giftype" text null, "actiontype" text null, constraint "gifdb_pkey" primary key ("url"));',
    );

    this.addSql(
      'create table "settings" ("guild" text not null, "language" text null, constraint "settings_pkey" primary key ("guild"));',
    );

    this.addSql(
      'create table "userdb" ("id" text not null, "giftype" text null, "color" text null, "name" text null, constraint "userdb_pkey" primary key ("id"));',
    );
  }
}
