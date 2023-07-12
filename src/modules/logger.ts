import winston from "winston";
import settings from "./settings.js";
const { createLogger, format, transports } = winston;
const logger = createLogger({
  transports: [],
  exitOnError: false,
  handleExceptions: true,
  level: settings.LOG_LEVEL,
});
logger.add(
  new transports.Console({
    format: format.combine(
      format.colorize({
        level: true,
        message: false,
        colors: {
          debug: "blue",
          info: "green",
          warn: "yellow",
          error: "red",
        },
      }),
      format.cli(),
    ),
  }),
);

export default logger;
