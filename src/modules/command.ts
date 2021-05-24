import { Bot } from "bot";
import { ClientApplication, Message, Team, User } from "discord.js";

abstract class Command {
    protected prefix: string;
    abstract help: command["help"];
    private client: Bot;
    constructor(client: Bot) {
        this.prefix = client.config.prefix;
        this.client = client;
    }
    abstract run(client: Bot, message: Message, args: string[], language: language)
    isAprilFools() {
        const date = new Date()
        let myDate = date.toLocaleDateString()
        let datesplit: string[] = myDate.split("/")
        let mon = datesplit.shift()
        let dom = datesplit.shift()
        return (dom == "1" && mon == "4")
    }
    isOwner(message: Message): boolean {
        var apk: ClientApplication = this.client.application;
        if (apk.owner instanceof Team) {
            return apk.owner.members.has(message.author.id);
        } else if (apk.owner instanceof User) {
            return apk.owner.id == message.author.id;
        }
        return false;
    }
}

abstract class GifCommand extends Command {
    constructor(client: Bot) {
        super(client);
    }
    async parseUser(client: Bot, message: Message, args: string[], language: language) {
        var userB: string = "";
        var mentioned: string[] = [];
        var self: boolean = false
        if (args && args.length > 0) {
            for (const arg of args) {
                var name: string;
                let ping = arg.match(/<@!?(\d+)>/);
                if (ping) {
                    let user = await client.users.fetch(ping[1]);
                    if (user) name = client.db.getname(user);
                    if (!user) {
                        name = arg;
                    } else if (!name || (name == "")) {
                        var member = message.guild ? message.guild.members.resolve(user) : null;
                        name = member ? member.displayName : user.username;
                    }
                    if (user == message.author) {
                        userB = "";
                        self = true;
                    }
                    mentioned.push(name);
                } else {
                    if (!arg || arg == "") { } else {
                        mentioned.push(arg);
                    }
                }
            }
            if (userB == "" && !self) {
                switch (mentioned.length) {
                    case 1:
                        userB = mentioned[0];
                        break;
                    case 2:
                        userB = mentioned.join(` ${language.general.and} `);
                        break;
                    default:
                        var last = mentioned.pop();
                        userB = mentioned.join(", ");
                        userB += ` ${language.general.and} `;
                        userB += last;
                        break;
                }
            }
        } else userB = "";
        if (userB.length > 1792) userB = userB.substring(0, 1792) + "...";
        return userB;
    }
}


export {
    Command,
    GifCommand
}