const pino = require("pino");
const path = require("path");
const { PINO_LOG_LEVEL='info' } = require("./appconfig");

const levels = {
  crit: 60,
  error: 50,
  warn: 40,
  info: 20,
};

const streams = Object.keys(levels).map((level) => {
  return {
    level,
    stream: pino.destination(path.resolve(__dirname, "app-info.log")),
  };
});

const logger = pino(
  {
    level: PINO_LOG_LEVEL || "info",
    customLevels: levels,
    useOnlyCustomLevels: true,
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
  },
  pino.multistream(streams, { levels, dedupe: true })
);

const logs = (level, methodName, message) =>
  logger[level](`From ${methodName} - ${message}`);

module.exports = { logs };
