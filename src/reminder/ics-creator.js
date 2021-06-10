const ics = require('ics');

const createICS = async (date, time, name, email) => {

    return new Promise( (resolve , reject) => {

        const year = parseInt(date.substr(0,4));
        const month = parseInt(date.substr(5,2));
        const day = parseInt(date.substr(8,2));

        const hour = parseInt(time.substr(0,2));
        const minute = parseInt(time.substr(3,2));

        console.log(`date : ${date}   time : ${time}`);
        

        const event = {
            start: [year, month, day, hour, minute],
            duration: { hours: 0, minutes: 15 },
            title: 'Appointment with Medical Express Clinic',
            description: 'Appointment with Medical Express Clinic',
            location: 'Suite E, 117a Harley St, Marylebone, London W1G 6AT',
            url: 'https://www.medicalexpressclinic.co.uk/',
            geo: { lat: 51.521740, lon: -0.148420},
            categories: ['Doctor Appointment'],
            status: 'CONFIRMED',
            busyStatus: 'BUSY',
            organizer: { name: 'https://www.medicalexpressclinic.co.uk/', email: 'info@medicalexpressclinic.co.uk' },
            attendees: [
              { name: name, email: email, rsvp: true, partstat: 'ACCEPTED', role: 'REQ-PARTICIPANT' }
            ]
          };
    
          ics.createEvent(event, (error, value) => {
            if (error) {
              console.log(error);
              reject(error);
            }else
            {
                resolve(value);
            }
        });
    });
}

module.exports = {
    createICS : createICS
}