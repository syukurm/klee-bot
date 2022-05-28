import type { Consola } from "consola";
import { ButtonInteraction, CommandInteraction, Message, UserContextMenuInteraction } from "discord.js";
import { ButtonComponent, ContextMenu, Discord, SimpleCommand, SimpleCommandMessage, Slash } from "discordx";

import HangmanGame from "~classes/HangmanGame";
import { CUSTOM_IDS } from "~constants/hangman.constant";
import type { Command } from "~interfaces/command";
import LoggerService from "~services/logger.service";

const SOMETHING_WENT_WRONG = "Something went wrong.";

@Discord()
export default class HangmanCommand implements Command {
  private games: Map<string, HangmanGame>;

  private logger: Consola;

  public constructor(loggerService: LoggerService) {
    this.logger = loggerService.logger.withScope("command").withTag("hangman");
    this.games = new Map();
  }

  @SimpleCommand("hangman", { description: "Play a game of hangman" })
  public async simpleCommand(command: SimpleCommandMessage): Promise<void> {
    await this.execute(command.message);
  }

  @ContextMenu("USER", "Hangman Game")
  @Slash("hangman", { description: "Play a game of hangman" })
  public async slash(interaction: CommandInteraction | UserContextMenuInteraction): Promise<void> {
    await this.execute(interaction);
  }

  public async execute(command: CommandInteraction | UserContextMenuInteraction | Message): Promise<void> {
    let game: HangmanGame;
    if (this.games.has(command.channelId)) {
      game = this.games.get(command.channelId) as HangmanGame;
      if (game.isPlaying) {
        await command.reply("Game is already in progress.");
        return;
      }
    } else {
      game = new HangmanGame();
      this.games.set(command.channelId, game);
    }
    await game.start(command);
  }

  private getGame(channelId: string): HangmanGame | undefined {
    return this.games.get(channelId);
  }

  @ButtonComponent(CUSTOM_IDS.HINT_BUTTON)
  public async handleHintButton(interaction: ButtonInteraction): Promise<void> {
    try {
      const game = this.getGame(interaction.channelId);
      await game?.giveAHint();
      await interaction.reply(`<@${interaction.user.id}> used a hint`);
    } catch (error) {
      this.logger.error(error);
      await interaction.reply({ ephemeral: true, content: SOMETHING_WENT_WRONG });
    }
  }

  @ButtonComponent(CUSTOM_IDS.GIVE_UP_BUTTON)
  public async handleGiveUpButton(interaction: ButtonInteraction): Promise<void> {
    try {
      const game = this.getGame(interaction.channelId);
      await game?.giveUp();
      await interaction.reply(`<@${interaction.user.id}> gave up`);
    } catch (error) {
      this.logger.error(error);
      await interaction.reply({ ephemeral: true, content: SOMETHING_WENT_WRONG });
    }
  }

  @ButtonComponent(CUSTOM_IDS.NEW_WORD_BUTTON)
  public async handleNewWordButton(interaction: ButtonInteraction): Promise<void> {
    try {
      const game = this.getGame(interaction.channelId);
      await game?.restart(interaction);
    } catch (error) {
      this.logger.error(error);
      await interaction.reply({ ephemeral: true, content: SOMETHING_WENT_WRONG });
    }
  }

  @ButtonComponent(CUSTOM_IDS.RESEND_BUTTON)
  public async handleResendButton(interaction: ButtonInteraction): Promise<void> {
    try {
      const game = this.getGame(interaction.channelId);
      await game?.resendInterface();
    } catch (error) {
      this.logger.error(error);
      await interaction.reply({ ephemeral: true, content: SOMETHING_WENT_WRONG });
    }
  }
}
