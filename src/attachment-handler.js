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
const { send } = require('process');
const P = require('pino');
const { link } = require('pdfkit/js/mixins/annotations');

const pdfFolder = config.PDFResultsFolderPath;
const emailto = config.TestReceiverMail;
const emailtoOther = config.TestReceiverMailOther;

attachmentHandlerModule.handleAttachment = (pdfFilePath, documentId) => {

    const filename = path.basename(pdfFilePath);

    const linkRecord = await Link.findOne({_id: documentId, emailNotFound: true});

    parsePDF(pdfFilePath).then( async (options) => 
    {
        if (options.isPCR){

            const certFilename = `certificate-${filename}`;

            const newFilePath = path.join(pdfFolder, filename);
            const certFilePath = path.join(pdfFolder, certFilename);

            var booking = null;

            if (linkRecord.extRef && linkRecord.extRef.length > 2)
            {
                const bookingMatched = await Booking.findOne({ extRef: linkRecord.extRef , deleted : {$ne : true }}).sort({timeStamp : -1}).exec();
                if (bookingMatched)
                {
                    options.extref = linkRecord.extRef;
                    options.birthDate = bookingMatched.birthDate;
                }
           }

            if (options.extref && options.extref.length > 2)
            {
                booking = await Booking.findOne({ extRef: options.extref, birthDate: options.birthDate, deleted : {$ne : true }}).sort({timeStamp : -1}).exec();
                if (booking)
                {
                    options.forname = booking.forenameCapital;
                    options.surname = booking.surnameCapital;
                }
            }
           
            if (!booking)
            {
                booking = await Booking.findOne({ forenameCapital : options.forname, surnameCapital: options.surname, birthDate: options.birthDate, deleted : {$ne : true }}).sort({timeStamp : -1}).exec();
            }
            
            if (!booking)
            {
                if (options.forname.indexOf(' ') > 0)
                {
                    const fornamePart1 =  options.forname.substr(0, options.forname.indexOf(' '));
                    booking = await Booking.findOne({ forenameCapital : fornamePart1, surnameCapital: options.surname, birthDate: options.birthDate, deleted : {$ne : true }}).sort({timeStamp : -1}).exec();
                    if (booking)
                    {
                        options.forname = fornamePart1;
                    }
                }

            }

          
            if (!booking)
            {
                await Link.updateOne({_id: documentId} , {emailNotFound: true});
            }
            else
            {
                await Link.updateOne({_id: documentId} , {emailNotFound: false});
            }

            var sendCert = false;

            if (booking && booking.certificate && options.negative.toLowerCase() === 'negative')
            {
                await createCertificate(options, booking.passportNumber, booking.passportNumber2 , certFilePath);
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
                if (booking && options.negative.toLowerCase() === 'negative')
                {
                    recepients.push(booking.email);
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
                                    if (booking.certificate)
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

module.exports = attachmentHandlerModule;