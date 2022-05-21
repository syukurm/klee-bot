import "reflect-metadata";

import { dirname, importx } from "@discordx/importer";
import { DIService } from "discordx";
import { Container } from "typedi";

import Bot from "./bot";
import ConfigService from "./services/config.service";
import LoggerService from "./services/logger.service";

DIService.container = Container;
const config = Container.get(ConfigService);
const logger = Container.get(LoggerService);

const bot = new Bot(logger);
await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

await bot.login(config.get("BOT_TOKEN"));
