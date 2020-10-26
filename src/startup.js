require('events').EventEmitter.defaultMaxListeners = 0;

const checkConfig =  require('./startup/config');
const application = require('./utils/application');
const mailListener = require('./mail-listener');
const linkSubscriber = require('./link-subscriber');
const dbListener = require('./db-listener');
const attachmentHandler = require('./attachment-handler');
const mongodb = require('./mongodb');
const {recoverFailedDownloads} = require('./db-recovery');

let ready = false;

async function run()
{
    //** Gobal Error Handling */
    application.registerGlobalErrorHandler();
    //** */

    //** checking for required configs */
    checkConfig();
    //** */

    await mongodb();

    await recoverFailedDownloads();

    mailListener.registerForIncommingMails(linkSubscriber.linkReceived);

    dbListener.registerForIncommingLinks(attachmentHandler.handleAttachment);

    //** doing all the neccessary things and cleanup procedures before shutdown  */
    application.registerForGracefulShutdown(mailListener);
    //** */
    
    ready = true;
}

run();

module.exports.ready = () => {return ready};
module.exports.live = () => {return ready};