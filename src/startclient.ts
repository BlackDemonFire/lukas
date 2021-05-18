import { Intents } from "discord.js";
import { readdir } from "fs";
import { Bot } from "./bot";

export function start() {
    const client: Bot = new Bot({ intents: Intents.NON_PRIVILEGED });
    readdir("./out/events", (err, files) => {
        if (err) return console.error(err);
        files.forEach((file: string) => {
            if (!file.endsWith(".js")) return;
            const event = require(`./events/${file.split(".")[0]}`);
            let eventName = file.split(".")[0];
            client.on(eventName, event.event.bind(null, client));
        });
    });

    readdir("./out/commands", (err, files) => {
        if (err) return console.error(err);
        files.forEach((file: string) => {
            if (!file.endsWith(".js")) return;
            let cmd = require(`./commands/${file.split(".")[0]}`);
            let commandName = file.split(".")[0];
            console.log(`Attempting to load command ${commandName}`);
            client.commands.set(commandName, new cmd.default(client));
        });
    });

    readdir("./languages", (err, files) => {
        if (err) return console.error(err);
        files.forEach((file: string) => {
            if (!file.endsWith(".json")) return;
            let lang: language = require(`../languages/${file}`);
            let langName = file.split(".")[0];
            console.log(`Registering Language ${langName}`);
            client.languages.set(langName, lang);
        })
    })
    return client;
}
