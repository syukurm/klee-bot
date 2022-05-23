import { Pagination } from "@discordx/pagination";
import type { CommandInteraction, Message } from "discord.js";
import { MessageEmbed } from "discord.js";
import type { SimpleCommandMessage } from "discordx";
import { Discord, MetadataStorage, SimpleCommand, Slash } from "discordx";

import type { Command } from "~interfaces/command";

@Discord()
export default class HelpCommand implements Command {
  @Slash("help", { description: "Show all available commands" })
  public async slash(interaction: CommandInteraction): Promise<void> {
    await this.execute(interaction);
  }

  @SimpleCommand("help", { description: "Show all available commands" })
  public async simpleCommand(command: SimpleCommandMessage): Promise<void> {
    await this.execute(command.message);
  }

  public async execute(command: CommandInteraction | Message): Promise<void> {
    const commands = MetadataStorage.instance.applicationCommands.map(({ name, description }) => {
      return { name, description };
    });

    const pages = commands.map(({ name, description }, index) => {
      return new MessageEmbed()
        .setFooter({ text: `Page ${index + 1} of ${commands.length}` })
        .setTitle("List of commands")
        .addField("Name", name)
        .addField("Description", description);
    });

    const pagination = new Pagination(command, pages);
    await pagination.send();
  }
}
