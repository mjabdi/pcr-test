const pdfreader = require("pdfreader");

module.exports = async function (filePath) {

    return new Promise((resolve, reject) => {
        try {
            var textArray = [];
            var isNegative = false;
            var isPCR = false;
            var options = {};

            new pdfreader.PdfReader().parseFileItems(filePath, function (err, item) {
                if (!err && item && item.text) {
                    if (item.text.trim().length > 0)
                        textArray.push(item.text.trim());
                }

                if (!err && !item) {
                    //  console.log(textArray);

                    textArray.forEach((element, index) => {

                        if (element.toLowerCase() === 'name:') {
                            options.name = textArray[index + 1];
                        }
                        if (element.toLowerCase() === 'dob | age:') {
                            options.dob = textArray[index + 1].substr(0, 10);
                            options.birthDate = `${options.dob.substr(6, 4)}-${options.dob.substr(3, 2)}-${options.dob.substr(0, 2)}`;
                        }
                        if (element.toLowerCase() === 'collected:') {
                            options.collectedon = textArray[index + 1].substr(0, 10)
                            options.testDate = `${options.collectedon.substr(6, 4)}-${options.collectedon.substr(3, 2)}-${options.collectedon.substr(0, 2)}`;
                        }
                    })
                    resolve(options)
                }
            });


        } catch (err) {
            reject(err);
        }
    });
}
