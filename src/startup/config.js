const config = require('config');
const logger = require('./../utils/logger')();
const application = require('./../utils/application');

module.exports = () => {

    const requiredConfigs = [   
        'EgressAccount',
        'EgressPassword',     
        'MailAccount',
        'MailPassword',
        'MailBoxFolder',
        'MarkSeen',
        'TestReceiverMailActive',
        'TestReceiverMail',
        'EgressLinkKeyword',
        'ChromeDownloadFolderPath',
        'DownloadFolderPath',
        'PDFResultsFolderPath',
        'MongodbUrl'
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