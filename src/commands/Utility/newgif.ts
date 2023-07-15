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

function onCollect(
  reaction: MessageReaction,
  client: Bot,
  message: Message,
  url: string,
  action: string,
  type: string,
  collectors: Record<string, ReactionCollector>,
  requestmessages: Record<string, Message>,
) {
  if (!(client.application!.owner instanceof Team)) return;
  switch (reaction.emoji.name) {
    case "✅":
      client.db.newgif(url, action, type);
      for (const [memberid] of client.application!.owner.members) {
        collectors[memberid].stop();
        requestmessages[memberid].edit({
          content: `Gif check request from ${message.author.tag} in <#${
            message.channel.id
          }> (${
            message.channel instanceof GuildChannel
              ? message.channel.name
              : "DM"
          })\ngif: ${url}\naction: ${action}\ntype: ${type}\n\naccepted!`,
        });
      }
      break;
    case "❌":
      for (const [memberid] of client.application!.owner.members) {
        collectors[memberid].stop();
        requestmessages[memberid].edit({
          content: `Gif check request from ${message.author.tag} in <#${
            message.channel.id
          }> (${
            message.channel instanceof GuildChannel
              ? message.channel.name
              : "DM"
          })\ngif: ${url}\naction: ${action}\ntype: ${type}\n\nrejected!`,
        });
      }
      break;
    default:
      break;
  }
}

export default class Newgif extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  async run(client: Bot, message: Message, args: string[], language: lang) {
    let response: string;
    if (!args || args.length !== 3) {
      response = language.command.newgif.wrongArgs;
    } else {
      const url: string = args[0];
      const action: string = args[1].toLowerCase();
      let type: string = args[2].toLowerCase();
      if (!type || type == "") type = "anime";
      if (this.isOwner(message)) {
        client.db.newgif(url, action, type);
        response = language.command.newgif.success;
      } else {
        response = language.command.newgif.checking;
        if (client.application!.owner instanceof Team) {
          const requestmessages: Record<Snowflake, Message> = {};
          const collectors: Record<Snowflake, ReactionCollector> = {};
          for (const [memberid, member] of client.application!.owner.members) {
            requestmessages[memberid] = await member.user.send({
              content: `Gif check request from ${message.author.tag} in <#${
                message.channel.id
              }> (${
                message.channel instanceof GuildChannel
                  ? message.channel.name
                  : "DM"
              })\ngif: ${url}\naction: ${action}\ntype: ${type}`,
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
                  action,
                  type,
                  collectors,
                  requestmessages,
                ),
              );
          }
        } else if (client.application!.owner instanceof User) {
          const request = await client.application!.owner.send({
            content: `Gif check request from ${message.author.tag} in <#${
              message.channel.id
            }> (${
              message.channel instanceof GuildChannel
                ? message.channel.name
                : "DM"
            })\ngif: ${url}\naction: ${action}\ntype: ${type}`,
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
                client.db.newgif(url, action, type);
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
    usage: `${this.prefix}newgif <url> <command> [type (defaults to anime)]`,
  };
}
