const dbListenerModule = {};

const config = require("config");
const logger = require("./utils/logger")();
const { Link } = require("./models/link");
const browseLink = require("./browsing-bot");
const dateformat = require("dateformat");
const { Booking } = require("./models/Booking");
const { sendConfirmationEmail, sendReminderEmail } = require("./reminder/email-service");
const {sendReminderTextMessage} = require("./reminder/sms-service")
const { cat } = require("shelljs");
const { GlobalParams } = require("./models/GlobalParams");
const { BloodReport } = require("./models/BloodReport");
const parseBloodReport = require("./pdf-parser-email")
const path = require("path");
const { BloodBooking } = require("./models/BloodBooking");
const { GPBooking } = require("./models/GPBooking");
const { GynaeBooking } = require("./models/GynaeBooking");
const { STDBooking } = require("./models/STDBooking");
const { ScreeningBooking } = require("./models/ScreeningBooking");
const { DermaBooking } = require("./models/DermaBooking");
const { CorporateBooking } = require("./models/CorporateBooking");



const { callRestAPI_POST, callRestAPI_GET } = require("./rest-api-call");


let timerNew;
let timerRetry;
let timerGC;
let timerReminder;

let timerUpdateStats;
let timerUpdateStatsLast7;
let timerUpdateStatsLast30;


let timerParseBloodReports;

let timerMatchBloodReports;

let timerCallSendReminderSMS_DrSIA;

let timerCallGenerateInvoiceReports;


dbListenerModule.stop = () => {
  if (timerNew) {
    clearInterval(timerNew);
  }

  if (timerRetry) {
    clearInterval(timerRetry);
  }

  if (timerGC) {
    clearInterval(timerGC);
  }

  if (timerReminder) {
    clearInterval(timerReminder);
  }

  if (timerUpdateStats) {
    clearInterval(timerUpdateStats);
  }

  if (timerUpdateStatsLast7) {
    clearInterval(timerUpdateStatsLast7);
  }

  if (timerUpdateStatsLast30) {
    clearInterval(timerUpdateStatsLast30);
  }


  if (timerParseBloodReports) {
    clearInterval(timerParseBloodReports)
  }

  if (timerMatchBloodReports) {
    clearInterval(timerMatchBloodReports)
  }

  if (timerCallSendReminderSMS_DrSIA){
    clearInterval(timerCallSendReminderSMS_DrSIA)
  }

  if (timerCallGenerateInvoiceReports){
    clearInterval(timerCallGenerateInvoiceReports)
  }

  

};

dbListenerModule.registerForIncommingLinks = (handleAttachment) => {
  dbListenerModule.handleAttachment = handleAttachment;
  timerNew = setInterval(() => {
    checkForLink("new");
  }, 1 * 10 * 1000);

  timerRetry = setInterval(() => {
    checkForLink("downloadFailed");
  }, 1 * 8 * 1000);

  timerGC = setInterval(() => {
    deleteOldBookings();
  }, 1 * 60 * 1000);

  timerReminder = setInterval(() => {
    sendReminders();
  }, 1 * 70 * 1000);

  timerUpdateStats = setInterval(() => {
    updateStats();
  }, 100 * 60 * 1000);

  timerUpdateStatsLast7 = setInterval(() => {
    updateStatsLast7();
  }, 60 * 60 * 1000);

  timerUpdateStatsLast30 = setInterval(() => {
    updateStatsLast30();
  }, 60 * 65 * 1000);


  timerParseBloodReports = setInterval(() => {
    parseBloodReports()
  }, 2000);

  timerParseBloodReports = setInterval(() => {
    matchBloodReports()
  }, 3000);

  timerCallSendReminderSMS_DrSIA = setInterval(() => {
    callSendReminderSMS_DrSIA()
  }, 2 * 60 * 1000);

  timerCallGenerateInvoiceReports = setInterval(() => {
    callGenerateInvoiceReports ()
  }, 60 * 70 * 1000);
  
};


async function callGenerateInvoiceReports ()
{
  callRestAPI_POST('/api/medex/invoice/calculateinvoicereports')
}

async function callSendReminderSMS_DrSIA ()
{
   callRestAPI_POST('/api/dentist/book/checkandsendpaymentreminders')
   callRestAPI_POST('/api/dentist/book/checkanddeleteexpiredbookings')
}


