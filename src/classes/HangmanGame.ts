import {
  ButtonInteraction,
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageButton,
  MessageCollector,
  MessageEmbed,
  UserContextMenuInteraction,
} from "discord.js";
import noop from "lodash/noop";
import shuffle from "lodash/shuffle";
import ms from "ms";

import { CUSTOM_IDS, hangmanImagesUrl } from "~constants/hangman.constant";
import wordlist from "~constants/wordlist.constant";

interface HangmanGameOptions {
  maxHints: number;
  maxMisses: number;
}

export default class HangmanGame {
  private readonly correctCharacters = new Set<string>();

  private readonly colors = {
    IN_PROGRESS: "#60A5FA",
    WON: "#22C55E",
    LOST: "#ef4444",
    OUT_OF_TIME: "#475569",
    NOT_PLAYING: "#475569",
  } as const;

  private hintUsedCount = 0;

  private interface?: Message | void;

  private state: "NOT_PLAYING" | "IN_PROGRESS" | "WON" | "LOST" | "OUT_OF_TIME" = "NOT_PLAYING";

  private timeStarted?: Date;

  private collector: MessageCollector | undefined;

  private word = "nothing";

  private readonly wrongCharacters = new Set<string>();

  public constructor(public readonly options: HangmanGameOptions = { maxMisses: 9, maxHints: 1 }) {}

  public async start(
    interaction: CommandInteraction | UserContextMenuInteraction | Message | ButtonInteraction
  ): Promise<void> {
    this.state = "IN_PROGRESS";
    this.timeStarted = new Date();
    this.word = this.generateRandomWord();
    await (interaction instanceof ButtonInteraction
      ? interaction.reply(`Starting a new game <@${interaction.user.id}>`)
      : interaction.reply("Starting a new game"));

    this.interface = await interaction.channel?.send("Loading...");

    const alphabet = /^[A-Za-z]+$/;

    this.collector = interaction.channel?.createMessageCollector({
      time: ms("5m"),
      filter: (message) => alphabet.test(message.content),
    });

    this.collector?.on("collect", async ({ content }) => {
      await this.processInput(content);
    });

    this.collector?.on("end", async () => {
      if (this.state === "IN_PROGRESS") {
        this.state = "OUT_OF_TIME";
        await this.updateInterface().catch(noop);
      }
    });

    await this.updateInterface();
  }

  public async restart(interaction: ButtonInteraction): Promise<void> {
    if (this.state === "IN_PROGRESS") {
      await this.giveUp();
    }
    await this.start(interaction);
  }

  public async giveUp(): Promise<void> {
    this.state = "LOST";
    await this.updateInterface();
  }

  private generateRandomWord(): string {
    const randomWord = wordlist[Math.floor(Math.random() * wordlist.length)] ?? "nothing";
    return randomWord.toLowerCase();
  }

  private async processInput(input: string): Promise<void> {
    if (input === this.word) {
      [...input].forEach((letter) => this.correctCharacters.add(letter));
    } else if (input.length === 1) {
      if (this.word.includes(input)) {
        this.correctCharacters.add(input);
      } else {
        this.wrongCharacters.add(input);
      }
    }
    await this.check();
  }

  private async check(): Promise<void> {
    if (this.hasWordBeenGuessed) {
      this.state = "WON";
    } else if (this.isThereNoMoreGuessesLeft) {
      this.state = "LOST";
    }
    await this.updateInterface();
  }

