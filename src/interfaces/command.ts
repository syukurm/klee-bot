import type { CommandInteraction, Message } from "discord.js";
import type { SimpleCommandMessage } from "discordx";

export interface Command {
  execute(command: CommandInteraction | Message): Promise<void>;
  simpleCommand(command: SimpleCommandMessage): Promise<void>;
  slash(interaction: CommandInteraction): Promise<void>;
}
