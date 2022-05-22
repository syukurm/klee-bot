import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { CommandInteraction, Message } from "discord.js";
import type { SimpleCommandMessage } from "discordx";
import { Discord, SimpleCommand, Slash } from "discordx";

import type { Command } from "../interfaces/command";

dayjs.extend(relativeTime);

@Discord()
export default class Uptime implements Command {
  @SimpleCommand("uptime", { description: "Get the bot's uptime" })
  public async simpleCommand(command: SimpleCommandMessage): Promise<void> {
    await this.execute(command.message);
  }

  @Slash("uptime", { description: "Show bot uptime" })
  public async slash(interaction: CommandInteraction): Promise<void> {
    await this.execute(interaction);
  }

  public async execute(interaction: CommandInteraction | Message): Promise<void> {
    const { uptime } = interaction.client;

    await (uptime === null
      ? interaction.reply("Uptime: unknown")
      : interaction.reply(`Uptime: ${dayjs().from(dayjs().millisecond(uptime))}`));
  }
}
