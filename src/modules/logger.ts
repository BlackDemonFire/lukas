import winston from "winston";
const { createLogger, format, transports } = winston;
const logger = createLogger({
  transports: [],
  exitOnError: false,
  handleExceptions: true,
  level: process.env.LOG_LEVEL || "info",
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
