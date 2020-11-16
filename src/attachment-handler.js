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

const pdfFolder = config.PDFResultsFolderPath;
const emailto = config.TestReceiverMail;
const emailtoOther = config.TestReceiverMailOther;

attachmentHandlerModule.handleAttachment = (pdfFilePath, documentId) => {

    const filename = path.basename(pdfFilePath);

    parsePDF(pdfFilePath).then( async (options) => 
    {
        if (options.isPCR){

            const certFilename = `certificate-${filename}`;

            const newFilePath = path.join(pdfFolder, filename);
            const certFilePath = path.join(pdfFolder, certFilename);

            var booking = await Booking.findOne({ forenameCapital : options.forname, surnameCapital: options.surname, birthDate: options.birthDate, deleted : {$ne : true }}).sort({timeStamp : -1}).exec();
            
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
    var content = `<p class="MsoNormal" style="margin:0in 0in 10pt;line-height:16.8667px">Dear ${name}, <br></p>`;
    content += `<p class="MsoNormal" style="margin:0in 0in 10pt;line-height:16.8667px">Please find attached your laboratory report`;
    if (attachments.length > 1)
    {
        content += ` and your requested certificate`;
    }
    
    content += `.<br></p>`;
    content += `<p class="MsoNormal" style="margin:0in 0in 10pt;line-height:16.8667px">For further assistance please don't hesitate to get in touch.<br><br></p>`;
    // content += '<p class="MsoNormal" style="margin:0in 0in 10pt;line-height:16.8667px">Have a safe flight!</p>';
    content += '<p class="MsoNormal" style="margin:0in 0in 10pt;line-height:16.8667px">Kind Regards,<br></p>';
    content += '<p class="MsoNormal" style="margin:0in 0in 10pt;line-height:16.8667px">Medical Express Clinic<br></p>';
     
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