import consola, { Consola } from "consola";
import { Service } from "typedi";

import ConfigService from "~services/config.service";

@Service()
export default class LoggerService {
  private loggerInstance: Consola;

  public constructor(configService: ConfigService) {
    this.loggerInstance = consola.create({
      level: configService.logLevel,
    });
  }

  public get logger(): Consola {
    return this.loggerInstance;
  }
}
