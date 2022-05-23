import "dotenv/config";

import { envsafe, num, str } from "envsafe";
import { Service } from "typedi";

const config = envsafe({
  NODE_ENV: str({
    devDefault: "development",
    choices: ["development", "test", "production"],
  }),
  BOT_TOKEN: str(),
  OWNER_ID: str(),
  LOG_LEVEL: num({
    allowEmpty: true,
    default: 3,
    devDefault: 5,
    choices: [0, 1, 2, 3, 4, 5],
    desc: "Log level to use",
  }),
});

@Service()
export default class ConfigService {
  private config: typeof config;

  public constructor() {
    this.config = config;
  }

  public get logLevel(): number {
    return this.config.LOG_LEVEL;
  }

  public get nodeEnv(): "development" | "test" | "production" {
    return this.config.NODE_ENV as "development" | "test" | "production";
  }

  public get botToken(): string {
    return this.config.BOT_TOKEN;
  }

  public get ownerId(): string {
    return this.config.OWNER_ID;
  }
}
