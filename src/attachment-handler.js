const attachmentHandlerModule = {};

const {Link} = require('./models/link');
const parsePDF = require('./pdf-parser');
const config = require('config');
const logger = require('./utils/logger')();
const path = require('path');
const sendMail = require('./mail-sender');
const createPDF = require('./pdf-creator');
const createCertificate = require('./certificate-creator');
const fs = require('fs');
const shell = require('shelljs');
const {Booking} = require('./models/Booking');
const dateformat = require('dateformat');
const { sendLabFormatAlarm } = require('./utils/alarm');
const createTRCertificate = require('./tr-certificate-creator');
const { BloodReport } = require('./models/BloodReport');

const pdfFolder = config.PDFResultsFolderPath;
const emailto = config.TestReceiverMail;
const emailtoOther = config.TestReceiverMailOther;

attachmentHandlerModule.handleAttachment = (pdfFilePath, documentId) => {

    const filename = path.basename(pdfFilePath);

   

    parsePDF(pdfFilePath).then( async (options) => 
    {

        if (options.isPCR){

            const linkRecord = await Link.findOne({_id: documentId});

            const certFilename = `certificate-${filename}`;

            const newFilePath = path.join(pdfFolder, filename);
            const certFilePath = path.join(pdfFolder, certFilename);

            var booking = null;

            if (linkRecord.filename && linkRecord.filename.length > 0)
            {
                booking = await Booking.findOne({filename: linkRecord.filename});
                if (booking)
                {
                    options.forname = booking.forenameCapital;
                    options.surname = booking.surnameCapital;
                    options.birthDate = booking.birthDate;
                }
            }

            if (!booking && linkRecord.extRef && linkRecord.extRef.length > 2)
            {
                const bookingMatched = await Booking.findOne({ extRef: linkRecord.extRef , deleted : {$ne : true }}).sort({timeStamp : -1}).exec();
                if (bookingMatched)
                {
                    options.extref = linkRecord.extRef;
                    options.birthDate = bookingMatched.birthDate;
                }
           }

            if (!booking && options.extref && options.extref.length > 2)
            {
                booking = await Booking.findOne({ extRef: options.extref, birthDate: options.birthDate, deleted : {$ne : true }}).sort({timeStamp : -1}).exec();
                if (booking)
                {
                    options.forname = booking.forenameCapital;
                    options.surname = booking.surnameCapital;
                }
            }

            const now = new Date();
            const prev5days = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
            const todayString = dateformat(now, 'yyyy-mm-dd');
            const prev5daysString = dateformat(prev5days, 'yyyy-mm-dd');
           
            if (!booking)
            {
                booking = await Booking.findOne({ forenameCapital : options.forname, surnameCapital: options.surname, birthDate: options.birthDate, deleted : {$ne : true }, status: 'sample_taken' ,bookingDate : {$lte : todayString}, bookingDate : {$gte : prev5daysString}}).sort({timeStamp : 1}).exec();
            }
            
            if (!booking)
            {
                if (options.forname.indexOf(' ') > 0)
                {
                    const fornamePart1 =  options.forname.substr(0, options.forname.indexOf(' '));
                    booking = await Booking.findOne({ forenameCapital : fornamePart1, surnameCapital: options.surname, birthDate: options.birthDate, deleted : {$ne : true }, status: 'sample_taken' ,bookingDate : {$lte : todayString}, bookingDate : {$gte : prev5daysString}}).sort({timeStamp : 1}).exec();
                    if (booking)
                    {
                        options.forname = fornamePart1;
                    }
                }

            }

          
            if (!booking)
            {
                await Link.updateOne({_id: documentId} , {emailNotFound: true});
                await sendPCRUnmatchedNotification(options)
            }
            else
            {
                await Link.updateOne({_id: documentId} , {emailNotFound: false});
            }

            var sendCert = false;

            if (booking && !booking.tr && (booking.certificate || options.negative.toLowerCase() === 'positive'))
            {
                await createCertificate(options, booking.passportNumber, booking.passportNumber2 , certFilePath);
                sendCert = true;
            }

            if (booking && booking.tr)
            {
                await createTRCertificate(options, booking.passportNumber, certFilePath);
                sendCert = true;
            }

            if (booking)
            {
                options.bookingId = booking._id;
            }

            createPDF(options , newFilePath).then( () => {

                const attachments = [
                    {
                        path: newFilePath,
                        filename: filename
                    }
                ];

                if (sendCert)
                {
                    attachments.push({
                        path: certFilePath,
                        filename : certFilename
                    });
                }

                var recepients = [];
                var bcc = null;

                if (config.TestReceiverMailActive && booking)
                {
                    bcc = emailto;
                }
                
                if (!booking)
                {
                    recepients.push(emailto);
                }
                if (booking /*&& (options.negative.toLowerCase() === 'negative' || booking.tr )*/)
                {
                    if (linkRecord.dontSendEmail)
                    {
                        //do nothing
                    }
                    else
                    {
                        recepients.push(booking.email);
                    }
                }
                
                
                GenerateResultMail(options, recepients, bcc, options.forname,`COVID-19 Result for ${options.forname} ${options.surname} - ${options.collectedon.substring(0,10)}` , attachments).then( (result) => {

                    if (result)
                    {

                        Link.updateOne({_id: documentId} , {isPCR: true, status: 'sent', filename: filename, surname: options.surname, forename: options.forname, birthDate: options.birthDate,testDate: options.testDate , result: options.negative}, function (err, doc){
                            if (err) {
                                logger.error(err);
                            }
                            else
                            {
                                logger.info(`file ${filename} successfully sent.`);
                                if (booking)
                                {
                                    var sentStatus = 'report_sent';
                                    if (booking.certificate || booking.tr)
                                    {
                                        sentStatus = 'report_cert_sent';
                                    }

                                    if (options.negative.toLowerCase() !== 'negative')
                                    {
                                        sentStatus = `positive`;
                                    }


                                    Booking.updateOne({_id: booking._id}, {status: sentStatus, filename: filename} , function(err2,doc2) {
                                        if (err2) {
                                            logger.error(err2);
                                        }
                                        else
                                        {
                                            //do nothing
                                        }
                                    });
                                }
                               

                            }
                        });

                        try{
                            const sentFilePath = path.join(pdfFolder, 'sent', filename);
                            if (fs.existsSync(sentFilePath))
                            {
                                shell.rm('-f' , [sentFilePath]);
                            }

                            shell.mv(newFilePath, sentFilePath);

                        }
                        catch(err)
                        {
                            logger.error(err);
                        }

                        try{
                            const sentCertFilePath = path.join(pdfFolder, 'certs', certFilename);
                            if (fs.existsSync(sentCertFilePath))
                            {
                                shell.rm('-f' , [sentCertFilePath]);
                            }
                            
                            shell.mv(certFilePath, sentCertFilePath);
 
                        }
                        catch(err)
                        {
                            logger.error(err);
                        }
                    }
                    else
                    {
                        Link.updateOne({_id: documentId} , {isPCR: true, status: 'error_mail_send', filename: filename, surname: options.surname, forename: options.forname,birthDate: options.birthDate,testDate: options.testDate , result: options.negative}, function (err, doc){
                            if (err) {
                                logger.error(err);
                            }
                            else
                            {
                                logger.warn(`file ${filename} could not be sent!`);
                            }
                        });
                    }



                }).catch( (err) =>
                {
                    logger.error(err);
                    Link.updateOne({_id: documentId} , {isPCR: true, status: 'error_mail_send', filename: filename, surname: options.surname, forename: options.forname, birthDate: options.birthDate,testDate: options.testDate ,result: options.negative}, function (err, doc){
                        if (err) {
                            logger.error(err);
                        }
                        else
                        {
                            logger.warn(`file ${filename} could not be sent!`);
                        }
                    });
                });


            }).catch( (err) => {
                logger.error(err);
                Link.updateOne({_id: documentId} , {isPCR: true, status: 'error_pdf_create', filename: filename}, function (err, doc){
                    if (err) {
                        logger.error(err);
                    }
                    else
                    {
                        logger.warn(`pdf file ${filename} could not be created!`);
                    }
                });
            });
        }else{
            const attachments = [
                {
                    path: pdfFilePath,
                    filename: filename
                }
            ];

            try{
                const bloodreport = new BloodReport(
                    {
                        timeStamp: new Date(),
                        filename: filename,
                        name: `${options.forname} ${options.surname}`,
                        birthDate: options.birthDate,
                        testDate: options.testDate,
                        extRef: options.extref || null,
                        source: "egress" 
                    }
                )

                await bloodreport.save()

            }catch(err)
            {
                logger.error(err)
            }

            GenerateResultMail(options, emailtoOther,null ,options.forname,`Blood Test Result for ${options.forname} ${options.surname} - ${options.collectedon.substring(0,10)}` , attachments).then( ()=>
            {
                logger.debug(`Blood Test Result Mail Sent : ${filename}`);
            }).catch( (err) => logger.error(err));
            Link.updateOne({_id: documentId} , {isPCR: false, status: 'done', filename: filename,  surname: options.surname, forename: options.forname, birthDate: options.birthDate,testDate: options.testDate}, function (err, doc){
                if (err) {
                    logger.error(err);
                }
                else
                {
                    logger.debug(`file ${filename} is not a PCR file!`);
                }
            });
        }
    }).catch( (err) => {
        logger.error(`error parsing "${filename}" : ${err}`);
        sendLabFormatAlarm();
        Link.updateOne({_id: documentId} , {status: 'file_not_readable', filename: filename}, function (err, doc){
            if (err) {
                logger.error(err);
            }
        });
    });
}

