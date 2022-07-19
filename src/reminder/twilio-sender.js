const config = require('config');

const accountSid = config.MuseumTwilioAccount; 
const authToken = config.MuseumTwilioToken; 
const client = require('twilio')(accountSid, authToken); 
 

const sendTextMessage = (to, text) =>
{
    return new Promise( (resolve, reject) => {

        client.messages 
        .create({  
           from: config.MedexTwilioNumber,
           to: NormalizePhone(to) ,
           body: text
         }) 
        .then(message => resolve(message.sid))
        .catch(err => reject(err))
        .done();
    });
}

function NormalizePhone(phone) {

    if (phone && phone.length <= 10)
    {
        return `+44${phone}`
    }else
    {
        return phone
    }
}

module.exports = {
    sendTextMessage : sendTextMessage
};