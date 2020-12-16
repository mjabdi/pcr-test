
const {sendMail} = require('./mail-sender-2');
const {createICS} = require('./ics-creator');

const { calculatePrice } = require('./PriceCalculator');
const { FormatDateFromString } = require('./DateFormatter');


const faq = [
    {
        question: "I just booked my appointment online, should I call the clinic to confirm my appointment?",
        answer: "Please do not call to confirm appointments that have already been confirmed via email. Once you have your 9 digit code, this appointment is confirmed."
    },
    {
        question: "Can I pay in advance?",
        answer: "Sorry, we do not accept pre-payment for any PCR tests."
    },
    {
        question: "Can you guarantee my results in less than 48 hours?",
        answer: "Many patients are booking cheap flights at short notice however you must bear in mind that if these tests need to be conducted, you should be leaving at least 48 hours between test time and departure. Over 95% of our results are sent to patients within 40 hours, and there are live statistics on our website advising current turnaround times, patients booking tests for flights under 48 hours away assume all responsibility."
    },
    {
        question: "I need a certificate and I didn't pay for one, can you add one onto my booking?",
        answer: "If you have not attended for your test yet, please amend your booking following the link in your confirmation email. If you have already attended, please call the clinic to pay your additional £50, have your passport details to hand so we can note them on your certificate."
    },
];

const faqTR = [
    {
        question: "I just booked my appointment online, should I call the clinic to confirm my appointment?",
        answer: "Please do not call to confirm appointments that have already been confirmed via email. Once you have your 9 digit code, this appointment is confirmed."
    },
    {
        question: "Can I pay in advance?",
        answer: "Sorry, we do not accept pre-payment for any PCR tests."
    },
    {
        question: "Can you guarantee my results in less than 48 hours?",
        answer: "No, sorry. Over 95% of our results are sent to patients within 40 hours, and there are live statistics on our website advising current turnaround times."
    },
]


