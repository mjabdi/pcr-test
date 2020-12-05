const dbListenerModule = {};

const config = require('config');
const logger = require('./utils/logger')();
const {Link} = require('./models/link');
const browseLink = require('./browsing-bot');
const dateformat = require('dateformat');
const { Booking } = require('./models/Booking');
const { sendConfirmationEmail } = require('./reminder/email-service');
const { cat } = require('shelljs');


let timerNew;
let timerRetry;
let timerGC;
let timerReminder;

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

    if (timerGC)
    {
        clearInterval(timerGC);
    }

    if (timerReminder)
    {
        clearInterval(timerReminder);
    }
}

dbListenerModule.registerForIncommingLinks = (handleAttachment) =>
{
    dbListenerModule.handleAttachment = handleAttachment;
    timerNew = setInterval(() => {
        checkForLink('new');
    }, 2 * 60 * 1000);

    timerRetry = setInterval(() => {
        checkForLink('downloadFailed');
    }, 1 * 60 * 1000);

    timerGC = setInterval(() => {
        deleteOldBookings();
    }, 1 * 60 * 1000);

    timerReminder = setInterval(() => {
        sendReminders();
    }, 1 * 60 * 1000);
}

async function sendReminders() {

    const now = new Date();
    if (now.getHours() < 12 || now.getHours() > 19)
        return;


    const tomorrow = new Date(new Date().getTime() + 86400000); 
    const tomorrowStr = dateformat(tomorrow , 'yyyy-mm-dd');
    const booking = await Booking.findOne({bookingDate : tomorrowStr, deleted: {$ne : true}, reminderSent : {$ne : true}}).sort({bookingTimeNormalized : 1}).exec();
    
   try{
    if (booking)
    {
        await sendConfirmationEmail(booking);
        await Booking.updateOne({_id : booking._id}, {reminderSent : true});
        logger.info(`Appointment Reminder Sent for : ${booking.forenameCapital} ${booking.surnameCapital}`);
    }
   }catch(err)
   {
       logger.error(err);
   }
    
}

function deleteOldBookings() {

    const yesterday = new Date(new Date().getTime() - 86400000); 
    const yesterdayStr = dateformat(yesterday , 'yyyy-mm-dd');

    Booking.updateMany( {$and: [{bookingDate : { $lt : yesterdayStr}} , {status : 'booked'} ]} , {deleted : true} ,  function (err, result) {
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