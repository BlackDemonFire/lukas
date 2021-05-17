
import { Database, Statement } from "better-sqlite3";
import sqlite = require("better-sqlite3");
import { Guild, User } from "discord.js";

export class DB {
    private wal;
    protected db: Database;
    protected statements: Map<string, Statement> = new Map();
    constructor() {
        this.db = new sqlite("data/users.sqlite");
        const exists: Function = this.db.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = ?;").get;
        const dsacharstable = exists("dsachars");
        const settingstable = exists("settings");
        const usertable = exists("userdb");
        const giftable = exists("gifdb");
        if (!dsacharstable['count(*)']) {
            this.db.prepare("CREATE TABLE 'dsachars' (prefix text PRIMARY KEY, avatar text, displayname text);").run();
        }
        if (!settingstable['count(*)']) {
            this.db.prepare("CREATE TABLE 'settings' (guild text PRIMARY KEY, language text);").run();
        }
        if (!usertable['count(*)']) {
            this.db.prepare("CREATE TABLE 'userdb' (id text PRIMARY KEY, giftype text, color text, name text);").run();
        }
        if (!giftable['count(*)']) {
            this.db.prepare("CREATE TABLE 'gifdb' (url text PRIMARY KEY, giftype text, actiontype text);").run()
        }
        if (!giftable['count(*)'] && !usertable['count(*)'] && !settingstable['count(*)'] && !dsacharstable['count(*)']) {
            this.db.pragma('synchronous = 1')
            this.wal = this.db.pragma('journal_mode = wal')
        }
        this.statements.set("newuser", this.db.prepare("INSERT OR IGNORE INTO userdb VALUES (@id, @giftype, @color, @name);"));
        this.statements.set("setname", this.db.prepare("UPDATE userdb SET name = @name WHERE id = @id"));
        this.statements.set("setcolor", this.db.prepare("UPDATE userdb SET color = @color WHERE id = @id"));
        this.statements.set("setgiftype", this.db.prepare("UPDATE userdb SET giftype = @giftype WHERE id = @id"));
        this.statements.set("getname", this.db.prepare("SELECT name FROM userdb WHERE id = @id"));
        this.statements.set("getcolor", this.db.prepare("SELECT color FROM userdb WHERE id = @id"));
        this.statements.set("getgiftype", this.db.prepare("SELECT giftype FROM userdb WHERE id = @id"));
        this.statements.set("getgif", this.db.prepare("SELECT url FROM gifdb WHERE giftype = @giftype AND actiontype = @actiontype ORDER BY random() LIMIT 1;"));
        this.statements.set("newgif", this.db.prepare("INSERT OR IGNORE INTO gifdb VALUES (@url, @giftype, @actiontype);"));
        this.statements.set("newDSAChar", this.db.prepare("INSERT OR IGNORE INTO dsachars VALUES (@prefix, @avatar, @displayname)"));
        this.statements.set("getDSAChar", this.db.prepare("SELECT * FROM dsachars WHERE prefix = @prefix;"));
        this.statements.set("deleteDSAChar", this.db.prepare("DELETE * FROM dsachars WHERE prefix = @prefix;"));
        this.statements.set("setLang", this.db.prepare("UPDATE settings SET language = @language WHERE guild = @guild"));
        this.statements.set("getLang", this.db.prepare("SELECT language FROM settings WHERE guild = @guild;"));
        this.statements.set("initSettings", this.db.prepare("INSERT OR IGNORE INTO settings VALUES (@guild, @language);"));
    }
    newuser(user: User) {
        this.statements.get("newuser").run({ id: user.id, giftype: "anime", color: "RANDOM", name: "" });
    }
    setname(user: User, name: string) {
        this.statements.get("setname").run({ id: user.id, name: name });
    }
    setcolor(user: User, color: string) {
        this.statements.get("setcolor").run({ id: user.id, color: color });
    }
    setgiftype(user: User, giftype: string) {
        this.statements.get("setgiftype").run({ id: user.id, giftype: giftype });
    }
    getname(user: User) {
        var data = this.statements.get("getname").get({ id: user.id });
        return data ? data.name : "";
    }
    getcolor(user: User) {
        var data = this.statements.get("getcolor").get({ id: user.id });
        return data ? data.color : "RANDOM";
    }
    getgiftype(user: User) {
        var data = this.statements.get("getgiftype").get({ id: user.id });
        return data ? data.giftype : "anime";
    }
    getgif(action: string, type: string) {
        var data = this.statements.get("getgif").get({ giftype: type, actiontype: action });
        return data ? data.url : "";
    }
    newgif(url: string, action: string, type: string) {
        this.statements.get("newgif").run({ url: url, giftype: type, actiontype: action });
    }
    newDSAChar(prefix: string, displayname: string, avatar: string) {
        this.statements.get("newDSAChar").run({ prefix, avatar, displayname });
    }
    getDSAChar(prefix: string): dsachar | nil {
        return this.statements.get("getDSAChar").get({ prefix });
    }
    deleteDSAChar(prefix: string) {
        this.statements.get("deleteDSAChar").run({prefix});
    }
    setLang(guild: Guild, lang: string) {
        this.statements.get("setLang").run({ guild: guild.id, language: lang });
    }
    getLang(guild: Guild): string {
        var data = this.statements.get("getLang").get({ guild: guild.id });
        return data ? data.language : "";
    }
    initLang(guild: Guild, lang: string) {
        this.statements.get("initLang").run({ guild: guild.id, language: lang });
    }
}
