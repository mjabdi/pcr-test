const { Link } = require('../models/link');
const {Notification} = require('../models/Notification');
const logger = require('./logger')();

const sendEgressAlarm = async () =>
{
    const notification = new Notification(
        {
            timeStamp : new Date(),
            text : 'Egress Connection Failed!',
            type: 'Egress'
        }
    );

    
    const errors = await Link.find({ $or:[ {status : 'downloading'}, {status : 'downloadFailed'}]});
    if (errors && errors.length > 10)
    {
        notification.save( (err,doc) => {
            if (err)
            {
                logger.error(err);
            }
            else if (doc)
            {
                logger.warn(`Egress Alarm Sent to the notification system!`);
            }
        });
    }
}

const sendLabFormatAlarm = async () =>
{
    const notification = new Notification(
        {
            timeStamp : new Date(),
            text : 'Lab Report Format Unreadable!',
            type: 'LabFormat'
        }
    );

    notification.save( (err,doc) => {
        if (err)
        {
            logger.error(err);
        }
        else if (doc)
        {
            logger.warn(`LabFormat Alarm Sent to the notification system!`);
        }
    });
}


module.exports = {
    sendEgressAlarm : sendEgressAlarm,
    sendLabFormatAlarm : sendLabFormatAlarm
}