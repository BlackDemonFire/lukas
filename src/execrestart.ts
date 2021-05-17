import { DMChannel, Message, TextChannel } from "discord.js";
import { Bot } from "./bot";
import { start } from "./startclient";

export function restart(oldclient: Bot, restartmsg: Message, newtext: string) {

    //Neuen Client Herstellen

    const newclient = start();
    newclient.login(newclient.config.token);

    //Alten client Entfernen

    newclient.once('ready', async () => {
        for (const key of Object.keys(require.cache)) {
            if (key.indexOf("node_modules") == -1) {
                delete require.cache[key]
            }
        };

        oldclient.destroy();

        console.log("swapped clients");
        console.log(" ")

        if (restartmsg) {
            let channel = newclient.channels.resolve(restartmsg.channel.id)
            if (channel instanceof TextChannel || channel instanceof DMChannel) {
                let editMsg = await channel.messages.fetch(restartmsg.id)
                editMsg.edit(newtext);
            }
        }

    }); //client.once("ready")
}