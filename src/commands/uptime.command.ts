import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";

import { Command } from "../interfaces/command";

dayjs.extend(relativeTime);

@Discord()
export default class Uptime implements Command {
  @Slash("uptime", { description: "Show bot uptime" })
  public async run(interaction: CommandInteraction): Promise<void> {
    const { uptime } = interaction.client;

    if (uptime === null) return interaction.reply("Uptime: unknown");

    return interaction.reply(`Uptime: ${dayjs().from(dayjs().millisecond(uptime))}`);
  }
}
