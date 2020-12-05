
const {sendMail} = require('./mail-sender-2');
const {createICS} = require('./ics-creator');

const { calculatePrice } = require('./PriceCalculator');


const sendConfirmationEmail =  async (options) =>
{
    var content = '';
    content += `<div style="padding: '25px 0 10px 0'; width: 90%;  font-size: 16px; line-height: 25px; font-family: sans-serif;text-align: justify;color: #333 !important;">`
    content += `<img style="margin:10px" src="https://www.medicalexpressclinic.co.uk/public/design/images/medical-express-clinic-logo.png" alt="Medical Express Clinic - private clinic London">`;
    content += `<p>Dear ${options.forename},</p>`;
    content += `<p>This is a reminder for your COVID PCR test for travel appointment with Medical Express Clinic on <strong>${options.bookingDate}</strong> at <strong>${options.bookingTime}</strong> </p>`;
   
    content += `<p>Your booking number is <strong>"${options.bookingRef}"</strong>, please have this number handy when you attend at the clinic.</p>`;
    content += `<p>Below is your booking information : </p>`;
    content += '<ul>';
    content += `<li> Appointment Time : ${options.bookingDate} at ${options.bookingTime} </li>`;
    content += `<li> Forename : ${options.forename.toUpperCase()} </li>`;
    content += `<li> Lastname : ${options.surname.toUpperCase()} </li>`;
    content += `<li> Date of Birth : ${options.birthDate} </li>`;
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

 
    content += `<p>Kind Regards,</p>`;
    content += `<p>Medical Express Clinic</p>`;
    content += '</div>'

    content += `<div style="width:80%; padding: '25px 0 10px 0'; font-size: 14px; line-height: 25px; font-family: sans-serif;text-align: left;color: #555 !important;">`
    content += `<p>PLEASE note there might be a slight delay in your appointment time (less than 10 minutes) to help maintain social distancing, Patients are welcome to access the service now on a walk-in basis, however, you may face some slight delays on a walk-in basis as we will prioritise patients who have confirmed appointments.</p>`;
    content += '<p>Our address is: 117A Harley Street, Marylebone, London W1G 6AT, UK. Please do let us know if you might be late, The results will be delivered to you by email. Please make sure to add results@medicalexpressclinic.co.uk to your safe sender list to ensure deliverability of your results. </p>'
    content += '</div>'



    content += `<div style="width:80%; padding: '25px 0 10px 0'; margin-top:10px; font-size: 14px; font-weight: 600 ;line-height: 25px; font-family: sans-serif;text-align: center ;color: #000;">`;
    content += '***   If you believe you have received this email in error, please delete it and notify info@medicalexpressclinic.co.uk  ***'
    content+= `</div>`

    const event = await createICS(options.bookingDate, options.bookingTimeNormalized, `${options.forename} ${options.surname}`, options.email);

    await sendMail(options.email, 'Appointment reminder for PCR test for travel' , content, event);
   
}


module.exports = {
    sendConfirmationEmail : sendConfirmationEmail,
}