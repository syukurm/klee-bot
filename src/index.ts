import "reflect-metadata";

import { dirname, importx } from "@discordx/importer";
import { DIService } from "discordx";
import { Container } from "typedi";

import ConfigService from "~services/config.service";
import LoggerService from "~services/logger.service";

import Bot from "./bot";

// Setup IOC using typedi
DIService.container = Container;

const config = Container.get(ConfigService);
const logger = Container.get(LoggerService).logger.withScope("bot").withTag("start");

logger.start("Starting the bot");
const bot = new Bot();

// Load all events and commands
await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

await bot.login(config.botToken);

logger.ready("Bot started");
