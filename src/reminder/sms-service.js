
const {sendTextMessage} = require("./twilio-sender")
const { FormatDateFromString } = require('./DateFormatter');


const sendReminderTextMessage = async (options, to) =>
{
    let message = `Dear ${options.fullname.toUpperCase()},\r\n\nThank you for booking your appointment at the Medical Express Clinic. We look forward to welcoming you.\r\n\n`
    message += `We wanted to remind you that your appointment with the Medical Express Clinic is scheduled for ${FormatDateFromString(options.bookingDate)} at ${options.bookingTime}. We look forward to seeing you then.`
    message += `\r\n\r\nYour booking number is "${options.bookingRef}", please have this number handy when you attend at the clinic.`




    message += `\r\nIf you have any questions or require assistance in advance of your appointment, you are welcome to call us during our working hours at 02074991991, alternatively, you can email info@medicalexpressclinic.co.uk and one of our team will get back to you.`;


    message += "\r\n\nKind Regards,\r\nMedical Express Clinic\r\n02074991991"
    await sendTextMessage(to, message) 
}


module.exports = {
    sendReminderTextMessage: sendReminderTextMessage,
};