async function GenerateResultMail(options, to , bcc, name, subject , attachments)
{
    var content = ``;
    content += `<div style="padding: '25px 0 10px 0'; width: 80%; font-size: 16px; line-height: 25px; font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;text-align: justify;color: #111 !important;">`

    content += `<img style="margin:10px" src="https://www.medicalexpressclinic.co.uk/public/design/images/medical-express-clinic-logo.png" alt="Medical Express Clinic - private clinic London">`;

    content += `<p>Dear ${name}, </p>`;

    var reportLink = '#';
    var certLink = '#';

    if (options.bookingId)
    {
        reportLink = `https://travelpcrtest.com/download/pdf/downloadpdfresult?id=${options.bookingId}`;
        certLink = `https://travelpcrtest.com/download/pdf/downloadpdfcert?id=${options.bookingId}`;
    }


    content += `<p>Please find attached results which for your privacy is password protected.</p>`;
    content += `<p>The password is your date of birth as <strong>DDMMYYYY</strong></p>`;
    content += `<p>You can also download your results report by clicking the link here : </p>`;
    content += `<p style="font-size:14px;">( PLEASE MAKE SURE YOU USE, YOUR DOB AS <strong>DDMMYYYY</strong> )</p>`;
    
    content += `<div style="padding: '25px 0 10px 0'; margin-top: 20px; margin-bottom:20px ; font-size: 16px; line-height: 25px; font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;text-align: left;color: #111 !important;">`;

    if (options.bookingId)
    {
        content += `<p> <a href="${reportLink}" target="_blank"> Download Laboratory Report </a> </p>`;

        if (attachments.length > 1)
        {
            content += `<p> <a href="${certLink}" target="_blank"> Download Certificate </a> </p>`;
        }
    }


    content += '</div>';

    content += `<p>If you’ve had a good experience at the clinic please let others know by leaving a review on our Google or Trustpilot pages. Thank you.</p>`;

    content += `<div style="padding: '25px 0 10px 0'; margin-top: 20px; margin-bottom:20px ; font-size: 16px; line-height: 25px; font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;text-align: left;color: #111 !important;">`;
    
    content += `<p><a href="${'https://uk.trustpilot.com/review/www.medicalexpressclinic.co.uk'}" target="_blank"> trust pilot </a> </p>`;

    content += `<p><a href="${'https://www.google.com/search?gs_ssp=eJwFwVEOgyAMANDsd7sEP37bhoYKR9glFlKKIUM0YjaO73vP17zOeH0d02eBR5hg0MIOY0Ikl222KcCwRKzC0aJ4AM_vadNUJFaj4zi1dyO1tCKm7i3tzZz6K_rvN5DQHDk&q=medical+express+clinic+london+reviews&oq=medical+&aqs=chrome.1.69i57j46i39i175i199j69i60l5j69i65.2146j0j7&sourceid=chrome&ie=UTF-8#lrd=0x48761ad1146f3f3d:0x3447ec7a31c90097,3'}" target="_blank"> google review link </a> </p>`;


    content += '</div>';

    
  
 
    content += `<p>For further assistance please don't hesitate to get in touch.</p>`;

    content += `<p>Kind Regards,</p>`;
    content += `<p>Medical Express Clinic</p>`;
    content += '</div>'

    content += `<div style="padding: '25px 0 10px 0'; margin-top:10px; font-size: 14px; font-weight: 600 ;line-height: 25px; font-family: sans-serif;text-align: center ;color: #000;">`;
    content += '<hr>'
    content += '***   If you believe you have received this email in error, please delete it and notify info@medicalexpressclinic.co.uk  ***'
    content+= `</div>`
     
    if (options.isPCR && options.negative.toLowerCase() === 'positive')
    {
        subject = 'POSITIVE ' + subject;
      
        if (process.env.NODE_ENV.toLowerCase() === 'production')
        {
            await sendMail('info@medicalexpressclinic.co.uk',null, subject , content , attachments );
            await sendMail('steve@medicalexpressclinic.co.uk',null, subject , content , attachments );
        }
    }

    const result = await sendMail(to, bcc, subject , content , attachments ); 
    
    return result;
}

async function sendPCRUnmatchedNotification (options){
    try{

        let subject = `NEW PCR UNMCATCHED RECORD FOUND! - ${options.forname} ${options.surname}`
        let content = `<div style="font-size:18px;font-weight:600">`
        
        content += `<p> NEW PCR UNMATCHED RECORD FOUND: </p>`
        content += `<p> Forename : ${options.forname} </p>`
        content += `<p> Surname : ${options.surname} </p>`
        content += `<p> BirthDate : ${options.birthDate} </p>`

        content += `</div>`

        await sendMail('info@medicalexpressclinic.co.uk',null, subject , content , null );
        await sendMail('matt@dubseo.co.uk',null, subject , content , null );
        await sendMail('m.jafarabdi@gmail.com',null, subject , content , null );

        

    }catch(err)
    {
        console.log(err)
    }
}

module.exports = attachmentHandlerModule;