import "dotenv/config";

import { envsafe, str } from "envsafe";
import { Service } from "typedi";

const config = envsafe({
  NODE_ENV: str({
    devDefault: "development",
    choices: ["development", "test", "production"],
  }),
  BOT_TOKEN: str(),
});

@Service()
export default class ConfigService {
  private config: typeof config;

  public constructor() {
    this.config = config;
  }

  public get(key: keyof typeof config): string {
    return this.config[key];
  }
}
