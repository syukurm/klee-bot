import type { Message } from "discord.js";
import { CommandInteraction } from "discord.js";
import type { SimpleCommandMessage } from "discordx";
import { Discord, SimpleCommand, Slash } from "discordx";

import type { Command } from "~interfaces/command";

@Discord()
export default class PingCommand implements Command {
  @SimpleCommand("ping", { description: "Ping the bot" })
  public async simpleCommand(command: SimpleCommandMessage): Promise<void> {
    await this.execute(command.message);
  }

  @Slash("ping", { description: "Ping the bot" })
  public async slash(interaction: CommandInteraction): Promise<void> {
    await this.execute(interaction);
  }

  public async execute(command: CommandInteraction | Message): Promise<void> {
    if (command instanceof CommandInteraction) {
      const sent = (await command.deferReply({ fetchReply: true })) as Message;
      await command.editReply(`🏓 Pong: Latency is ${sent.createdTimestamp - command.createdTimestamp}ms`);
    } else {
      const sent = await command.reply("Pinging...");
      await sent.edit(`🏓 Pong: Latency is ${sent.createdTimestamp - command.createdTimestamp}ms`);
    }
  }
}
