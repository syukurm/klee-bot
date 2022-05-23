import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { CommandInteraction, Message } from "discord.js";
import type { SimpleCommandMessage } from "discordx";
import { Discord, SimpleCommand, Slash } from "discordx";

import type { Command } from "~interfaces/command";

dayjs.extend(relativeTime);

@Discord()
export default class UptimeCommand implements Command {
  @SimpleCommand("uptime", { description: "Get the bot's uptime" })
  public async simpleCommand(command: SimpleCommandMessage): Promise<void> {
    await this.execute(command.message);
  }

  @Slash("uptime", { description: "Show bot uptime" })
  public async slash(interaction: CommandInteraction): Promise<void> {
    await this.execute(interaction);
  }

  public async execute(command: CommandInteraction | Message): Promise<void> {
    const { uptime } = command.client;

    const time = uptime !== null ? dayjs().from(dayjs().millisecond(uptime)) : "Unknown";

    await command.reply(`Uptime: ${time}`);
  }
}
