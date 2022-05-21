import type { Interaction, Message } from "discord.js";
import { Intents } from "discord.js";
import { Client } from "discordx";
import { Service } from "typedi";

import LoggerService from "./services/logger.service";

@Service()
export default class Bot {
  public client: Client;

  public constructor(private readonly loggerService: LoggerService) {
    this.client = new Client({
      // To only use global commands (use @Guild for specific guild command), comment this line
      botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

      partials: ["CHANNEL", "MESSAGE"],

      // Discord intents
      intents: [
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES,
      ],

      // Debug logs are disabled in silent mode
      silent: false,

      // Configuration for @SimpleCommand
      simpleCommand: {
        prefix: "!",
      },
    });
  }

  public async login(token: string): Promise<void> {
    const { logger } = this.loggerService;

    this.client.once("ready", async () => {
      // Make sure all guilds are cached
      await this.client.guilds.fetch();

      await this.client.application?.fetch();

      // Synchronize applications commands with Discord
      await this.client.initApplicationCommands();

      // Synchronize applications command permissions with Discord
      await this.client.initApplicationPermissions();

      // To clear all guild commands, uncomment this line,
      // This is useful when moving from guild commands to global commands
      // It must only be executed once
      //
      //  await this.client.clearApplicationCommands(
      //    ...this.client.guilds.cache.map((g) => g.id)
      //  );
      // const owner = await this.client.users.fetch(this.client.application!.owner!.id);
      logger.info(`Logged in as ${this.client.user?.tag ?? ""}!`);
    });

    this.client.on("interactionCreate", (interaction: Interaction) => {
      this.client.executeInteraction(interaction);
    });

    this.client.on("messageCreate", async (message: Message) => {
      // Ignores bot messages
      if (message.author.bot) return;

      logger.info(message.content);
      await this.client.executeCommand(message);
    });

    await this.client.login(token);
  }
}
