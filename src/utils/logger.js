const config = require('config');

const pino = require('pino')({
  prettyPrint: { colorize: true, translateTime: true },
  level : config.LogLevel || "info",

});

module.exports = () =>
{
  return pino;
} 