async function matchBloodReports() {
  try {

    const bloodreport = await BloodReport.findOne({ status: "new" }).sort({ timeStamp: 1 }).exec();

    if (!bloodreport)
      return

    const bookings = await BloodBooking.aggregate([
      {
        $match: {
          $and: [
            { bookingDate: bloodreport.testDate },
            { deleted: { $ne: true } },
          ],
        },
      },
      {
        $addFields: { clinic: "blood" },
      },
      {
        $unionWith: {
          coll: "gynaebookings",
          pipeline: [
            {
              $match: {
                $and: [
                  { bookingDate: bloodreport.testDate },
                  { deleted: { $ne: true } },
                ],
              },
            },

            {
              $addFields: { clinic: "gynae" },
            },
          ],
        },
      },
      {
        $unionWith: {
          coll: "gpbookings",
          pipeline: [
            {
              $match: {
                $and: [
                  { bookingDate: bloodreport.testDate },
                  { deleted: { $ne: true } },
                ],
              },
            },

            {
              $addFields: { clinic: "gp" },
            },
          ],
        },
      },
      {
        $unionWith: {
          coll: "stdbookings",
          pipeline: [
            {
              $match: {
                $and: [
                  { bookingDate: bloodreport.testDate },
                  { deleted: { $ne: true } },
                ],
              },
            },

            {
              $addFields: { clinic: "std" },
            },
          ],
        },
      },
      {
        $unionWith: {
          coll: "screeningbookings",
          pipeline: [
            {
              $match: {
                $and: [
                  { bookingDate: bloodreport.testDate },
                  { deleted: { $ne: true } },
                ],
              },
            },

            {
              $addFields: { clinic: "screening" },
            },
          ],
        },
      },

      {
        $unionWith: {
          coll: "corporatebookings",
          pipeline: [
            {
              $match: {
                $and: [
                  { bookingDate: bloodreport.testDate },
                  { deleted: { $ne: true } },
                ],
              },
            },

            {
              $addFields: { clinic: "corporate" },
            },
          ],
        },
      },


      {
        $sort: { timeStamp: 1 },
      },
    ]).exec();

    if (!bookings || bookings.length === 0)
    {
      bloodreport.status = "unmatched"
      await bloodreport.save()
      return
    }
      

    const booking = bookings.find(e => e.fullname.toUpperCase() === bloodreport.name.toUpperCase())

    if (!booking) {
      bloodreport.status = "unmatched"
    }
    else {
      bloodreport.status = "matched"
      bloodreport.bookingId = booking._id
      bloodreport.clinic = booking.clinic
      if (booking.email && booking.email.length > 3) {
        bloodreport.email = booking.email
      }
    }

    await bloodreport.save()

  }
  catch (err) {
    logger.error(err)
  }

}

async function parseBloodReports() {
  try {
    const bloodreport = await BloodReport.findOne({ status: "not-parsed" }).sort({ timeStamp: 1 }).exec();

    if (!bloodreport)
      return

    const options = await parseBloodReport(path.join(config.DownloadFolderPath, bloodreport.filename))

    bloodreport.name = options.name
    bloodreport.birthDate = options.birthDate
    bloodreport.testDate = options.testDate
    bloodreport.status = "new"

    await bloodreport.save()

  } catch (err) {
    logger.error(err)
  }
}