  private createEmbed(): MessageEmbed {
    const wordText = [...this.word]
      .map((letter) => {
        return this.correctCharacters.has(letter) ? letter : "\\_";
      })
      .join(" ");

    const embed = new MessageEmbed()
      .setColor(this.colors[this.state])
      .setTitle("Hangman Game")
      .addField("Guess the word", wordText)
      .setImage(hangmanImagesUrl[this.guessesLeft] ?? hangmanImagesUrl[9])
      .setTimestamp(this.timeStarted)
      .setFooter({ text: `${this.guessesLeft} guesses left • ${this.word.length} letters` });

    if (this.wrongGuessesCount > 0) {
      embed.addField("Wrong characters:", [...this.wrongCharacters].join(" "));
    }

    switch (this.state) {
      case "WON":
        embed.setAuthor({ name: `Game has ended, you guessed the word` });
        break;

      case "LOST":
        embed.setAuthor({ name: `Game has ended, the word was ${this.word}` });
        break;

      case "OUT_OF_TIME":
        embed.setAuthor({ name: `Game has ended` });
        break;

      default:
        break;
    }

    return embed;
  }

  private createHintButton(): MessageButton {
    return new MessageButton()
      .setLabel("Hint")
      .setEmoji("💡")
      .setStyle("SUCCESS")
      .setCustomId(CUSTOM_IDS.HINT_BUTTON)
      .setDisabled(!this.isHintAvailable || this.state !== "IN_PROGRESS");
  }

  private createGiveUpButton(): MessageButton {
    return new MessageButton()
      .setLabel("Give Up")
      .setEmoji("🖐️")
      .setStyle("DANGER")
      .setCustomId(CUSTOM_IDS.GIVE_UP_BUTTON)
      .setDisabled(this.state !== "IN_PROGRESS");
  }

  private createNewWordButton(): MessageButton {
    return new MessageButton()
      .setLabel("New Word")
      .setEmoji("🆕")
      .setStyle("PRIMARY")
      .setCustomId(CUSTOM_IDS.NEW_WORD_BUTTON);
  }

  private createResendButton(): MessageButton {
    return new MessageButton()
      .setLabel("Resend")
      .setEmoji("🔁")
      .setStyle("SECONDARY")
      .setCustomId(CUSTOM_IDS.RESEND_BUTTON)
      .setDisabled(this.state !== "IN_PROGRESS");
  }

  private createButtonsRow(): MessageActionRow {
    const hintButton = this.createHintButton();
    const giveUpButton = this.createGiveUpButton();
    const newWordButton = this.createNewWordButton();
    const resendButton = this.createResendButton();

    return new MessageActionRow().addComponents(hintButton, giveUpButton, newWordButton, resendButton);
  }

  public async giveAHint(): Promise<void> {
    if (this.state === "IN_PROGRESS" && this.isHintAvailable) {
      this.hintUsedCount += 1;
      const hint = shuffle([...this.word]).find((letter) => !this.correctCharacters.has(letter));
      if (hint !== undefined) this.correctCharacters.add(hint);
      await this.resendInterface();
    }
  }

  private async updateInterface(): Promise<void> {
    const embeds = [this.createEmbed()];
    const components = [this.createButtonsRow()];
    await this.interface?.edit({ content: null, embeds, components });

    if (this.state !== "IN_PROGRESS") {
      this.collector?.stop();
      this.reset();
    }
  }

  public async resendInterface(): Promise<void> {
    const oldInterface = this.interface;
    this.interface = await this.interface?.channel?.send("Loading...");
    await oldInterface?.delete();
    await this.check();
  }

  private get guessesLeft(): number {
    return this.options.maxMisses - this.wrongGuessesCount;
  }

  private get isThereNoMoreGuessesLeft(): boolean {
    return this.wrongGuessesCount >= this.options.maxMisses;
  }

  private get hasWordBeenGuessed(): boolean {
    return [...this.word].every((letter) => this.correctCharacters.has(letter));
  }

  private get correctGuessesCount(): number {
    return this.correctCharacters.size;
  }

  private get wrongGuessesCount(): number {
    return this.wrongCharacters.size;
  }

  private get isHintAvailable(): boolean {
    return this.hintUsedCount < this.options.maxHints;
  }

  public get isPlaying(): boolean {
    return this.state !== "NOT_PLAYING";
  }

  private reset(): void {
    this.state = "NOT_PLAYING";
    this.hintUsedCount = 0;
    this.correctCharacters.clear();
    this.wrongCharacters.clear();
  }
}
