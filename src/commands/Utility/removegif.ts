import {
  GuildChannel,
  Message,
  MessageReaction,
  ReactionCollector,
  Snowflake,
  Team,
  User,
} from "discord.js";
import type { ILanguage as lang } from "src/types";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import logger from "../../modules/logger.js";

function onCollect(
  reaction: MessageReaction,
  client: Bot,
  message: Message,
  url: string,
  collectors: Record<string, ReactionCollector>,
  requestmessages: Record<string, Message>,
) {
  logger.info("reaction!");
  if (!(client.application!.owner instanceof Team)) return;
  switch (reaction.emoji.name) {
    case "✅":
      client.db.removegif(url);
      for (const [memberid] of client.application!.owner.members) {
        collectors[memberid].stop();
        requestmessages[memberid].edit({
          content: `Gif remove request from ${message.author.tag} in <#${
            message.channel.id
          }> (${
            message.channel instanceof GuildChannel
              ? message.channel.name
              : "DM"
          })\nThe removal request was accepted!`,
        });
      }
      break;
    case "❌":
      for (const [memberid] of client.application!.owner.members) {
        collectors[memberid].stop();
        requestmessages[memberid].edit({
          content: `Gif remove request from ${message.author.tag} in <#${
            message.channel.id
          }> (${
            message.channel instanceof GuildChannel
              ? message.channel.name
              : "DM"
          })\nThe removal request was rejected!`,
        });
      }
      break;
    default:
      break;
  }
}

export default class Removegif extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  async run(client: Bot, message: Message, args: string[], language: lang) {
    let response: string;
    if (!args || args.length !== 1) {
      response = language.command.removegif.wrongArgs;
    } else {
      const url: string = args[0];
      if (this.isOwner(message)) {
        client.db.removegif(url);
        response = language.command.removegif.success;
      } else {
        response = language.command.removegif.checking;
        if (client.application!.owner instanceof Team) {
          const requestmessages: Record<Snowflake, Message> = {};
          const collectors: Record<Snowflake, ReactionCollector> = {};
          for (const [memberid, member] of client.application!.owner.members) {
            requestmessages[memberid] = await member.user.send({
              content: `Gif remove request from ${message.author.tag} in <#${
                message.channel.id
              }> (${
                message.channel instanceof GuildChannel
                  ? message.channel.name
                  : "DM"
              })\ngif: ${url}`,
            });
            await requestmessages[memberid].react("✅");
            await requestmessages[memberid].react("❌");
            collectors[memberid] = requestmessages[memberid]
              .createReactionCollector({
                filter: (_reaction: MessageReaction, user: User) =>
                  user == member.user,
              })
              .on("collect", (reaction) =>
                onCollect(
                  reaction,
                  client,
                  message,
                  url,
                  collectors,
                  requestmessages,
                ),
              );
          }
        } else if (client.application!.owner instanceof User) {
          const request = await client.application!.owner.send({
            content: `Gif remove request from ${message.author.tag} in <#${
              message.channel.id
            }> (${
              message.channel instanceof GuildChannel
                ? message.channel.name
                : "DM"
            })\ngif: ${url}`,
          });
          await request.react("✅");
          await request.react("❌");
          const coll = request.createReactionCollector({
            filter: (_reaction: MessageReaction, user: User) =>
              user == client.application!.owner,
          });
          coll.on("collect", (reaction: MessageReaction) => {
            switch (reaction.emoji.name) {
              case "✅":
                client.db.removegif(url);
                coll.stop();
                request.delete();
                break;
              case "❌":
                coll.stop();
                request.delete();
                break;
              default:
                break;
            }
          });
        }
      }
    }
    message.channel.send({ content: response });
  }
  help = {
    show: true,
    usage: `${this.prefix}removegif <url>`,
  };
}
