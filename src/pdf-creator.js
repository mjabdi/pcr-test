const PDFDocument = require('pdfkit');
const fs = require('fs');
const dateformat = require('dateformat');

const NormalizeDatePassword = (str) =>
{
    const year = str.substr(0,4);
    const month = str.substr(5,2);
    const day = str.substr(8,2);

    return `${day}${month}${year}`;
}

const createPDF = async (options , filename) =>
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

            const dd = options.birthDate.substr(8,2);
            const mm = options.birthDate.substr(5,2);
            const yyyy = options.birthDate.substr(0,4);

            options.dob = `${dd}/${mm}/${yyyy} ${options.dob.substring(10)}`;
        


            doc.pipe(stream);
        
            // doc.image('assets/logo.JPG', 400, 20,  {scale: 0.4});
            doc.image('assets/londonclinic.png', 70, 80,  {scale: 0.6});
            
            // doc.fillColor('green').fontSize(13)//.font('Helvetica')
            //    .text('Pathology Report', {characterSpacing : 1.5}, 38,0);
            
            // doc.fillColor('grey').fontSize(10).font('Courier').text('T: 020 7616 7755');  
            // doc.fillColor('grey').fontSize(10).font('Courier').text('F: 020 7616 7681');
           
            doc.fillColor('black').fontSize(10).font('Courier').text('THE LONDON CLINIC PATHOLOGY REPORT', 190, 120, {characterSpacing : 1, wordSpacing : 1.5 , align : 'left'} );
            doc.fillColor('black').fontSize(10).font('Courier').text('Direct Line: 020 7646 7755', 190, 135, {characterSpacing : 1, wordSpacing : 1.5 , align : 'left'} );
            doc.fillColor('black').fontSize(10).font('Courier').text(' Email: path7@thelondonclinic.co.uk', 190, 150, {characterSpacing : 1, wordSpacing : 1.5 , align : 'left'} );

           
            
            doc.fillColor('black').fontSize(10).font('Courier').text('Medical Express', 75, 200 ,{characterSpacing : 1, wordSpacing : 1.5 , lineGap : 2 } );
            doc.fillColor('black').fontSize(10).font('Courier').text('Medical Express Clinic',75, 215, {characterSpacing : 1, wordSpacing : 1.5 });
            doc.fillColor('black').fontSize(10).font('Courier').text('117a Harley Street', 75, 230, {characterSpacing : 1, wordSpacing : 1.5 });
            doc.fillColor('black').fontSize(10).font('Courier').text('London', 75, 245, {characterSpacing : 1, wordSpacing : 1.5 });
            doc.fillColor('black').fontSize(10).font('Courier').text('W1G 6AT', 75, 260, {characterSpacing : 1, wordSpacing : 1.5 });
            
            doc.fillColor('black').fontSize(10).font('Courier').text(`Surname`, 360, 185, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`${options.surname}`, 420, 185, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`Forename`, 360, 200, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`${options.forname}`, 420, 200, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`Title`, 360, 215, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`${options.title}`, 420, 215, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`D.O.B`, 360, 230, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`${options.dob}`, 420, 230, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`MPI No`, 360, 245, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`${options.mpino}`, 420, 245, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`Location`, 360, 260, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`${options.location}`, 420, 260, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`Ext Ref`, 360, 275, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`${options.extref}`, 420, 275, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            
            doc.moveTo(50, 300).lineTo(550, 300).stroke(); 
            
            doc.fillColor('black').fontSize(10).font('Courier').text(`Collected on`, 280, 310, {characterSpacing : 1, wordSpacing : 1 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`${options.collectedon}`, 380, 310, {characterSpacing : 1, wordSpacing : 1 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`Received on`, 280, 325, {characterSpacing : 1, wordSpacing : 1 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`${options.receivedon}`, 380, 325, {characterSpacing : 1, wordSpacing : 1 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`Lab.No`, 280, 340, {characterSpacing : 1, wordSpacing : 1 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`${options.labno}`, 380, 340, {characterSpacing : 1, wordSpacing : 1 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`Sample: ${options.sample}`, 280, 355, {characterSpacing : 1, wordSpacing : 1 , lineGap : 2 }  );
            
            doc.moveTo(50, 375).lineTo(550, 375).stroke(); 
            
            doc.fillColor('black').fontSize(10).font('Courier').text(`Novel CoronaVirus RNA (RT-PCR)`, 50, 390, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`SARS-COV-2 (COVID-19) RNA`, 50, 405, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
           
            if (options.negative.toLowerCase() === 'negative')
            {
                doc.fillColor('green').fontSize(10).font('Courier-Bold').text(`${options.negative}`, 270, 405, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            }
            else
            {
                doc.fillColor('red').fontSize(12).font('Courier-Bold').text(`${options.negative}`, 270, 405, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            }
        
            doc.fillColor('black').fontSize(10).font('Courier').text(`This is a CE marked assay and has been verified for use.`, 50, 420, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`The laboratory has applied to UKAS for it to be`, 50, 435, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`added to its accredited test repertoire.`, 50, 450, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            
            doc.fillColor('black').fontSize(9).font('Courier').text(`Reported on ${options.reportedon}    Run number ${options.runno}   MECON ${options.mecon}`, 50, 610, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(9).font('Courier').text(`Authorised on behalf of Consultant Pathologist`, 50, 625, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(9).font('Courier').text(`Microbiology`, 50, 645, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            
            doc.fillColor('grey').fontSize(9).font('Courier').text(`The London Clinic 20 Devonshire Place London W1G6BW`, 50, 680, {characterSpacing : 1, wordSpacing : 2 , lineGap : 1 , align : 'center' }  );
            doc.fillColor('grey').fontSize(9).font('Courier').text(`T +44 (0) 20 7935 4444 F +44 (0) 20 7486 3782 www.thelondonclinic.co.uk`, 50, 692, {characterSpacing : 1, wordSpacing : 1 , lineGap : 2 , align : 'center' }  );
            doc.fillColor('grey').fontSize(8).font('Courier').text(`Registered in England No 307579 Registered Charity No 211136`, 50, 708, {characterSpacing : 1, wordSpacing : 2 , lineGap : 1 , align : 'center' }  );
            
         
         
            if (options.negative.toLowerCase() === 'negative')
            {
                /// Draw the Stamp
                const x = 300;
                const y = 480;
                const width = 200;
                const height = 80;
                color = 'grey';
                const now = new Date();
                const todayString = dateformat(now, 'dd mmm yyyy').toUpperCase();
                
                doc.moveTo(x, y).lineTo(x + width, y).stroke(color); 
                doc.moveTo(x , y).lineTo(x, y + height).stroke(color); 
                doc.moveTo(x, y + height).lineTo(x + width, y + height).stroke(color);
                doc.moveTo(x + width, y).lineTo(x + width, y + height).stroke(color);
                
                doc.fillColor(color).fontSize(11).font('Times-Roman').text(`RESULTS`, x + 5, y + 5, {characterSpacing : 0.8, wordSpacing : 1 , lineGap : 1 , underline : true });
                doc.fillColor(color).fontSize(11).font('Times-Roman').text(`DATE RECEIVED`, x + 5, y + 18, {characterSpacing : 0.8, wordSpacing : 1 , lineGap : 1 });
                doc.fillColor(color).fontSize(11).font('Times-Bold').text(`${todayString}`, x + 110, y + 18, {characterSpacing : 1, wordSpacing : 2 , lineGap : 1 });
                doc.fillColor(color).fontSize(11).font('Times-Roman').text(`Normal`, x + 5, y + 18 + 13, {characterSpacing : 0.8, wordSpacing : 1 , lineGap : 1 });
                // doc.fillColor(color).fontSize(11).font('Times-Roman').text(`Action:`, x + 5, y + 18 + 13 + 13, {characterSpacing : 0.8, wordSpacing : 1 , lineGap : 1 });
                doc.fillColor(color).fontSize(11).font('Times-Roman').text(`Doctor:`, x + 5, y + 18 + 13 + 13 + 5 , {characterSpacing : 0.8, wordSpacing : 1 , lineGap : 1 });
                // doc.fillColor(color).fontSize(11).font('Times-Roman').text(`Date:`, x + 5, y + 18 + 13 + 13 + 13 + 13, {characterSpacing : 0.8, wordSpacing : 1 , lineGap : 1 });
                doc.fillColor(color).fontSize(11).font('Times-Roman').text(`Note Comments`, x + 5 + 65, y + 18 + 13, {characterSpacing : 0.8, wordSpacing : 1 , lineGap : 1 });
        
                doc.image('assets/checkbox-tick2.png', x + 48, y + 18 + 12,  {scale: 0.38});
                doc.image('assets/checkbox2.png', x + 158, y + 18 + 12,  {scale: 0.38});
                doc.image('assets/signature.png', x + 70, y + 18 + 5 + 20 , {scale: 0.4});
                //doc.fillColor(color).fontSize(11).font('Symbol').text(`☑`, x + 5 + 40, y + 150, {characterSpacing : 0.8, wordSpacing : 1 , lineGap : 1 });
               ///-----------------
            }


      
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

module.exports = createPDF


