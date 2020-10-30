const PDFDocument = require('pdfkit');
const fs = require('fs');
var dateFormat = require('dateformat');



const createPDF = async (options , filename) =>
{

    return new Promise( (resolve, reject) => 
    {
        try
        {
            const doc = new PDFDocument;
            const stream = fs.createWriteStream(filename);
            doc.pipe(stream);
        
            doc.image('assets/logo.JPG', 400, 20,  {scale: 0.4});
            
            doc.fillColor('green').fontSize(13)//.font('Helvetica')
               .text('Pathology Report', {characterSpacing : 1.5}, 38,0);
            
            doc.fillColor('grey').fontSize(10).font('Courier').text('T: 020 7616 7755');  
            doc.fillColor('grey').fontSize(10).font('Courier').text('F: 020 7616 7681');
            doc.moveDown(2);
            doc.fillColor('black').fontSize(10).font('Courier').text('THE LONDON CLINIC PATHOLOGY REPORT', {characterSpacing : 1, wordSpacing : 1.5 , align : 'center'} );
            
            doc.fillColor('black').fontSize(10).font('Courier').text('Medical Express', {characterSpacing : 1, wordSpacing : 1.5 , lineGap : 2 } , 170, 50 );
            doc.fillColor('black').fontSize(10).font('Courier').text('emailed Report', {characterSpacing : 1, wordSpacing : 1.5 });
            
            doc.fillColor('black').fontSize(10).font('Courier').text(`Surname`, 360, 140, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`${options.surname}`, 420, 140, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`Forename`, 360, 155, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`${options.forname}`, 420, 155, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`Title`, 360, 170, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`${options.title}`, 420, 170, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`D.O.B`, 360, 185, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`${options.dob}`, 420, 185, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`MPI No`, 360, 200, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`${options.mpino}`, 420, 200, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`Location`, 360, 215, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`${options.location}`, 420, 215, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`Ext Ref`, 360, 230, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`${options.extref}`, 420, 230, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            
            doc.moveTo(50, 250).lineTo(550, 250).stroke(); 
            
            doc.fillColor('black').fontSize(10).font('Courier').text(`Collected on`, 280, 265, {characterSpacing : 1, wordSpacing : 1 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`${options.collectedon}`, 380, 265, {characterSpacing : 1, wordSpacing : 1 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`Received on`, 280, 280, {characterSpacing : 1, wordSpacing : 1 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`${options.receivedon}`, 380, 280, {characterSpacing : 1, wordSpacing : 1 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`Lab.No`, 280, 295, {characterSpacing : 1, wordSpacing : 1 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`${options.labno}`, 380, 295, {characterSpacing : 1, wordSpacing : 1 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`Sample: ${options.sample}`, 280, 310, {characterSpacing : 1, wordSpacing : 1 , lineGap : 2 }  );
            
            doc.moveTo(50, 330).lineTo(550, 330).stroke(); 
            
            doc.fillColor('black').fontSize(10).font('Courier').text(`Novel CoronaVirus RNA (RT-PCR)`, 50, 335, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`SARS-COV-2 (COVID-19) RNA`, 50, 350, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
           
            if (options.negative.toLowerCase() === 'negative')
            {
                doc.fillColor('green').fontSize(10).font('Courier-Bold').text(`${options.negative}`, 270, 350, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            }
            else
            {
                doc.fillColor('red').fontSize(12).font('Courier-Bold').text(`${options.negative}`, 270, 350, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            }
        
            doc.fillColor('black').fontSize(10).font('Courier').text(`This is a CE marked assay and has been verified for use.`, 50, 365, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`The laboratory has applied to UKAS for it to be`, 50, 380, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(10).font('Courier').text(`added to its accredited test repertoire.`, 50, 395, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            
            doc.fillColor('black').fontSize(9).font('Courier').text(`Reported on ${options.reportedon}    Run number ${options.runno}   MECON ${options.mecon}`, 50, 610, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(9).font('Courier').text(`Authorised on behalf of Consultant Pathologist`, 50, 625, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            doc.fillColor('black').fontSize(9).font('Courier').text(`Microbiology`, 50, 645, {characterSpacing : 1, wordSpacing : 2 , lineGap : 2 }  );
            
            doc.fillColor('grey').fontSize(9).font('Courier').text(`The London Clinic 20 Devonshire Place London W1G6BW`, 50, 680, {characterSpacing : 1, wordSpacing : 2 , lineGap : 1 , align : 'center' }  );
            doc.fillColor('grey').fontSize(9).font('Courier').text(`T +44 (0) 20 7935 4444 F +44 (0) 20 7486 3782 www.thelondonclinic.co.uk`, 50, 692, {characterSpacing : 1, wordSpacing : 1 , lineGap : 2 , align : 'center' }  );
            doc.fillColor('grey').fontSize(8).font('Courier').text(`Registered in England No 307579 Registered Charity No 211136`, 50, 708, {characterSpacing : 1, wordSpacing : 2 , lineGap : 1 , align : 'center' }  );
            
            /// Draw the Stamp
            const x = 300;
            const y = 430;
            const width = 200;
            const height = 80;
            color = 'grey';
            const now = new Date();
            const todayString = dateFormat(now, 'dd mmm yyyy').toUpperCase();
            
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


