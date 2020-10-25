const application = {};

const config = require('config');
const logger = require('./logger')();

let mailListener = null;
let dbListener = null;

application.shutdown = () => {
    logger.info('application is shutting down...');

    //**  do anything you need before exiting the application here */
    if (mailListener)
    {
        mailListener.disconnect();
    }

    if (dbListener)
    {
        dbListener.stop();
    }

    logger.flush();

    setTimeout(() => {
        process.exit(0);
    }, config.ShutdownTimeout || 3000);
}

application.registerForGracefulShutdown = (_mailListener, _dbListener) => {

    mailListener = _mailListener;
    dbListener = _dbListener;

    process.on('SIGTERM', () => {
        if (!application.exitSignalReceived) {
            application.exitSignalReceived = true;
            logger.info('SIGTERM signal received.');
            application.shutdown();
        }
        else {
            console.log('application is shutting down. please wait...');
        }
    });

    process.on('SIGINT', () => {
        if (!application.exitSignalReceived) {
            application.exitSignalReceived = true;
            logger.info('SIGINT signal received.');
            application.shutdown();
        }
        else {
            console.log('application is shutting down. please wait...');
        }
      });
}

application.registerGlobalErrorHandler = () =>
{
    process.on('uncaughtException', (err) => {
        if (!application.exitSignalReceived)
        {
            application.exitSignalReceived = true;
            logger.fatal(`Uncaught Exception occured : ${err.stack}`);
            application.shutdown();
        }
        else
        {
            console.log('application is shutting down. please wait...');
        }
    });

    process.on('unhandledRejection', (err) => {
        if (!application.exitSignalReceived)
        {
            application.exitSignalReceived = true;
            logger.fatal(`Unhandled Promise Rejection occured : ${err.stack}`);
            application.shutdown();
        }
        else
        {
            console.log('application is shutting down. please wait...');
        }
    });
}

module.exports = application;
