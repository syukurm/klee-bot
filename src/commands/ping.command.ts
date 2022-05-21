import type { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";

import { Command } from "../interfaces/command";

@Discord()
export default class Ping implements Command {
  @Slash("ping", { description: "Show bot ping" })
  public async run(interaction: CommandInteraction): Promise<void> {
    return interaction.reply(`Pong! Latency is ${interaction.client.ws.ping}ms.`);
  }
}