const sendConfirmationEmail =  async (options) =>
{
    if (options.tr)
    {
        return await sendConfirmationEmailForTR(options);
    }

    var content = '';
    content += `<div style="padding: '25px 0 10px 0'; width: 90%;  font-size: 16px; line-height: 25px; font-family: sans-serif;text-align: justify;color: #333 !important;">`
    content += `<img style="margin:10px" src="https://www.medicalexpressclinic.co.uk/public/design/images/medical-express-clinic-logo.png" alt="Medical Express Clinic - private clinic London">`;
    content += `<p>Dear ${options.forename},</p>`;
    content += `<p>Thank you for booking your appointment at the Medical Express Clinic for a COVID-19 PCR Fit to Fly Test. We look forward to welcoming you.</p>`;
    content += `<p style="font-size:18px; font-weight:800">‘If you have received this email your appointment is confirmed. Please <u>DON'T CALL</u> the clinic to confirm your appointment.’</p>`;

    content += `<p>Your booking number is <strong>"${options.bookingRef}"</strong>, please have this number handy when you attend at the clinic.</p>`;
    content += `<p>Below is your booking information : </p>`;
    content += '<ul>';
    content += `<li> Appointment Time : ${FormatDateFromString(options.bookingDate)} at ${options.bookingTime} </li>`;
    content += `<li> Forename : ${options.forename.toUpperCase()} </li>`;
    content += `<li> Lastname : ${options.surname.toUpperCase()} </li>`;
    content += `<li> Date of Birth : ${FormatDateFromString(options.birthDate)} </li>`;
    content += `<li> Title : ${options.title} </li>`;
    content += `<li> Gender : ${options.gender} </li>`;
    content += `<li> Post Code : ${options.postCode} </li>`;
    content += `<li> Address : ${options.address} </li>`;
    content += `<li> Telephone : ${options.phone} </li>`;
    if (options.passportNumber)
         content += `<li> Passport Number : ${options.passportNumber} </li>`;
    if (options.passportNumber2)
        content += `<li> Second Passport Number : ${options.passportNumber2} </li>`;
    content += `<li> Certificate Order : ${options.certificate ? 'YES' : 'NO'} </li>`;
    content += `<li> Antibody Test Order : ${options.antiBodyTest ? 'YES' : 'NO'} </li>`;
    content += `<li> Price : £${calculatePrice(options)} </li>`;

    content += `</ul>`;

    content += `<p> Please follow this link if you need to modify your booking details, rearrange your appointment or cancel your booking : </p>`;

    const target = `https://travelpcrtest.com/user/edit/${options.bookingRef}-${options.birthDate}`;
    const butonStyle = `box-shadow: 0px 1px 0px 0px #f0f7fa;background:linear-gradient(to bottom, #33bdef 5%, #019ad2 100%);background-color:#33bdef;border-radius:6px;border:1px solid #057fd0;display:inline-block;cursor:pointer;color:#ffffff;font-family:Arial;font-size:15px;font-weight:bold;padding:6px 24px;text-decoration:none;text-shadow:0px -1px 0px #5b6178;`

    content += `<p> <a href="${target}" style="${butonStyle}" target="_blank"> Modify or Cancel Appointment </a></p>`;

    content += `<p style="width:80%"> * Your results are sent password protected, please ensure to check your spam box if results have not been received within 40 hours of your test date. The password will be your date of birth in the format DDMMYYYY. Please note your results will return from this email address: results@medicalexpressclinic.co.uk. </p>`

    content += '<p style="font-weight:600"> Please Read our PCR Test FAQs </p>';

    faq.forEach(element => {

        content += `<p style="border-left: 4px solid red; background: #eee; font-weight:600;padding-left:10px;line-height:50px"> <span style="color:red;font-size:24px"> Q. </span> ${element.question} </p>`;
        content += `<p style="border-left: 4px solid #999; background: #fff; font-weight:400;color: #555;padding-left:10px;line-height:50px"> <span style="color:#555;font-size:24px"> A. </span>${element.answer} </p>`;

    });


    content += `<div style="padding-top:10px">`;
    content += `<p style="font-weight:600">Kind Regards,</p>`;
    content += `<p style="font-weight:600">Medical Express Clinic</p>`;
    content += `</div>`;
  
  
    content += '</div>'

    content += `<div style="width:80%; padding: '25px 0 10px 0'; font-size: 14px; line-height: 25px; font-family: sans-serif;text-align: left;color: #555 !important;">`
    content += `<p>PLEASE note there might be a slight delay in your appointment time (less than 10 minutes) to help maintain social distancing.</p>`;
    content += '<p>Our address is: 117A Harley Street, Marylebone, London W1G 6AT, UK. The clinic is located on the corner of Harley and Devonshire Streets, we have a blue door please ensure you attend the correct address for your appointment. Please do let us know if you might be late, The results will be delivered to you by email. Please make sure to add results@medicalexpressclinic.co.uk to your safe sender list to ensure deliverability of your results. </p>'
    content += '</div>'



    content += `<div style="width:80%; padding: '25px 0 10px 0'; margin-top:10px; font-size: 14px; font-weight: 600 ;line-height: 25px; font-family: sans-serif;text-align: center ;color: #000;">`;
    content += '***   If you believe you have received this email in error, please delete it and notify info@medicalexpressclinic.co.uk  ***'
    content+= `</div>`

    const event = await createICS(options.bookingDate, options.bookingTimeNormalized, `${options.forename} ${options.surname}`, options.email);

    await sendMail(options.email, 'PCR Test for Travel Appointment Confirmation' , content, event);
   
}

