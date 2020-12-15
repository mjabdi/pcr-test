const PDFDocument = require('pdfkit');
const fs = require('fs');
var dateFormat = require('dateformat');


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

const createTRCertificate = (options, passportNumber, filename) =>
{
   
    if (options.negative.toLowerCase() === 'negative')
    {
        return createCertificateNegative(options,passportNumber,filename);

    }else if (options.negative.toLowerCase() === 'positive')
    {
        return createCertificatePositive(options,passportNumber,filename);

    }else if (options.negative.toLowerCase() === 'inconclusive')
    {
        return createCertificateInconclusive(options,passportNumber,filename);

    }else
    {
        throw new Error(`options.negative is not recognized : ${options.negative}`);
    }
}

const createCertificatePositive = async (options, passportNumber, filename) =>
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
        
            var passportStr = `${passportNumber}` ;                                                          
           
            
            doc.fillColor('black').fontSize(12).font('Times-Bold').text(`Passport Number: ${passportStr}`
                                                                         , 0 , startY + 90  ,{width:615, align: 'center', characterSpacing : 0.8, wordSpacing : 1 , lineGap : 2 } );

                                                    
           
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

const createCertificateInconclusive = async (options, passportNumber, filename) =>
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
        
            var passportStr = `${passportNumber}` ;                                                          
           
            
            doc.fillColor('black').fontSize(12).font('Times-Bold').text(`Passport Number: ${passportStr}`
                                                                         , 0 , startY + 90  ,{width:615, align: 'center', characterSpacing : 0.8, wordSpacing : 1 , lineGap : 2 } );

                                                    
           
            const today = parseDate(options.testDate);
            const customToday = dateFormat(today, 'dd/mm/yy');

            doc.fillColor('black').fontSize(12).font('Times-Bold').text(`Date of Test: ${customToday}` 
                                                      , 0, startY + 110 ,{width:600, align: 'center', characterSpacing : 0.5, wordSpacing : 0.5 , lineGap : 2 } );


            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`Your coronavirus test result is` , 
                                                                       startX - 16, startY + 140 ,{characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );
          
            doc.fillColor('black').fontSize(12).font('Times-Bold').text(`unclear.` , 
                                                                        startX + 170 - 16, startY + 140 ,{characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`This means it’s not possible to say if` , 
                                                                        startX + 230 - 16, startY + 140 ,{characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

                                                                        
            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`you had the virus when the test was done.` , 
                                                          0 , startY + 155 + 5 ,{width:600, align: 'center', characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`You must, by law, continue self-isolating for the remainder of your self-` , 
            0, startY + 170 + 10 + 20 ,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`isolation period as an international arrival travelling to the UK from a non-` , 
                                                          0, startY + 185 + 15 + 20,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`excempt country, territory or region. You may be contacted to check that you are` , 
                                                          0, startY + 205 + 20 - 5 + 20,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`self-isolating.` , 
                                                         0, startY + 220 + 25 - 5 + 20,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`If you want to shorten your self-isolation period you will need to take another` , 
                                         0, startY + 235 + 30 - 5 + 40 ,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`test for international arrivals. For more information, go to https://www.gov.uk/` , 
                                       0, startY + 250 + 35 - 5 + 40 ,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`guidance/coronavirus-covid-19-test-to-release-for-international-travel/` , 
                                     0, startY + 265 + 40 - 5 + 40,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

                                     
        
           
            doc.image('assets/signature.png',  startX + 10 , startY + 400 - 5 , {scale: 0.35});

            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`Yours faithfully,` , 
                                           startX + 15, startY + 440 - 5 ,{characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 4 } );

            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`Dr Mohammad Bakhtiar` , 
                                                                     startX + 10, startY + 460 - 5,{characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 4 } );

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


const createCertificateNegative = async (options, passportNumber, filename) =>
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
        
            var passportStr = `${passportNumber}` ;                                                          
           
            
            doc.fillColor('black').fontSize(12).font('Times-Bold').text(`Passport Number: ${passportStr}`
                                                                         , 0 , startY + 90  ,{width:615, align: 'center', characterSpacing : 0.8, wordSpacing : 1 , lineGap : 2 } );

                                                    
           
            const today = parseDate(options.testDate);
            const customToday = dateFormat(today, 'dd/mm/yy');

            doc.fillColor('black').fontSize(12).font('Times-Bold').text(`Date of Test: ${customToday}` 
                                                      , 0, startY + 110 ,{width:600, align: 'center', characterSpacing : 0.5, wordSpacing : 0.5 , lineGap : 2 } );


            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`Your coronavirus test result is` , 
                                                                       startX - 16, startY + 140 ,{characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );
          
            doc.fillColor('black').fontSize(12).font('Times-Bold').text(`negative.` , 
                                                                        startX + 170 - 16, startY + 140 ,{characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`You did not have the virus when the test` , 
                                                                        startX + 230 - 16, startY + 140 ,{characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

                                                                        
            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`was done. If you were self-isolating as an international arrival you may stop self-` , 
                                                          0 , startY + 155 + 5 ,{width:600, align: 'center', characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`isolating.` , 
            0, startY + 170 + 10 ,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`You should self-isolate if:` , 
                                                          0, startY + 190 + 15,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 2 , lineGap : 1} );

            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`you get symptoms of coronavirus (you should get an NHS coronavirus test and` , 
                                                          0, startY + 205 + 20,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`self-isolate until you get the results)` , 
                                                         0, startY + 220 + 25,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`you’re going into hospital (self-isolating until the date you go in)` , 
                                         0, startY + 235 + 30 ,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`someone you live with tests positive` , 
                                       0, startY + 250 + 35 ,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`you’ve been traced as a contact of someone who tested positive` , 
                                     0, startY + 265 + 40,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

                                     
            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`For advice on when you might need to self-isolate and what to do, go` , 
                                     0, startY + 280 + 45 ,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );

            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`to www.nhs.uk/conditions/coronavirus-covid-19 and read ‘Self-isolation and` , 
                                      0, startY + 295 + 50 ,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );   
                                        
            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`treating symptoms’.` , 
                                        0, startY + 310 + 55 ,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );  
          
            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`It is a legal requirement to self-isolate when you arrive in the UK from a non-` , 
                                        0, startY + 325 + 60 ,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} );  

            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`exempt country, territory or region. If you are contacted by the enforcement` , 
                                        0, startY + 340 + 65,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} ); 

            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`authorities or the police after you have received this negative result please show` , 
                                        0, startY + 355 + 70,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} ); 

            doc.fillColor('black').fontSize(11).font('Times-Roman').text(`them this notification.` , 
                                        0, startY + 370 + 75 ,{width:600, align: 'center',characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 1} ); 






                                                          

           
            doc.image('assets/signature.png',  startX + 10 , startY + 450 , {scale: 0.35});

            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`Yours faithfully,` , 
                                           startX + 15, startY + 490 ,{characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 4 } );

            doc.fillColor('black').fontSize(12).font('Times-Roman').text(`Dr Mohammad Bakhtiar` , 
                                                                     startX + 10, startY + 510 ,{characterSpacing : 0.7, wordSpacing : 0.8 , lineGap : 4 } );

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


module.exports = createTRCertificate


