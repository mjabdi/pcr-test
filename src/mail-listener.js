const mailListenerModule = {};
var MailListener = require("mail-listener2-updated");//require("mail-listener2");
const config = require('config');
const logger = require('./utils/logger')();
const application = require('./utils/application');
const fs = require('fs')
const path = require('path');
const { cat } = require("shelljs");
const { BloodReport } = require("./models/BloodReport");

var mailListener = null;
var isConnected = false;
var lastSeqNo = -1;

mailListenerModule.isConnected = () => {
  return isConnected;
}

mailListenerModule.disconnect = () => {
  if (mailListener != null) {
    mailListener.stop();
  }
}

mailListenerModule.registerForIncommingMails = (newLinkReceived) => {
  mailListener = new MailListener({
    username: config.MailAccount,
    password: config.MailPassword,
    host: "imap.gmail.com",
    port: 993, // imap port
    tls: true,
    connTimeout: 10000, // Default by node-imap
    authTimeout: 5000, // Default by node-imap,
    debug: null, // Or your custom function with only one incoming argument. Default: null
    tlsOptions: { rejectUnauthorized: false },
    mailbox: config.MailBoxFolder, // mailbox to monitor
    searchFilter: [config.MailSearchFilter || "UNSEEN"], // the search filter being used after an IDLE notification has been retrieved
    markSeen: config.MarkSeen, // all fetched email willbe marked as seen and not fetched next time
    fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
    mailParserOptions: { streamAttachments: true }, // options to be passed to mailParser lib.
    attachments: true, // download attachments as they are encountered to the project directory
    attachmentOptions: { directory: config.DownloadFolderPath } // specify a download directory for attachments
  });

  mailListener.start(); // start listening

  mailListener.on("server:connected", function () {
    isConnected = true;
    logger.info("connected to gmail");
  });

  mailListener.on("server:disconnected", function () {
    isConnected = false;
    logger.info("disconnected from gmail");
    application.shutdown();
  });

  mailListener.on("error", function (err) {
    isConnected = false;
    logger.error(err);
    application.shutdown();
  });

  mailListener.on("attachment", function (attachment, email) {
    // console.log(attachment.fileName);
    try{

      const fileName = path.join(config.DownloadFolderPath, attachment.fileName);
      var file = fs.createWriteStream(fileName);
  
      file.on('close', async () => {
        try{
          const bloodreport = new BloodReport(
              {
                  timeStamp: new Date(),
                  filename: attachment.fileName,
                  status: "not-parsed",
                  source: "email" 
              }
          )
          await bloodreport.save()

      }catch(err)
      {
          logger.error(err)
      }


      });
  
      attachment.stream.pipe(file)

    }catch(err)
    {
      logger.error(err)
    }




  });


  mailListener.on("mail", function (mail, seqno, attributes) {

    if (seqno < lastSeqNo) {
      return;
    }

    lastSeqNo = seqno;



    const linkIndex = mail.html ? mail.html.indexOf(config.EgressLinkKeyword) : -1

    if (linkIndex > 0) {
      const link = mail.html.substr(linkIndex, 74);
      logger.debug(`[${seqno}]:  new email received with link: ${link}`);
      newLinkReceived(link, seqno);
    }

  });
}





module.exports = mailListenerModule;




// it's possible to access imap object from node-imap library for performing additional actions. E.x.
//mailListener.imap.move(:msguids, :mailboxes, function(){})