import { Intents } from "discord.js";
import { Client } from "discordx";

export default class Bot {
  private readonly client: Client;

  public readonly prefix = "!";

  public constructor() {
    this.client = new Client({
      // Enable partial structures
      partials: ["CHANNEL", "MESSAGE"],

      // Discord intents
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES],

      // Debug logs are disabled in silent mode
      silent: false,

      // Configuration for @SimpleCommand
      simpleCommand: {
        prefix: this.prefix,
        argSplitter: " ",
        responses: {
          notFound: `Command not found. ${this.prefix}help to show list of available commands.`,
          unauthorized: "You are not worthy enough to use this command.",
        },
      },
    });
  }

  public async login(token: string): Promise<void> {
    await this.client.login(token);
  }
}
