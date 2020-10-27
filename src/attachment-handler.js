const attachmentHandlerModule = {};

const {Link} = require('./models/link');
const parsePDF = require('./pdf-parser');
const config = require('config');
const logger = require('./utils/logger')();
const path = require('path');
const sendMail = require('./mail-sender');
const createPDF = require('./pdf-creator');
const fs = require('fs');
const shell = require('shelljs');

const pdfFolder = config.PDFResultsFolderPath;
const emailto = config.TestReceiverMail;
const emailtoOther = config.TestReceiverMailOther;

attachmentHandlerModule.handleAttachment = (pdfFilePath, documentId) => {

    logger.debug(`attachmentHandlerModule.handleAttachment called with ${pdfFilePath}`);

    const filename = path.basename(pdfFilePath);

    parsePDF(pdfFilePath).then( (options) => 
    {
        if (options.isPCR){

            const newFilePath = path.join(pdfFolder, filename);

            createPDF(options , newFilePath).then( () => {
                const attachments = [
                    {
                        path: newFilePath,
                        filename: filename
                    }
                ];
                
                GenerateResultMail(emailto, options.forname,`COVID-19 Result for ${options.forname} ${options.surname} - ${options.collectedon.substring(0,10)}` , attachments).then( (result) => {

                    if (result)
                    {
                        Link.updateOne({_id: documentId} , {isPCR: true, status: 'sent', filename: filename, surname: options.surname, forename: options.forname, result: options.negative}, function (err, doc){
                            if (err) {
                                logger.error(err);
                            }
                            else
                            {
                                logger.info(`file ${filename} successfully sent.`);
                            }
                        });

                        try{
                            const sentFilePath = path.join(pdfFolder, 'sent', filename);
                            if (fs.existsSync(sentFilePath))
                            {
                                shell.rm('-f' , [newFilePath]);
                            }
                            else
                            {
                                shell.mv(newFilePath, sentFilePath);
                            }
                        }
                        catch(err)
                        {
                            logger.error(err);
                        }
                    }
                    else
                    {
                        Link.updateOne({_id: documentId} , {isPCR: true, status: 'error_mail_send', filename: filename, surname: options.surname, forename: options.forname, result: options.negative}, function (err, doc){
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
                    Link.updateOne({_id: documentId} , {isPCR: true, status: 'error_mail_send', filename: filename, surname: options.surname, forename: options.forname, result: options.negative}, function (err, doc){
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
            GenerateResultMail(emailtoOther, options.forname,`Blood Test Result for ${options.forname} ${options.surname} - ${options.collectedon.substring(0,10)}` , attachments).then( ()=>
            {
                logger.debug(`Blood Test Result Mail Sent : ${filename}`);
            }).catch( (err) => logger.error(err));
            Link.updateOne({_id: documentId} , {isPCR: false, status: 'done', filename: filename,  surname: options.surname, forename: options.forname}, function (err, doc){
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

async function GenerateResultMail(to, name, subject , attachments)
{
    var content = `<p class="MsoNormal" style="margin:0in 0in 10pt;line-height:16.8667px">Dear ${name} <br></p>`;
    content += '<p class="MsoNormal" style="margin:0in 0in 10pt;line-height:16.8667px">We attached your laboratory result herewith for your perusal.<br></p>';
    content += '<p class="MsoNormal" style="margin:0in 0in 10pt;line-height:16.8667px">For further inquiries, please do not hesitate to contact us.<br><br></p>';
    // content += '<p class="MsoNormal" style="margin:0in 0in 10pt;line-height:16.8667px">Have a safe flight!</p>';
    content += '<p class="MsoNormal" style="margin:0in 0in 10pt;line-height:16.8667px">Best Regards<br></p>';
    content += '<p class="MsoNormal" style="margin:0in 0in 10pt;line-height:16.8667px">Medical Express Clinic<br></p>';
     
    const result = await sendMail(to, subject , content , attachments );
    
    return result;
}

module.exports = attachmentHandlerModule;