const sendConfirmationEmailForTR =  async (options) =>
{
    var content = '';
    content += `<div style="padding: '25px 0 10px 0'; width: 90%;  font-size: 16px; line-height: 25px; font-family: sans-serif;text-align: justify;color: #333 !important;">`
    content += `<img style="margin:10px" src="https://www.medicalexpressclinic.co.uk/public/design/images/medical-express-clinic-logo.png" alt="Medical Express Clinic - private clinic London">`;
    content += `<p>Dear ${options.forename},</p>`;
    content += `<p>Thank you for booking your appointment at the Medical Express Clinic for a COVID-19 "Test to Release". We look forward to welcoming you.</p>`;
    content += `<p style="font-size:18px; font-weight:800">‘If you have received this email your appointment is confirmed. Please <u>DON'T CALL</u> the clinic to confirm your appointment.’</p>`;

    content += `<p>Your booking number is <strong>"${options.bookingRef}"</strong>, please have this number handy when you attend at the clinic.</p>`;
    content += `<p>Below is your booking information : </p>`;
    content += '<ul>';
    content += `<li> Appointment Time : ${FormatDateFromString(options.bookingDate)} at ${options.bookingTime} </li>`;
    content += `<li> Forename : ${options.forename.toUpperCase()} </li>`;
    content += `<li> Lastname : ${options.surname.toUpperCase()} </li>`;
    content += `<li> Date of Birth : ${FormatDateFromString(options.birthDate)} </li>`;
    content += `<li> Title : ${options.title} </li>`;
    content += `<li> Gender : ${options.gender} </li>`;
    content += `<li> Telephone : ${options.phone} </li>`;
    content += `<li> Passport Number : ${options.passportNumber} </li>`;
    content += `<li> NHS Number : ${options.NHSNumber || '-'} </li>`;
    content += `<li> Ethnicity : ${options.ethnicity} </li>`;
    content += `<li> Post Code : ${options.postCode} </li>`;
    content += `<li> Address : ${options.address} </li>`;
    if (options.selfIsolate)
    {
        content += `<li> Self-Isolate Post Code : ${options.postCodeSI} </li>`;
        content += `<li> Self-Isolate Address : ${options.addressSI} </li>`;
    }
    content += `<li> Arrival Date : ${options.arrivalDate} </li>`;
    content += `<li> Flight Number : ${options.flightNumber} </li>`;
    content += `<li> Last Departed Date : ${options.lastDepartedDate} </li>`;
    content += `<li> Travelling From : ${options.travellingFrom} </li>`;
 
    content += `<li> Price : £${calculatePrice(options)} </li>`;

    content += `</ul>`;

    content += `<p> Please follow this link if you need to modify your booking details, rearrange your appointment or cancel your booking : </p>`;

    const target = `https://travelpcrtest.com/user/edit/${options.bookingRef}-${options.birthDate}`;
    const butonStyle = `box-shadow: 0px 1px 0px 0px #f0f7fa;background:linear-gradient(to bottom, #33bdef 5%, #019ad2 100%);background-color:#33bdef;border-radius:6px;border:1px solid #057fd0;display:inline-block;cursor:pointer;color:#ffffff;font-family:Arial;font-size:15px;font-weight:bold;padding:6px 24px;text-decoration:none;text-shadow:0px -1px 0px #5b6178;`

    content += `<p> <a href="${target}" style="${butonStyle}" target="_blank"> Modify or Cancel Appointment </a></p>`;

    content += `<p style="width:80%"> * Your results are sent password protected, please ensure to check your spam box if results have not been received within 40 hours of your test date. The password will be your date of birth in the format DDMMYYYY. Please note your results will return from this email address: results@medicalexpressclinic.co.uk. </p>`

    content += '<p style="font-weight:600"> Please Read our PCR Test FAQs </p>';

    faqTR.forEach(element => {

        content += `<p style="border-left: 4px solid red; background: #eee; font-weight:600;padding-left:10px;line-height:50px"> <span style="color:red;font-size:24px"> Q. </span> ${element.question} </p>`;
        content += `<p style="border-left: 4px solid #999; background: #fff; font-weight:400;color: #555;padding-left:10px;line-height:50px"> <span style="color:#555;font-size:24px"> A. </span>${element.answer} </p>`;

    });


    content += `<div style="padding-top:10px">`;
    content += `<p style="font-weight:600">Kind Regards,</p>`;
    content += `<p style="font-weight:600">Medical Express Clinic</p>`;
    content += `</div>`;
  
  
    content += '</div>'

    content += `<div style="width:80%; padding: '25px 0 10px 0'; font-size: 14px; line-height: 25px; font-family: sans-serif;text-align: left;color: #555 !important;">`
    content += `<p>PLEASE note there might be a slight delay in your appointment time (less than 10 minutes) to help maintain social distancing.</p>`;
    content += '<p>Our address is: 117A Harley Street, Marylebone, London W1G 6AT, UK. The clinic is located on the corner of Harley and Devonshire Streets, we have a blue door please ensure you attend the correct address for your appointment. Please do let us know if you might be late, The results will be delivered to you by email. Please make sure to add results@medicalexpressclinic.co.uk to your safe sender list to ensure deliverability of your results. </p>'
    content += '</div>'



    content += `<div style="width:80%; padding: '25px 0 10px 0'; margin-top:10px; font-size: 14px; font-weight: 600 ;line-height: 25px; font-family: sans-serif;text-align: center ;color: #000;">`;
    content += '***   If you believe you have received this email in error, please delete it and notify info@medicalexpressclinic.co.uk  ***'
    content+= `</div>`

    const event = await createICS(options.bookingDate, options.bookingTimeNormalized, `${options.forename} ${options.surname}`, options.email);

    await sendMail(options.email, 'PCR Test to Release Appointment Confirmation' , content, event);
   
}



module.exports = {
    sendConfirmationEmail : sendConfirmationEmail,
};