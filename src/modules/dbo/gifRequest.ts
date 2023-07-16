import { Message } from "discord.js";

class GifRequest {
  message: Message;
  messageId: string;
  channelId: string;
  gifUrl: string;
  action: string;
  gifType: string;
  accepted: boolean | undefined;
  acceptedBy: string | undefined;

  constructor(
    message: Message,
    messageId: string,
    channelId: string,
    gifUrl: string,
    action: string,
    gifType: string,
  ) {
    this.message = message;
    this.messageId = messageId;
    this.channelId = channelId;
    this.gifType = gifType;
    this.gifUrl = gifUrl;
    this.action = action;
  }
}

const activeRequests = new Map<string, GifRequest>();

export { activeRequests, GifRequest };
