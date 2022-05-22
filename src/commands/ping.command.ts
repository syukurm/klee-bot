import type { CommandInteraction, Message } from "discord.js";
import { Discord, SimpleCommand, SimpleCommandMessage, Slash } from "discordx";

import { Command } from "../interfaces/command";

@Discord()
export default class Ping implements Command {
  @SimpleCommand("ping", { description: "Ping the bot" })
  public async simpleCommand(command: SimpleCommandMessage): Promise<void> {
    await this.execute(command.message);
  }

  @Slash("ping", { description: "Ping the bot" })
  public async slash(interaction: CommandInteraction): Promise<void> {
    await this.execute(interaction);
  }

  public async execute(interaction: CommandInteraction | Message): Promise<void> {
    await interaction.reply(`Pong! Latency is ${interaction.client.ws.ping}ms.`);
  }
}
