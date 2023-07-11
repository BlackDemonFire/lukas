import winston from "winston";
const { createLogger, format, transports } = winston;
const logger = createLogger({
  transports: [],
  exitOnError: false,
  handleExceptions: true,
});
logger.add(
  new transports.Console({
    format: format.combine(
      format.colorize({
        level: true,
        message: false,
        colors: {
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
