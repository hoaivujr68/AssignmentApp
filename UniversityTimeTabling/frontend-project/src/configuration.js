import dotenv from "dotenv";

dotenv.config();

export default class Configuration {
  static get CONFIG() {
    // must have format $VUE_APP_XXX
    return {
      sc5AdminURL: "https://sc5-backend.university-timetabling.com",
      // sc5AdminURL: "http://localhost:8084",
    };
  }

  static get DEBUG() {
    return process.env.NODE_ENV !== "production";
  }

  static value(name) {
    if (!(name in this.CONFIG)) {
      if (this.DEBUG) {
        // eslint-disable-next-line
        console.log(`Configuration: There is no key named "${name}"`);
      }
      return;
    }

    const value = this.CONFIG[name];

    if (!value) {
      if (this.DEBUG) {
        // eslint-disable-next-line
        console.log(`Configuration: Value for "${name}" is not defined`);
      }
      return;
    }

    if (value.startsWith("$VUE_APP_")) {
      // value was not replaced, it seems we are in development.
      // Remove $ and get current value from process.env
      const envName = value.substr(1);
      const envValue = process.env[envName];
      if (envValue) {
        return envValue;
      } else {
        if (this.DEBUG) {
          // eslint-disable-next-line
          console.log(
            `Configuration: Environment variable "${envName}" is not defined`
          );
        }
      }
    } else {
      // value was already replaced, it seems we are in production.
      return value;
    }
  }
}
