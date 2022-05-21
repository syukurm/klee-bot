import { Pagination } from "@discordx/pagination";
import type { CommandInteraction } from "discord.js";
import { MessageEmbed } from "discord.js";
import { Discord, MetadataStorage, Slash } from "discordx";
import type { Command } from "src/interfaces/command";

@Discord()
export default class Help implements Command {
  @Slash("help", { description: "Show all commands" })
  async run(interaction: CommandInteraction): Promise<void> {
    const commands = MetadataStorage.instance.applicationCommands.map(({ name, description }) => {
      return { name, description };
    });

    const pages = commands.map((command, index) => {
      return new MessageEmbed()
        .setFooter({ text: `Page ${index + 1} of ${commands.length}` })
        .setTitle("List of commands")
        .addField("Name", command.name)
        .addField("Description", command.description);
    });

    const pagination = new Pagination(interaction, pages);
    await pagination.send();
  }
}
