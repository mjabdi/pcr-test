const dbRecoveryModule = {};

const logger = require('./utils/logger')();
const {Link} = require('./models/link');

dbRecoveryModule.recoverFailedDownloads = async () =>
{
    try
    {
       var result = await Link.updateMany({$or: [{status: 'downloading'} , {status: 'downloadSuccess'}]} , {"$set": {"status": "downloadFailed"}});
       result = JSON.parse(JSON.stringify(result));
       if (result && result.nModified > 0)
       {
           logger.info(`${result.nModified} documents(s) recovered from downloadFailed status.`);
       }
    }
    catch(err)
    {
        logger.error(err);
    }

}

module.exports = dbRecoveryModule;
