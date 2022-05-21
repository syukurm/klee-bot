import { Service } from "typedi";
import type { Logger } from "winston";
import { createLogger, format, transports } from "winston";

import ConfigService from "./config.service";

const { combine, timestamp, printf, colorize, align, json } = format;
@Service()
export default class LoggerService {
  public logger: Logger;

  public constructor(private readonly configService: ConfigService) {
    const logger = createLogger({
      level: "info",
      format: combine(timestamp(), json()),
      transports: [
        new transports.File({
          filename: "./logs/combined.log",
        }),
        new transports.File({
          filename: "./logs/error.log",
          level: "error",
        }),
      ],
    });

    if (configService.get("NODE_ENV") !== "production") {
      logger.add(
        new transports.Console({
          format: combine(
            colorize({ all: true }),
            timestamp({
              format: "YYYY-MM-DD hh:mm:ss",
            }),
            align(),
            printf((info) => `[${info.timestamp as string}] ${info.level}: ${info.message}`)
          ),
        })
      );
    }

    this.logger = logger;
  }
}
