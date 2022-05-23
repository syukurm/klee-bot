import { Consola } from "consola";
import type { ArgsOf, Client } from "discordx";
import { Discord, Once } from "discordx";
import ms from "ms";

import type Event from "~interfaces/event";
import LoggerService from "~services/logger.service";

@Discord()
export default class ReadyEvent implements Event {
  private readonly logger: Consola;

  public constructor(loggerService: LoggerService) {
    this.logger = loggerService.logger.withScope("Event").withTag("Ready");
  }

  @Once("ready")
  public async handle(_: ArgsOf<"ready">, client: Client): Promise<void> {
    await this.prepare(client);
    await this.startActivityUpdater(client);

    this.logger.success(`Logged in as ${client.user?.tag ?? ""}!`);
  }

  public async prepare(client: Client): Promise<void> {
    // Make sure all guilds are cached
    await client.guilds.fetch();

    await client.application?.fetch();

    // Synchronize applications commands with Discord
    await client.initApplicationCommands();

    // Synchronize applications command permissions with Discord
    await client.initApplicationPermissions();

    // To clear all guild commands, uncomment this line,
    // This is useful when moving from guild commands to global commands
    // It must only be executed once
    //
    //  await client.clearApplicationCommands(
    //    ...client.guilds.cache.map((g) => g.id)
    //  );
  }

  public async startActivityUpdater(client: Client): Promise<void> {
    setInterval(() => {
      client.guilds
        .fetch()
        .then(() => client.user?.setActivity({ type: "WATCHING", name: `${client.guilds.cache.size} servers` }))
        .catch((error) => this.logger.error(error));
    }, ms("5m"));
  }
}
