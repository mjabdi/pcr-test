const pdfreader = require("pdfreader");

module.exports = async function(filePath){
    
    return new Promise( (resolve , reject) =>
    {
        try{
            var textArray = [];
            var isNegative = false;
            var isPCR = false;
            var options = {};
    
            new pdfreader.PdfReader().parseFileItems(filePath, function (err, item) {
                if (!err && item && item.text)
                {
                    if (item.text.trim().length > 0)
                        textArray.push(item.text.trim());
                }
     
                if (!err && !item)
                {
                     //console.log(textArray);

                    textArray.forEach( (element , index) => {
    
                        if (element.toLowerCase() === 'surname')
                        {
                            options.surname = textArray[index + 1];
                            var i = index + 2;
                            while (textArray[i].toLowerCase() != 'medical')
                            {
                                options.surname += (' ' + textArray[i]);
                                i++;
                            }
                        }   
                        if (element.toLowerCase() === 'forename')
                        {
                            options.forname = textArray[index + 1];
                            var i = index + 2;
                            while (textArray[i].toLowerCase() !== 'medical' && textArray[i].toLowerCase() !== 'emailed')
                            {
                                options.forname += (' ' + textArray[i]);
                                i++;
                            }
                        }   
    
                        if (element.toLowerCase() === 'title')
                        {
                            options.title = textArray[index + 1];
                        }   
    
                        if (element.toLowerCase() === 'd.o.b')
                        {
                            options.dob = textArray[index + 1] + ' ' +  textArray[index + 2] + ' ' + textArray[index + 3];
                            options.birthDate = `${options.dob.substr(6,4)}-${options.dob.substr(3,2)}-${options.dob.substr(0,2)}`;
                        }   
    
                        if (element.toLowerCase() === 'mpi' && textArray[index + 1].toLowerCase() === 'no')
                        {
                            options.mpino = textArray[index + 2];
                        }   
    
                        if (element.toLowerCase() === 'location')
                        {
                            if (textArray[index + 1].toLowerCase() != 'ext')
                            {
                                options.location = textArray[index + 1];
                            }else{
                                options.location = '';
                            }
                        }  
    
                        if (element.toLowerCase() === 'ext' && textArray[index + 1].toLowerCase() === 'ref')
                        {
                            if (textArray[index + 2].indexOf('__') > -1)
                            {
                                options.extref = '';
                            }else
                            {
                                options.extref = textArray[index + 2];
                            }
                        } 
    
                        if (element.toLowerCase() === 'collected' && textArray[index + 1].toLowerCase() === 'on')
                        {
                            options.collectedon = textArray[index + 2] + ' ' + textArray[index + 3] + ' ' + textArray[index + 4];
                            options.testDate = `${options.collectedon.substr(6,4)}-${options.collectedon.substr(3,2)}-${options.collectedon.substr(0,2)}`;
                        } 
    
                        if (element.toLowerCase() === 'received' && textArray[index + 1].toLowerCase() === 'on')
                        {
                            options.receivedon = textArray[index + 2] + ' ' + textArray[index + 3] + ' ' + textArray[index + 4];
                        } 
    
                        if (element.toLowerCase() === 'lab.no')
                        {
                            options.labno = textArray[index + 1];
                        }   
                        
                        if (element.toLowerCase() === 'negative')
                        {          
                            isNegative = true;
                        }
    
                        if (element.toLowerCase() === '(rt-pcr)')
                        {          
                            isPCR = true;
                        }
    
                        if (element.toLowerCase() === 'reported' && textArray[index + 1].toLowerCase() === 'on')
                        {
                            options.reportedon = textArray[index + 2] + ' ' + textArray[index + 3] + ' ' + textArray[index + 4];
                        } 
    
                        if (element.toLowerCase() === 'run' && textArray[index + 1].toLowerCase() === 'number')
                        {
                            options.runno = textArray[index + 2] ;
                        } 
    
                        if (element.toLowerCase() === 'mecon')
                        {
                            options.mecon = textArray[index + 1];
                        }   
    
                        if (element.toLowerCase() === 'sample:')
                        {
                            options.sample = textArray[index + 1];
                            var i = index + 2;
                            while (textArray[i].indexOf('__') < 0)
                            {
                                options.sample += (' ' + textArray[i]);
                                i++;
                            }
                        }   
                    });
    
                    options.isPCR = isPCR;
    
                    if (isNegative) {
                        options.negative = 'Negative';
                    }else
                    {
                        options.negative = 'Positive';
                    }
    
                    resolve(options);
                }
            });
        }catch(err)
        {
            reject(err);
        }
    });
}