async function updateStats() {
  try {
    const bookings = await Booking.find({
      $or: [{ status: "report_sent" }, { status: "report_cert_sent" }],
    })
      .sort({ timeStamp: -1 })
      .exec();
    const Links = await Link.find({ isPCR: true })
      .sort({ timeStamp: -1 })
      .exec();

    var lessThan12 = 0;
    var lessThan24 = 0;
    var lessThan36 = 0;
    var lessThan48 = 0;
    var totoalTime = 0;

    var totalCount = 0;

    for (var i = 0; i < bookings.length; i++) {
      let booking = bookings[i];

      if (!booking.samplingTimeStamp) {
        booking.samplingTimeStamp = createTimeStampFromBookingDate(
          booking.bookingDate,
          booking.bookingTime
        );
      }

      const link = Links.find((link) => link.filename === booking.filename);

      if (link) {
        const delay = parseInt(
          (link.timeStamp - booking.samplingTimeStamp) / (3600 * 1000)
        );

        if (delay <= 12) lessThan12++;
        else if (delay <= 24) lessThan24++;
        else if (delay <= 36) lessThan36++;
        else if (delay <= 48) lessThan48++;

        if (delay <= 48) {
          totoalTime += delay;
          totalCount++;
        }
      }
    }

    const lessThan12Percent = ((lessThan12 / totalCount) * 100).toFixed(1);
    const lessThan24Percent = ((lessThan24 / totalCount) * 100).toFixed(1);
    const lessThan36Percent = ((lessThan36 / totalCount) * 100).toFixed(1);
    const lessThan48Percent = ((lessThan48 / totalCount) * 100).toFixed(1);

    let result = {
      lessThan12,
      lessThan24,
      lessThan36,
      lessThan48,
      lessThan12Percent,
      lessThan24Percent,
      lessThan36Percent,
      lessThan48Percent,
      avg: (totoalTime / totalCount).toFixed(1),
    };
    result = JSON.stringify(result);

    const found = await GlobalParams.findOne({ name: "testTimeReport" });

    if (found) {
      found.value = result;
      await found.save();
    } else {
      const newRecord = new GlobalParams({
        name: "testTimeReport",
        lastExtRef: 1,
        value: result,
      });
      newRecord.save();
    }
  } catch (err) {
    logger.error(err);
  }
}

async function updateStatsLast7() {
  try {

    const today = new Date()
    const prev7days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    prev7days.setHours(0)

    const bookings = await Link.aggregate([

      {
        "$lookup": {
          "from": "bookings",
          "localField": "filename",
          "foreignField": "filename",
          "as": "R"
        }
      },
      { "$unwind": "$R" },
      {
        "$match": {
          "$and": [
            { "isPCR": true },
            { "timeStamp": { $gt: prev7days } },
          ]
        }
      },
    ]);


    var lessThan12 = 0;
    var lessThan24 = 0;
    var lessThan36 = 0;
    var lessThan48 = 0;
    var totoalTime = 0;

    var totalCount = 0;

    for (var i = 0; i < bookings.length; i++) {
      let booking = bookings[i];

      if (!booking.R.samplingTimeStamp) {
        booking.R.samplingTimeStamp = createTimeStampFromBookingDate(
          booking.R.bookingDate,
          booking.R.bookingTime
        );
      }

      const delay = parseInt(
        (booking.timeStamp - booking.R.samplingTimeStamp) / (3600 * 1000)
      );

      if (delay <= 12) lessThan12++;
      else if (delay <= 24) lessThan24++;
      else if (delay <= 36) lessThan36++;
      else if (delay <= 48) lessThan48++;

      if (delay <= 48) {
        totoalTime += delay;
        totalCount++;
      }
    }

    const lessThan12Percent = ((lessThan12 / totalCount) * 100).toFixed(1);
    const lessThan24Percent = ((lessThan24 / totalCount) * 100).toFixed(1);
    const lessThan36Percent = ((lessThan36 / totalCount) * 100).toFixed(1);
    const lessThan48Percent = ((lessThan48 / totalCount) * 100).toFixed(1);

    let result = {
      lessThan12,
      lessThan24,
      lessThan36,
      lessThan48,
      lessThan12Percent,
      lessThan24Percent,
      lessThan36Percent,
      lessThan48Percent,
      avg: (totoalTime / totalCount).toFixed(1),
    };
    result = JSON.stringify(result);

    const found = await GlobalParams.findOne({ name: "testTimeReportLast7" });

    if (found) {
      found.value = result;
      await found.save();
    } else {
      const newRecord = new GlobalParams({
        name: "testTimeReportLast7",
        lastExtRef: 1,
        value: result,
      });
      newRecord.save();
    }
  } catch (err) {
    logger.error(err);
  }
}


