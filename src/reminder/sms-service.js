
const {sendTextMessage} = require("./twilio-sender")
const { FormatDateFromString } = require('./DateFormatter');


const sendReminderTextMessage = async (options, to) =>
{
    let message = `Dear ${options.fullname.toUpperCase()},\r\n\nThank you for booking your appointment for Gynae Clinic at the Medical Express Clinic. We look forward to welcoming you.\r\n\n`
    message += `We hope you’re doing well. We wanted to remind you that your next appointment with Medical Express Clinic is scheduled for <strong>${FormatDateFromString(options.bookingDate)} at ${options.bookingTime}</strong>. We look forward to seeing you then.`
    message += `\r\n\r\nYour booking number is <strong>"${options.bookingRef}"</strong>, please have this number handy when you attend at the clinic.`




    message += `\r\nWe truly care about your well-being, so if you have any questions or needs in advance of your appointment, you are welcome to call us anytime at 02074991991.`;


    message += "\r\n\nKind Regards,\r\nMedical Express Clinic\r\n02074991991"
    await sendTextMessage(to, message) 
}


module.exports = {
    sendReminderTextMessage: sendReminderTextMessage,
};