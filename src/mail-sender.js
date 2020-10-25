const { cat } = require('shelljs');

const sendMail = async (receiver, subject, content, attachments) =>
{

    const send = require('gmail-send')({
        // user: 'm.jafarabdi2@gmail.com',
        // pass: 'baqimhtprmkkhepl',
        user: `results@medicalexpressclinic.co.uk`,
        pass: `nqpnhackfsqbzgxt`,
        to:   receiver,
        subject: subject,
    });

    try{
        const {result,full} = await send(
            {
                html:   content,
                files : attachments  
            }
        );
        console.log(result);
        if (result.indexOf('OK') > -1)
            return true;
        else
            return false;    
    }
    catch(error) {
        console.error('ERROR', error);
        return false;
    }
   
}

module.exports = sendMail;