const winston = require("winston");
// Define your severity levels.
// With them, You can create log files,
// see or hide levels based on the running ENV.
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define different colors for each level.
// Colors make the log message more visible,
// adding the ability to focus or ignore messages.
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

// Tell winston that you want to link the colors
// defined above to the severity levels.
winston.addColors(colors);

// Chose the aspect of your log customizing the log format.
const textFormat = winston.format.combine(
  // Add the message timestamp with the preferred format
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  // Tell Winston that the logs must be colored
  process.env.COLORIZED_LOG === "true"
    ? winston.format.colorize({ all: true })
    : winston.format.uncolorize(),
  // Define the format of the message showing the timestamp, the level and the message
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Create the logger instance that has to be exported
// and used to log messages.
const logger = winston.createLogger({
  level: "http",
  levels,
  format: textFormat,
  transports: [new winston.transports.Console()],
});

module.exports = logger;