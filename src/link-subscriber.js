const linkSubscriberModule = {};
const logger = require('./utils/logger')();
const {Link} = require('./models/link');

linkSubscriberModule.linkReceived = (linkAddress, seq) =>
{
    logger.info(`new link received : ${linkAddress} `);
    Link.findOne({rawLink : linkAddress} , (err, doc) =>
    {
        if (err)
        {
            logger.error(err);
        }
        else
        {
            if (doc)
            {
                logger.warn(`duplicate raw link : ${linkAddress}`);
            }
            else
            {
                const link = new Link( {rawLink : linkAddress , seqNo : seq});
                link.save( (err, doc) =>
                {
                    if (!err)
                    {
                        logger.debug(`Raw Link Saved to db : ${linkAddress}`);
                    }
                    else
                    {
                        logger.error(err); 
                    }
                });
            }
        }
    });
}

module.exports = linkSubscriberModule;