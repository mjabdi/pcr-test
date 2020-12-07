const {Notification} = require('../models/Notification');
const logger = require('./logger')();

const sendEgressAlarm = () =>
{
    const notification = new Notification(
        {
            timeStamp : new Date(),
            text : 'Egress Connection Failed!',
            type: 'Egress'
        }
    );

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

module.exports = {
    sendEgressAlarm : sendEgressAlarm
}