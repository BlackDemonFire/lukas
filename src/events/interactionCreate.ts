import { BaseInteraction, ButtonInteraction } from "discord.js";
import { Bot } from "../bot.js";

export async function event(client: Bot, interaction: BaseInteraction) {
  if (interaction.isButton()) {
    handleButtonInteraction(client, interaction);
  }
}

async function handleButtonInteraction(
  client: Bot,
  interaction: ButtonInteraction,
) {
    const args: string[] = interaction.customId.split(".");
    const name: string = args.shift() || ""
    
    switch (name){
        case "newgif":
            if(args[0] == "accepted"){
                interaction.message.content
            }
    }
}
}