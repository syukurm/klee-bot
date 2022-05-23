import {
  ButtonInteraction,
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageButton,
  Modal,
  ModalActionRowComponent,
  ModalSubmitInteraction,
  TextInputComponent,
} from "discord.js";
import { ButtonComponent, Discord, ModalComponent, SimpleCommand, SimpleCommandMessage, Slash } from "discordx";

import type { Command } from "~interfaces/command";
import ConfigService from "~services/config.service";

@Discord()
export default class SuggestionCommand implements Command {
  private SUGGESTION_FIELD_ID = "suggestionField";

  private SUGGESTION_MODAL_ID = "suggestionModal";

  private SEND_SUGGESTION_BTN_ID = "send-suggestion-btn";

  public constructor(private readonly configService: ConfigService) {}

  @SimpleCommand("suggestion", { description: "Send suggestion to the developer" })
  public async simpleCommand(command: SimpleCommandMessage): Promise<void> {
    await this.execute(command.message);
  }

  @Slash("suggestion", { description: "Send suggestion to the developer" })
  public async slash(interaction: CommandInteraction): Promise<void> {
    await this.execute(interaction);
  }

  public async execute(interaction: CommandInteraction | Message): Promise<void> {
    if (interaction instanceof CommandInteraction) {
      const modal = this.createSuggestionModal();
      await interaction.showModal(modal);
    } else {
      const row = new MessageActionRow().addComponents(this.createSendSuggestionBtn());
      await interaction.reply({ content: "Send feedback or suggest a feature :>", components: [row] });
    }
  }

  @ButtonComponent("send-suggestion-btn")
  public async sendSuggestionBtnHandler(interaction: ButtonInteraction): Promise<void> {
    const modal = this.createSuggestionModal();

    await interaction.showModal(modal);
  }

  @ModalComponent("suggestionModal")
  public async modalSubmitHandler(interaction: ModalSubmitInteraction): Promise<void> {
    const suggestion = interaction.fields.getTextInputValue(this.SUGGESTION_FIELD_ID);

    const owner = await interaction.client.users.fetch(
      interaction.client.application?.owner?.id ?? this.configService.ownerId
    );
    await owner.send(`💡 Suggestion from ${interaction.user.tag}:\n${suggestion}`);

    await interaction.reply(`Thank you for your input, <@${interaction.user.id}>`);
  }

  public createSuggestionModal(): Modal {
    const modal = new Modal().setTitle("Suggestion Form").setCustomId(this.SUGGESTION_MODAL_ID);

    // Create text input fields
    const suggestionInputComponent = new TextInputComponent()
      .setCustomId(this.SUGGESTION_FIELD_ID)
      .setLabel("Suggestion")
      .setStyle("PARAGRAPH");

    const row1 = new MessageActionRow<ModalActionRowComponent>().addComponents(suggestionInputComponent);

    // Add action rows to form
    modal.addComponents(row1);

    return modal;
  }

  public createSendSuggestionBtn(): MessageButton {
    return new MessageButton()
      .setLabel("Send Suggestion")
      .setEmoji("💡")
      .setStyle("PRIMARY")
      .setCustomId(this.SEND_SUGGESTION_BTN_ID);
  }
}
