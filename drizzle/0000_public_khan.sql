CREATE TABLE IF NOT EXISTS "dsachars" (
	"prefix" text NOT NULL,
	"avatar" text,
	"displayname" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gifdb" (
	"url" text NOT NULL,
	"giftype" text,
	"actiontype" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "settings" (
	"guild" text PRIMARY KEY NOT NULL,
	"language" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "userdb" (
	"id" text PRIMARY KEY NOT NULL,
	"giftype" text,
	"color" text,
	"name" text
);
