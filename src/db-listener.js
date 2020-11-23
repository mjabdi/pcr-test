const dbListenerModule = {};

const config = require('config');
const logger = require('./utils/logger')();
const {Link} = require('./models/link');
const browseLink = require('./browsing-bot');
const dateformat = require('dateformat');
const { Booking } = require('./models/Booking');

let timerNew;
let timerRetry;

dbListenerModule.stop = () =>
{
    if (timerNew)
    {
        clearInterval(timerNew);
    }

    if (timerRetry)
    {
        clearInterval(timerRetry);
    }
}

dbListenerModule.registerForIncommingLinks = (handleAttachment) =>
{
    dbListenerModule.handleAttachment = handleAttachment;
    timerNew = setInterval(() => {
        checkForLink('new');
    }, config.CheckDBInterval || 5000);

    timerRetry = setInterval(() => {
        checkForLink('downloadFailed');
    }, config.CheckDBInterval || 8000);

    timerGC = setInterval(() => {
        deleteOldBookings()
    }, 1 * 60 * 1000);

}

function deleteOldBookings() {
    const today = dateformat(new Date() , 'yyyy-mm-dd');

    Booking.updateMany( {$and: [{bookingDate : { $lt : today}} , {status : 'booked'} ]} , {deleted : true} ,  function (err, result) {
        if (!err)
        {
            result = JSON.parse(JSON.stringify(result));
            if (result && result.nModified > 0)
            {
                logger.info(`${result.nModified} old booking(s) deleted from db.`);
            }
        }
        else
        {
            logger.error(err);
        }
    });
}

function checkForLink(linkStatus) {

    Link.findOne(  {status: linkStatus},
                 ['rawLink'], 
                {limit: 1,
                    sort: {seqNo: 1}
                 },
                 function (err, doc) {
                    if (err) {
                        logger.error(err);
                    }
                    else if (doc)
                    {
                        logger.debug(`Document Feteched: ${doc}`);
                        Link.updateOne( {_id: doc._id}, {status: 'downloading'}, function (err2, doc2) {
                                            if (err2){
                                                logger.error(err2);
                                            }
                                            else
                                            {
                                                logger.debug(`Document with id ${doc._id} is set to downloading`);
                                                browseLink(doc.rawLink).then( (filePath) => 
                                                {
                                                    Link.updateOne( {_id: doc._id}, {status: 'downloadSuccess'}, function (err3, doc3) {
                                                        if (err3)
                                                        {
                                                            logger.error(err3);
                                                        }
                                                        else
                                                        {
                                                            logger.debug(`download succeed for link: ${doc.rawLink} to file ${filePath}`);
                                                            dbListenerModule.handleAttachment(filePath, doc._id);
                                                        }
                                                    });

                                                }).catch ( (err) => 
                                                {
                                                    Link.updateOne( {_id: doc._id}, {status: 'downloadFailed'}, function (err3, doc3) {
                                                        if (err3)
                                                        {
                                                            logger.error(err3);
                                                        }
                                                        else
                                                        {
                                                            logger.warn(`download failed for link: ${doc.rawLink}`);
                                                        }
                                                    });
                                                })
                                            }
                                         }
                                      );
                    }
                 }
            );
}

module.exports = dbListenerModule;