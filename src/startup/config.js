const config = require('config');
const logger = require('./../utils/logger')();
const application = require('./../utils/application');

module.exports = () => {

    const requiredConfigs = [   
        'EgressAccount',
        'EgressPassword',     
        'MailAccount',
        'MailPassword',
        'SendMailAccount',
        'SendMailPassword',
        'MailBoxFolder',
        'MarkSeen',
        'TestReceiverMailActive',
        'TestReceiverMail',
        'TestReceiverMailOther',
        'EgressLinkKeyword',
        'ChromeDownloadFolderPath',
        'DownloadFolderPath',
        'PDFResultsFolderPath',
        'MongodbUrl',
        'S3EndPoint',
        'S3AccessKey',
        'S3SecretKey',
        'S3BucketName'
    ];

    let error = false;
    requiredConfigs.forEach((param) => {
        if (!config.get(param)) {
            logger.fatal(`FATAL ERROR: Config: '${param}' is not set.`);
            error = true;
        }
    });

    if (error) {
        application.shutdown();
    }
}