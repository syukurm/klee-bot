import { CommandInteraction, Message, MessageCollector, MessageEmbed } from "discord.js";
import { Discord, SimpleCommand, SimpleCommandMessage, Slash } from "discordx";
import ms from "ms";

import emojis from "~constants/letter-emojis.constant";
import wordlist from "~constants/wordlist.constant";
import type { Command } from "~interfaces/command";

@Discord()
export default class Hangman implements Command {
  private readonly maxMisses = 7;

  private isPlaying: boolean;

  private timeGameStarted: Date;

  private currentMistake: number;

  private currentWord = "";

  private wrongCharacters: Set<string>;

  private correctCharacters: Set<string>;

  private gameText: Message | undefined;

  public constructor() {
    this.isPlaying = false;
    this.timeGameStarted = new Date();
    this.currentMistake = 0;
    this.currentWord = "";
    this.wrongCharacters = new Set();
    this.correctCharacters = new Set();
  }

  @SimpleCommand("hangman", { description: "Play a game of hangman" })
  public async simpleCommand(command: SimpleCommandMessage): Promise<void> {
    await this.execute(command.message);
  }

  @Slash("hangman", { description: "Play a game of hangman" })
  public async slash(interaction: CommandInteraction): Promise<void> {
    await this.execute(interaction);
  }

  public async execute(interaction: CommandInteraction | Message): Promise<void> {
    if (this.isPlaying) {
      await interaction.reply("Game is already in progress.");
    } else {
      await interaction.reply(`Starting a new game`);
      await this.start(interaction);
    }
  }

  public async start(interaction: CommandInteraction | Message): Promise<void> {
    this.isPlaying = true;
    this.timeGameStarted = new Date();

    const randomWord = wordlist[Math.floor(Math.random() * wordlist.length)] ?? "Nothing";
    this.currentWord = randomWord.toLowerCase();

    const gameInterface = this.createGameInterface();
    this.gameText = await interaction.channel?.send({ embeds: [gameInterface] });

    if (this.gameText === undefined) {
      this.isPlaying = false;
      return;
    }

    const collector = interaction.channel?.createMessageCollector({
      time: ms("1"),
      filter: (message) => /^[A-Za-z]+$/.test(message.content),
    });

    collector?.on("collect", async (message) => {
      const messageContent = message.content.trim().toLowerCase();

      if (message.content.length === 1) {
        if (this.currentWord.includes(messageContent)) {
          if (!this.correctCharacters.has(messageContent)) {
            await this.gameText?.delete();
            this.gameText = await interaction.channel?.send({ embeds: [this.createGameInterface()] });
          }
          this.correctCharacters.add(messageContent);
        } else if (!this.wrongCharacters.has(messageContent)) {
          this.currentMistake += 1;
          this.wrongCharacters.add(messageContent);
        }
      } else if (messageContent === this.currentWord) {
        [...messageContent].forEach((letter) => this.correctCharacters.add(letter));
      }
      await this.updateGame(collector);
    });

    collector?.on("end", async () => {
      if (this.isPlaying) {
        this.isPlaying = false;
        await this.updateGame(collector);
      }
    });
  }

  public createGameInterface(): MessageEmbed {
    const images = [
      "https://i.imgur.com/on7dmN6.png",
      "https://i.imgur.com/nbZ8Akb.png",
      "https://i.imgur.com/lSjCWM8.png",
      "https://i.imgur.com/ylmGiN5.png",
      "https://i.imgur.com/D4MIRYD.png",
      "https://i.imgur.com/PDMNT8U.png",
      "https://i.imgur.com/egjJoc2.png",
      "https://i.imgur.com/hQ9gCCf.png",
    ];

    const guessedWord = [...this.currentWord].map((letter) => {
      if (this.correctCharacters.has(letter)) {
        return emojis[letter.toUpperCase()] as string;
      }
      return "⬜";
    });

    const guessesLeft = this.maxMisses - this.currentMistake;

    const gameInterface = new MessageEmbed()
      .setColor("#60a5fa")
      .setTitle("Hangman Game")
      .addField("Guess the word", guessedWord.join(" "))
      .setImage(images[guessesLeft] ?? "https://i.imgur.com/on7dmN6.png")
      .setTimestamp(this.timeGameStarted)
      .setFooter({ text: `${this.maxMisses - this.currentMistake} guesses left` });

    if (this.wrongCharacters.size > 0) {
      const wrongCharacters = [...this.wrongCharacters].map((letter) => emojis[letter.toUpperCase()] as string);
      gameInterface.addField("Wrong characters:", wrongCharacters.join(" "));
    }

    if (!this.isPlaying) {
      const noMoreGuessesLeft = this.currentMistake >= this.maxMisses;
      const hasWordBeenGuessed = [...this.currentWord].every((letter) => this.correctCharacters.has(letter));

      if (noMoreGuessesLeft) {
        gameInterface.setColor("#ef4444").setAuthor({ name: `Game has ended, the word was ${this.currentWord}` });
      } else if (hasWordBeenGuessed) {
        gameInterface.setColor("#22c55e").setAuthor({ name: `Game has ended, you guessed the word` });
      } else {
        gameInterface.setColor("#475569").setAuthor({ name: `Game has ended` });
      }
    }

    return gameInterface;
  }

  public async updateGame(collector: MessageCollector): Promise<void> {
    const noMoreGuessesLeft = this.currentMistake >= this.maxMisses;
    const hasWordBeenGuessed = [...this.currentWord].every((letter) => this.correctCharacters.has(letter));

    if (noMoreGuessesLeft || hasWordBeenGuessed) {
      this.isPlaying = false;
      const updatedInterface = this.createGameInterface();
      await this.gameText?.edit({ embeds: [updatedInterface] });
      this.reset();
      collector.stop();
    } else {
      const updatedInterface = this.createGameInterface();
      await this.gameText?.edit({ embeds: [updatedInterface] });
    }
  }

  public reset(): void {
    this.correctCharacters = new Set<string>();
    this.wrongCharacters = new Set<string>();
    this.currentMistake = 0;
  }
}
