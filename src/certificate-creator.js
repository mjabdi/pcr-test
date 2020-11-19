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
      var month = parseInt(str.substr(5,2)) - 1;
      var day = parseInt(str.substr(8,2));
      return new Date(year,month,day);
  }

  const NormalizeDatePassword = (str) =>
{
    const year = str.substr(0,4);
    const month = str.substr(5,2);
    const day = str.substr(8,2);

    return `${day}${month}${year}`;
}

const createCertificate = async (options, passportNumber, passportNumber2 , filename) =>
{

    return new Promise( (resolve, reject) => 
    {
        try
        {
            const pdfOptions = {
                userPassword : NormalizeDatePassword(options.birthDate),
                ownerPassword : 'mecpcr117',
                permissions :
                {
                    printing : 'highResolution',
                    modifying : false,
                    copying : false,
                    annotating : false,
                    fillingForms : false,
                    contentAccessibility : false,
                    documentAssembly : false
                },
                // pdfVersion : '1.7ext3'
            }
            const doc = new PDFDocument(pdfOptions);
            const stream = fs.createWriteStream(filename);
            doc.pipe(stream);
        
            doc.image('assets/certificate-template.png', 0, 0,  {fit: [615, 800], align: 'center', valign: 'top'});


            doc.fillColor('black').fontSize(18).font('Times-Roman').text(`MEDICAL CERTIFICATE OF FITNESS TO FLY` , 100, 135  ,{characterSpacing : 0.8, wordSpacing : 1 , lineGap : 2} );
            doc.moveTo(100, 150).lineTo(500, 150).stroke('black'); 

            const startX = 80;
            const startY = 220;
            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`To Whom This May Concern,` , startX, startY  ,{characterSpacing : 0.8, wordSpacing : 1 , lineGap : 2 } );
            
            doc.fillColor('black').fontSize(18).font('Times-Bold').text(`${options.forname.toUpperCase()} ${options.surname.toUpperCase()}` 
                                                                        , startX + 120, startY + 40  ,{characterSpacing : 0.8, wordSpacing : 1 , lineGap : 2 } );
            doc.fillColor('black').fontSize(18).font('Times-Bold').text(`DOB: ${NormalizeDate(options.birthDate)}` ,
                                                                         startX + 130, startY + 70  ,{characterSpacing : 0.8, wordSpacing : 1 , lineGap : 2 } );
            doc.fillColor('black').fontSize(12).font('Times-Bold').text(`Passport Number: ` 
                                                                        , startX + 125, startY + 110  ,{characterSpacing : 0.5, wordSpacing : 0.8 , lineGap : 2 } );
            
            var passportStr = `${passportNumber}` ;                                                          
            if (passportNumber2 && passportNumber2.length > 0)
            {
                passportStr = `${passportNumber}  /  ${passportNumber2}`
            }

            
            doc.fillColor('black').fontSize(12).font('Times-Bold').text(`${passportStr}`
                                                                         , startX + 235, startY + 110  ,{characterSpacing : 0.8, wordSpacing : 1 , lineGap : 2 } );

                                                    
           
            const today = parseDate(options.testDate);
            const customToday = dateFormat(today, 'dd/mm/yy');

            doc.fillColor('black').fontSize(12).font('Times-Bold').text(`Date of Test: ${customToday}` 
                                                      , startX + 140, startY + 125  ,{characterSpacing : 0.5, wordSpacing : 0.5 , lineGap : 2 } );


            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`This is to confirm that the above person shown to be` , 
                                                                       startX, startY + 160 ,{characterSpacing : 0.7, wordSpacing : 2 , lineGap : 1} );
          
            doc.fillColor('black').fontSize(12).font('Times-Bold').text(`negative` , 
                                                                        startX + 315, startY + 160 ,{characterSpacing : 0.7, wordSpacing : 2 , lineGap : 1} );

            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`from their` , 
                                                                        startX + 370, startY + 160 ,{characterSpacing : 0.7, wordSpacing : 2 , lineGap : 1} );

                                                                        
            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`RT-PCR COVID-19 nasopharyngeal swab test performed at the Medical Express` , 
                                                          startX - 15, startY + 180 ,{characterSpacing : 0.7, wordSpacing : 2 , lineGap : 1} );

            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`Clinic of 117a Harley Street, Marylebone, London.` , 
                                                          startX + 70, startY + 200 ,{characterSpacing : 0.7, wordSpacing : 2 , lineGap : 1} );

            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`I hearby declare the above named patient is fit-to-fly for their booked journey.` , 
                                                          startX + 20, startY + 240 ,{characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

           
            doc.image('assets/signature.png',  startX , startY + 340 , {scale: 0.6});

            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`Yours faithfully,` , 
                                           startX, startY + 290 ,{characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 4 } );

            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`Dr Mohammad Bakhtiar` , 
                                                                     startX, startY + 400 ,{characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 4 } );

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


