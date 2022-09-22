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

    if (options.negative.toLowerCase() === 'positive')
    {
        return createCertificatePositive(options, passportNumber, passportNumber2, filename);
    }

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
                                                                        , 0, startY + 40  ,{width:615, align: 'center', characterSpacing : 0.8, wordSpacing : 1 , lineGap : 2 } );
                                                                        
            doc.fillColor('black').fontSize(18).font('Times-Bold').text(`DOB: ${NormalizeDate(options.birthDate)}` ,
                                                                         0 , startY + 70  ,{width:615, align: 'center', characterSpacing : 0.8, wordSpacing : 1 , lineGap : 2 } );
            // doc.fillColor('black').fontSize(12).font('Times-Bold').text(`Passport Number: ` 
            //                                                             , startX + 125, startY + 110  ,{characterSpacing : 0.5, wordSpacing : 0.8 , lineGap : 2 } );
            
            var passportStr = `${passportNumber}` ;                                                          
            if (passportNumber2 && passportNumber2.length > 0)
            {
                passportStr = `${passportNumber}  /  ${passportNumber2}`
            }

            
            doc.fillColor('black').fontSize(12).font('Times-Bold').text(`Passport Number: ${passportStr}`
                                                                         , 0 , startY + 110  ,{width:615, align: 'center', characterSpacing : 0.8, wordSpacing : 1 , lineGap : 2 } );

                                                    
           
            const today = parseDate(options.testDate);
            const customToday = dateFormat(today, 'dd/mm/yy');

            doc.fillColor('black').fontSize(12).font('Times-Bold').text(`Date of Test: ${customToday}` 
                                                      , 0, startY + 130 ,{width:600, align: 'center', characterSpacing : 0.5, wordSpacing : 0.5 , lineGap : 2 } );


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

            // doc.image('assets/purple-ukas-text.png',  startX + 300 , startY + 290 , {scale: 0.8});
            doc.image('assets/qr-code-blue.png',  startX + 400 , 680 , {scale: 0.8});


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

const createCertificatePositive = async (options, passportNumber, passportNumber2, filename) =>
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
            // const doc = new PDFDocument();

            const stream = fs.createWriteStream(filename);
            doc.pipe(stream);
        
            doc.image('assets/certificate-template.png', 0, 0,  {fit: [615, 800], align: 'center', valign: 'top'});


            doc.fillColor('black').fontSize(16).font('Times-Roman').text(`COVID TEST RESULTS EXPLAINED` , 155, 115  ,{characterSpacing : 0.6, wordSpacing : 0.8 , lineGap : 2} );
            doc.moveTo(155, 130).lineTo(435, 130).stroke('black'); 

            const startX = 80;
            const startY = 145;
            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`To Whom This May Concern,` , startX, startY  ,{characterSpacing : 0.8, wordSpacing : 1 , lineGap : 2 } );
            
            doc.fillColor('black').fontSize(16).font('Times-Bold').text(`${options.forname.toUpperCase()} ${options.surname.toUpperCase()}` 
                                                                        , 0, startY + 30  ,{width:615, align: 'center', characterSpacing : 0.8, wordSpacing : 1 , lineGap : 2 } );
                                                                        
            doc.fillColor('black').fontSize(16).font('Times-Bold').text(`DOB: ${NormalizeDate(options.birthDate)}` ,
                                                                         0 , startY + 60  ,{width:615, align: 'center', characterSpacing : 0.8, wordSpacing : 1 , lineGap : 2 } );

            var passportStr = passportNumber ? `${passportNumber}` : '' ;                                                          
            if (passportNumber2 && passportNumber2.length > 0)
            {
                passportStr = `${passportNumber}  /  ${passportNumber2}`
            }                                                        

            if (passportStr && passportStr.length > 0)
            {
                doc.fillColor('black').fontSize(12).font('Times-Bold').text(`Passport Number: ${passportStr}`
                , 0 , startY + 90  ,{width:615, align: 'center', characterSpacing : 0.8, wordSpacing : 1 , lineGap : 2 } );
            }
           

                                                    
           
            const today = parseDate(options.testDate);
            const customToday = dateFormat(today, 'dd/mm/yy');

            doc.fillColor('black').fontSize(12).font('Times-Bold').text(`Date of Test: ${customToday}` 
                                                      , 0, startY + 110 ,{width:600, align: 'center', characterSpacing : 0.5, wordSpacing : 0.5 , lineGap : 2 } );


            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`Your coronavirus test result is` , 
                                                                       startX - 16, startY + 140 ,{characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );
          
            doc.fillColor('black').fontSize(12).font('Times-Bold').text(`positive.` , 
                                                                        startX + 170 - 16, startY + 140 ,{characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`You had the virus when the test was` , 
                                                                        startX + 230 - 16, startY + 140 ,{characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

                                                                        
            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`done.` , 
                                                          0 , startY + 155 + 5 ,{width:600, align: 'center', characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`If you have not had symptoms of coronavirus, you must self-isolate for 10 days` , 
            0, startY + 170 + 10 ,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`from your test date. If you have symptoms of coronavirus, you must self-isolate` , 
                                                          0, startY + 185 + 15,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`for 10 days from the day your symptoms started, if earlier than when you took` , 
                                                          0, startY + 205 + 20 - 5,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`your test.` , 
                                                         0, startY + 220 + 25 - 5,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`People you live with or are travelling with should also self-isolate for 14 days` , 
                                         0, startY + 235 + 30 - 5 ,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`from the day you took a test.` , 
                                       0, startY + 250 + 35 - 5 ,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`People you live with or are travelling with should also self-isolate for 14 days` , 
                                     0, startY + 265 + 40 - 5,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

                                     
            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`beginning on the day you took the test.` , 
                                     0, startY + 280 + 45 - 5,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`You may be contacted for contact tracing and to check that you, and those who` , 
                                      0, startY + 295 + 50 - 5,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );   
                                        
            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`you live or are travelling with, are self-isolating.` , 
                                        0, startY + 310 + 55 - 5 ,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );  
          
            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`You must not travel, including to leave the UK, during self-isolation.` , 
                                        0, startY + 325 + 60 - 5 ,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );  

            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`Contact 111 if you need medical help. In an emergency dial 999.` , 
                                        0, startY + 340 + 65 - 5,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} ); 

        
           
            doc.image('assets/signature.png',  startX + 10 , startY + 440 - 5 , {scale: 0.35});

            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`Yours faithfully,` , 
                                           startX + 15, startY + 480 - 5 ,{characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 4 } );

            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`Dr Mohammad Bakhtiar` , 
                                                                     startX + 10, startY + 500 - 5,{characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 4 } );

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


