import { GuildChannel, Message, TextChannel } from "discord.js";
import type { language as lang } from "src/types";
import { Bot } from "../bot.js";
import { Command } from "../modules/command.js";
import logger from "../modules/logger.js";

export default class Purge extends Command {
    constructor(client: Bot) {
        super(client);
    }
    help = {
        show: false,
        name: "purge",
        usage: `${this.prefix}purge <amount>`,
        category: "Moderation",
    }
    run(_client: Bot, message: Message, args: string[], language: lang) {
        if (!this.hasPermission(message)) {
            message.channel.send(language.general.userPermissionError.replace("{}", language.permissions.MANAGE_MESSAGES));
            return;
        }
        if (!(message.channel instanceof GuildChannel)) return;
        if (!(message.guild!.me!.permissionsIn(message.channel).has("MANAGE_MESSAGES"))) {
            message.channel.send({ content: language.general.botPermissionError.replace("{}", language.permissions.MANAGE_MESSAGES) });
            return;
        }
        if (!(message.channel instanceof TextChannel)) return;
        let amount: number |undefined = undefined;
        try {
            amount = parseInt(args[0]);
        } catch (e) {
            message.channel.send({ content: language.command.purge.error.notNumeric });
            logger.error(e);
        }
        if (!amount) {
            message.channel.send({ content:language.command.purge.error.notNumeric });
            return;
        }
        message.channel.bulkDelete(amount);
    }
    hasPermission(message: Message): boolean {
        if (super.isOwner(message)) return true;
        if (!(message.channel instanceof GuildChannel)) return false;
        if (message.member?.permissionsIn(message.channel).has("MANAGE_MESSAGES")) return true;
        return false;
    }
    runSlash() {
        // TODO
    }
}