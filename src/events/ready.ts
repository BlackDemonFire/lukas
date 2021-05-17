import { Bot } from "bot";

export async function event(client: Bot) {
    console.log("I'm Ready on " + client.guilds.cache.size + " Servers serving " + client.channels.cache.size + " Channels");
    client.application = await client.fetchApplication();
}