async function updateStatsLast30() {
  try {

    const today = new Date()
    const prev30days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    prev30days.setHours(0)

    const bookings = await Link.aggregate([

      {
        "$lookup": {
          "from": "bookings",
          "localField": "filename",
          "foreignField": "filename",
          "as": "R"
        }
      },
      { "$unwind": "$R" },
      {
        "$match": {
          "$and": [
            { "isPCR": true },
            { "timeStamp": { $gt: prev30days } },
          ]
        }
      },
    ]);


    var lessThan12 = 0;
    var lessThan24 = 0;
    var lessThan36 = 0;
    var lessThan48 = 0;
    var totoalTime = 0;

    var totalCount = 0;

    for (var i = 0; i < bookings.length; i++) {
      let booking = bookings[i];

      if (!booking.R.samplingTimeStamp) {
        booking.R.samplingTimeStamp = createTimeStampFromBookingDate(
          booking.R.bookingDate,
          booking.R.bookingTime
        );
      }

      const delay = parseInt(
        (booking.timeStamp - booking.R.samplingTimeStamp) / (3600 * 1000)
      );

      if (delay <= 12) lessThan12++;
      else if (delay <= 24) lessThan24++;
      else if (delay <= 36) lessThan36++;
      else if (delay <= 48) lessThan48++;

      if (delay <= 48) {
        totoalTime += delay;
        totalCount++;
      }
    }

    const lessThan12Percent = ((lessThan12 / totalCount) * 100).toFixed(1);
    const lessThan24Percent = ((lessThan24 / totalCount) * 100).toFixed(1);
    const lessThan36Percent = ((lessThan36 / totalCount) * 100).toFixed(1);
    const lessThan48Percent = ((lessThan48 / totalCount) * 100).toFixed(1);

    let result = {
      lessThan12,
      lessThan24,
      lessThan36,
      lessThan48,
      lessThan12Percent,
      lessThan24Percent,
      lessThan36Percent,
      lessThan48Percent,
      avg: (totoalTime / totalCount).toFixed(1),
    };
    result = JSON.stringify(result);

    const found = await GlobalParams.findOne({ name: "testTimeReportLast30" });

    if (found) {
      found.value = result;
      await found.save();
    } else {
      const newRecord = new GlobalParams({
        name: "testTimeReportLast30",
        lastExtRef: 1,
        value: result,
      });
      newRecord.save();
    }
  } catch (err) {
    logger.error(err);
  }
}



function createTimeStampFromBookingDate(date, time) {
  var hour = parseInt(time.substr(0, 2));
  const minutes = parseInt(time.substr(3, 2));
  const isPM = time.toLowerCase().indexOf("pm") > 0;

  if (isPM && hour < 12) {
    hour += 12;
  }

  if (!isPM && hour === 12) {
    hour = 0;
  }

  const year = parseInt(date.substr(0, 4));
  const month = parseInt(date.substr(5, 2)) - 1;
  const day = parseInt(date.substr(8, 2));

  return new Date(year, month, day, hour, minutes, 0, 0);
}

