const config = require('config');

const pino = require('pino')({
  prettyPrint: true,
  level : config.LogLevel || "info"
});

module.exports = () =>
{
  return pino;
} 