import type { ArgsOf, Client } from "discordx";
import { Discord, On } from "discordx";

import type Event from "~interfaces/event";

@Discord()
export default class MessageCreateEvent implements Event {
  @On("messageCreate")
  public async handle([message]: ArgsOf<"messageCreate">, client: Client): Promise<void> {
    // Ignores bot messages
    if (message.author.bot) return;

    await client.executeCommand(message);
  }
}