async function sendReminders() {
  const now = new Date();

  if (now.getHours() < 18 || now.getHours() > 19) return;

  const tomorrow = new Date(new Date().getTime() + 86400000);
  const tomorrowStr = dateformat(tomorrow, "yyyy-mm-dd");

  const condition = {bookingDate: tomorrowStr, reminderSent: { $ne: true }, dontSendReminder: {$ne: true}}

  const result = await Booking.aggregate([
      { $addFields: { fullname: { $concat: [ "$forename", " ", "$surname" ] } } },
      {
        $match: {
          $and: [{ deleted: { $ne: true } }, condition],
          
        },
      },
      {
        $addFields: { clinic: "pcr" },
      },
      {
        $unionWith: {
          coll: "gynaebookings",
          pipeline: [
            {
              $match: {
                $and: [{ deleted: { $ne: true } }, condition],
                
              },
            },

            {
              $addFields: { clinic: "gynae" },
            },
          ],
        },
      },
      {
        $unionWith: {
          coll: "gpbookings",
          pipeline: [
            {
              $match: {
                $and: [{ deleted: { $ne: true } }, condition],
                
              },
            },

            {
              $addFields: { clinic: "gp" },
            },
          ],
        },
      },
      {
        $unionWith: {
          coll: "stdbookings",
          pipeline: [
            {
              $match: {
                $and: [{ deleted: { $ne: true } }, condition],
                
              },
            },

            {
              $addFields: { clinic: "std" },
            },
          ],
        },
      },
      {
        $unionWith: {
          coll: "bloodbookings",
          pipeline: [
            {
              $match: {
                $and: [{ deleted: { $ne: true } }, condition],
                
              },
            },

            {
              $addFields: { clinic: "blood" },
            },
          ],
        },
      },
      {
        $unionWith: {
          coll: "dermabookings",
          pipeline: [
            {
              $match: {
                $and: [{ deleted: { $ne: true } }, condition],
                
              },
            },

            {
              $addFields: { clinic: "derma" },
            },
          ],
        },
      },
      {
        $unionWith: {
          coll: "screeningbookings",
          pipeline: [
            {
              $match: {
                $and: [{ deleted: { $ne: true } }, condition],
                
              },
            },

            {
              $addFields: { clinic: "screening" },
            },
          ],
        },
      },

      {
        $unionWith: {
          coll: "corporatebookings",
          pipeline: [
            {
              $match: {
                $and: [{ deleted: { $ne: true } }, condition],
                
              },
            },

            {
              $addFields: { clinic: "corporate" },
            },
          ],
        },
      },


      {
        $sort: { bookingDate: -1, bookingTimeNormalized: -1 },
      },
    ])
      .limit(1)
      .exec();

  try {
    if (result && result.length > 0) {
      const booking = result[0]
      if (booking.email && booking.email.length > 3)
      {
        await sendReminderEmail(booking);
      }

      if (booking.smsPush && booking.phone && booking.phone.length > 3)
      {
          let _phone = booking.phone

          if (_phone.startsWith("07") && _phone.length === 11)
          {
              _phone = `+447${_phone.substr(2,10)}`
          }else if (_phone.startsWith("7") && _phone.length === 10)
          {
              _phone = `+447${_phone.substr(1,10)}`
          }

          if (_phone.length === 13 && _phone.startsWith('+447'))
          {
            try {
              await sendReminderTextMessage(booking, _phone)
              logger.info(
                `Appointment Reminder SMS Sent for : ${booking.fullname.toUpperCase()}`
              );

            } catch (err) {
              logger.error(err)
            }
          }
      }


      switch (booking.clinic)
      {
        case "pcr": 
          await Booking.updateOne({ _id: booking._id }, { reminderSent: true });
          break;
        case "gp": 
          await GPBooking.updateOne({ _id: booking._id }, { reminderSent: true });
          break;
        case "gynae": 
          await GynaeBooking.updateOne({ _id: booking._id }, { reminderSent: true });
          break;
        case "std": 
          await STDBooking.updateOne({ _id: booking._id }, { reminderSent: true });
          break;
        case "blood": 
          await BloodBooking.updateOne({ _id: booking._id }, { reminderSent: true });
          break;
        case "screening": 
          await ScreeningBooking.updateOne({ _id: booking._id }, { reminderSent: true });
          break;
        case "corporate": 
          await CorporateBooking.updateOne({ _id: booking._id }, { reminderSent: true });
          break;
  
        case "derma": 
          await DermaBooking.updateOne({ _id: booking._id }, { reminderSent: true });
          break;
  
        default :
          logger.error("No clinic was set!");
      }
      logger.info(
        `Appointment Reminder Email Sent for : ${booking.fullname.toUpperCase()}`
      );
    }
  } catch (err) {
    logger.error(err);
  }
}

