import { Consola } from "consola";
import { ClientUser, CommandInteraction, GuildMember, Message, User } from "discord.js";
import {
  Discord,
  SimpleCommand,
  SimpleCommandMessage,
  SimpleCommandOption,
  SimpleCommandOptionType,
  Slash,
  SlashOption,
} from "discordx";

import LoggerService from "~services/logger.service";

// import type { Command } from "~interfaces/command";

@Discord()
export default class DmCommand {
  private logger: Consola;

  public constructor(private readonly loggerService: LoggerService) {
    this.logger = this.loggerService.logger.withScope("command").withTag("dm");
  }

  @SimpleCommand("dm", { description: "Send a message to a user" })
  public async simpleCommand(
    @SimpleCommandOption("to", {
      description: "The user you want to send message to",
      type: SimpleCommandOptionType.User,
    })
    user: User | GuildMember | ClientUser | undefined,
    @SimpleCommandOption("message", {
      description: "The message you want to send",
      type: SimpleCommandOptionType.String,
    })
    message: string | undefined,
    command: SimpleCommandMessage
  ): Promise<void> {
    if (!command.isValid) {
      await command.sendUsageSyntax();
      return;
    }
    await this.execute(command.message, user, message);
  }

  @Slash("dm", { description: "Send a message to a user" })
  public async slash(
    @SlashOption("to", { description: "The user you want to send message to", type: "USER" })
    user: User | GuildMember | undefined,
    @SlashOption("message", { description: "The message you want to send", type: "STRING" })
    message: string | undefined,
    interaction: CommandInteraction
  ): Promise<void> {
    await this.execute(interaction, user, message);
  }

  public async execute(
    interaction: CommandInteraction | Message,
    user: User | GuildMember | undefined,
    message: string | undefined
  ): Promise<void> {
    try {
      if (user === undefined || message === undefined || user.id === interaction.client.user?.id)
        throw new Error("Invalid user or message");

      const dmChannel = await user.createDM();
      await dmChannel.send(message);
      await interaction.reply(`Message sent to <@${user.id}>`);
    } catch (error) {
      this.logger.error(error);
      await interaction.reply("Could not send message");
    }
  }
}
