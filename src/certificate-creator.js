const PDFDocument = require('pdfkit');
const fs = require('fs');
var dateFormat = require('dateformat');

function capitalizeFirstLetter(str) {
    const result = str.toLowerCase();
    return result.charAt(0).toUpperCase() + result.slice(1);
  }
  function NormalizeDate(date)
  {
      return `${date.substr(8,2)}/${date.substr(5,2)}/${date.substr(0,4)}` ;
  }

  function parseDate(str)
  {
      var year = parseInt(str.substr(0,4));
      var month = parseInt(str.substr(5,2));
      var day = parseInt(str.substr(8,2));
      return new Date(year,month,day);
  }

const createCertificate = async (options, passportNumber , filename) =>
{

    return new Promise( (resolve, reject) => 
    {
        try
        {
            const doc = new PDFDocument;
            const stream = fs.createWriteStream(filename);
            doc.pipe(stream);
        
            doc.image('assets/certificate-template.png', 0, 0,  {fit: [615, 800], align: 'center', valign: 'top'});

            const startX = 80;
            const startY = 200;
            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`To Whom this may concern` , startX, startY  ,{characterSpacing : 0.8, wordSpacing : 1 , lineGap : 2 } );
            
            doc.fillColor('black').fontSize(12).font('Times-Bold').text(`Re: ${capitalizeFirstLetter(options.title)} ${capitalizeFirstLetter(options.forname)} ${capitalizeFirstLetter(options.surname)}` , startX, startY + 50  ,{characterSpacing : 0.8, wordSpacing : 1 , lineGap : 2 } );
            doc.fillColor('black').fontSize(12).font('Times-Bold').text(`DOB: ${NormalizeDate(options.birthDate)}` , startX, startY + 75  ,{characterSpacing : 0.8, wordSpacing : 1 , lineGap : 2 } );
            doc.fillColor('black').fontSize(12).font('Times-Bold').text(`Passport Number: ${passportNumber}` , startX, startY + 100  ,{characterSpacing : 0.8, wordSpacing : 1 , lineGap : 2 } );

            console.log(options.testDate);
            const testDate = parseDate(options.testDate);
            const customTestDate = dateFormat(testDate, 'd"th" mmmm yyyy');

            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`This is to confirm that the above person shown to be negative from the RT-PCR COVID-19 nasopharyngeal swab test on ${customTestDate}.` , 
                                                                startX, startY + 150 ,{characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 4 } );

            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`I heereby declare that the patient is fit for their booked journey.` , 
                                                                        startX, startY + 200 ,{characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 4 } );

           
            doc.image('assets/signature.png',  startX + 10, startY + 270 , {scale: 0.4});

            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`Yours faithfully,` , 
                                           startX, startY + 250 ,{characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 4 } );

            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`Dr Mohammad Bakhtiar` , 
                                                                     startX, startY + 310 ,{characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 4 } );

            doc.end();
    
            stream.on( 'close' , () =>
            {
                resolve();
            });
        }
        catch(err)
        {
            reject(err);
        }
    });
}

module.exports = createCertificate


