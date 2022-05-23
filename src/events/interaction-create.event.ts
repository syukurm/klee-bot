import type { ArgsOf, Client } from "discordx";
import { Discord, On } from "discordx";

import type Event from "~interfaces/event";

@Discord()
export default class InteractionCreateEvent implements Event {
  @On("interactionCreate")
  public handle([interaction]: ArgsOf<"interactionCreate">, client: Client): void {
    client.executeInteraction(interaction);
  }
}
