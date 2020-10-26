const mongoose = require('mongoose');
const config = require('config');
const logger = require('./utils/logger')();
const application = require('./utils/application');

module.exports = async function()
{
    return new Promise( (resolve, reject) =>
    {
        mongoose.connect(config.MongodbUrl,{useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
        .then(() => {
            // logger.info('Connected to MongoDB...');
            // resolve();
        })
        .catch(err => {
            logger.error("could not connect to MongoDB!");
            application.shutdown();
        });

        const db = mongoose.connection;

        
        db.on('error', (err) =>  {
            logger.error(`An Error Ocuured in MongoDB: ${err}`);
          });

        db.once('open', () =>  {
            logger.info('Connected to MongoDB...');
            resolve();
          });

    } ); 
}