function deleteOldBookings() {
  const yesterday = new Date(new Date().getTime() - 86400000);
  const yesterdayStr = dateformat(yesterday, "yyyy-mm-dd");

  Booking.updateMany(
    { $and: [{ bookingDate: { $lt: yesterdayStr } }, { status: "booked" }, { paid: { $ne : true} } ] },
    { deleted: true },
    function (err, result) {
      if (!err) {
        result = JSON.parse(JSON.stringify(result));
        if (result && result.nModified > 0) {
          logger.info(`${result.nModified} old booking(s) deleted from db.`);
        }
      } else {
        logger.error(err);
      }
    }
  );

  BloodBooking.updateMany(
    { $and: [{ bookingDate: { $lt: yesterdayStr } }, { status: "booked" }, { paid: { $ne : true} } ] },
    { deleted: true },
    function (err, result) {
      if (!err) {
        result = JSON.parse(JSON.stringify(result));
        if (result && result.nModified > 0) {
          logger.info(`${result.nModified} old Blood-booking(s) deleted from db.`);
        }
      } else {
        logger.error(err);
      }
    }
  );

  GPBooking.updateMany(
    { $and: [{ bookingDate: { $lt: yesterdayStr } }, { status: "booked" }, { paid: { $ne : true} } ] },
    { deleted: true },
    function (err, result) {
      if (!err) {
        result = JSON.parse(JSON.stringify(result));
        if (result && result.nModified > 0) {
          logger.info(`${result.nModified} old GP-booking(s) deleted from db.`);
        }
      } else {
        logger.error(err);
      }
    }
  );

  ScreeningBooking.updateMany(
    { $and: [{ bookingDate: { $lt: yesterdayStr } }, { status: "booked" }, { paid: { $ne : true} } ] },
    { deleted: true },
    function (err, result) {
      if (!err) {
        result = JSON.parse(JSON.stringify(result));
        if (result && result.nModified > 0) {
          logger.info(`${result.nModified} old Screening-booking(s) deleted from db.`);
        }
      } else {
        logger.error(err);
      }
    }
  );

  CorporateBooking.updateMany(
    { $and: [{ bookingDate: { $lt: yesterdayStr } }, { status: "booked" }, { paid: { $ne : true} } ] },
    { deleted: true },
    function (err, result) {
      if (!err) {
        result = JSON.parse(JSON.stringify(result));
        if (result && result.nModified > 0) {
          logger.info(`${result.nModified} old Corporate-booking(s) deleted from db.`);
        }
      } else {
        logger.error(err);
      }
    }
  );

  // GynaeBooking.updateMany(
  //   { $and: [{ bookingDate: { $lt: yesterdayStr } }, { status: "booked" }] },
  //   { deleted: true },
  //   function (err, result) {
  //     if (!err) {
  //       result = JSON.parse(JSON.stringify(result));
  //       if (result && result.nModified > 0) {
  //         logger.info(`${result.nModified} old Gynae-booking(s) deleted from db.`);
  //       }
  //     } else {
  //       logger.error(err);
  //     }
  //   }
  // );

  STDBooking.updateMany(
    { $and: [{ bookingDate: { $lt: yesterdayStr } }, { status: "booked" }, { paid: { $ne : true} } ] },
    { deleted: true },
    function (err, result) {
      if (!err) {
        result = JSON.parse(JSON.stringify(result));
        if (result && result.nModified > 0) {
          logger.info(`${result.nModified} old STD-booking(s) deleted from db.`);
        }
      } else {
        logger.error(err);
      }
    }
  );







}

function checkForLink(linkStatus) {
  Link.findOne(
    { status: linkStatus },
    ["rawLink"],
    { limit: 1, sort: { seqNo: 1 } },
    function (err, doc) {
      if (err) {
        logger.error(err);
      } else if (doc) {
        logger.debug(`Document Feteched: ${doc}`);
        Link.updateOne(
          { _id: doc._id },
          { status: "downloading" },
          function (err2, doc2) {
            if (err2) {
              logger.error(err2);
            } else {
              logger.debug(`Document with id ${doc._id} is set to downloading`);
              browseLink(doc.rawLink)
                .then((filePath) => {
                  Link.updateOne(
                    { _id: doc._id },
                    { status: "downloadSuccess" },
                    function (err3, doc3) {
                      if (err3) {
                        logger.error(err3);
                      } else {
                        logger.debug(
                          `download succeed for link: ${doc.rawLink} to file ${filePath}`
                        );
                        dbListenerModule.handleAttachment(filePath, doc._id);
                      }
                    }
                  );
                })
                .catch((err) => {
                  Link.updateOne(
                    { _id: doc._id },
                    { status: "downloadFailed" },
                    function (err3, doc3) {
                      if (err3) {
                        logger.error(err3);
                      } else {
                        logger.warn(`download failed for link: ${doc.rawLink}`);
                      }
                    }
                  );
                });
            }
          }
        );
      }
    }
  );
}

module.exports = dbListenerModule;
