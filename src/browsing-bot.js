const puppeteer  = require ('puppeteer');
const fs = require('fs');
const shell = require('shelljs');
const config = require('config');
const logger = require('./utils/logger')();
const path = require('path');
const AWS = require("aws-sdk");
const {sendEgressAlarm} = require('./utils/alarm');
const { v4: uuidv4 } = require("uuid");
const PdfReader = require("pdfreader").PdfReader;

const s3 = new AWS.S3({
  endpoint: config.S3EndPoint,
  accessKeyId: config.S3AccessKey,
  secretAccessKey: config.S3SecretKey,
  region: "lon1"
});

const downloadFolder = config.ChromeDownloadFolderPath;
const destinationFolder = config.DownloadFolderPath;
const egressAccount = config.EgressAccount;
const egressPassword = config.EgressPassword;

let isBrowsing = false;

module.exports =  async function (linkAdress) {
 
    while (isBrowsing)
    {
        await sleep(5000);
    }
    
    isBrowsing = true;
    let browser = null;

    try {
      browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      await page.goto(linkAdress);
      const cookieBannerSelector = "button.btn.btn-blue";
      const button = await page.$(cookieBannerSelector);
      if (button) {
        console.log(
          'Cookie banner found. Clicking the "I understand" button...'
        );
        await button.click();
        console.log("Redirected to:", page.url());
      } else {
        console.log("Cookie banner not found.");
      }
      const loginButtonSelector = "#btnLogin";
      await page.waitForSelector(loginButtonSelector, { timeout: 10000 });
      console.log("Login button found. Clicking...");
      await page.click(loginButtonSelector);
      console.log("Login button clicked successfully.");
      await page.waitForSelector("input[name=tbEmail]");
      await page.focus("input[name=tbEmail]");
      await page.keyboard.type(egressAccount);
      await page.click('[id="btnContinue"]');
      console.log("Email continue button clicked successfully.");
      await page.waitForNavigation({ waitUntil: "networkidle2" });
      await page.waitForSelector("input[name=tbPassword]", { timeout: 10000 });
      await page.focus("input[name=tbPassword]");
      await page.keyboard.type(egressPassword);
      console.log("Password typed.");
      await page.click('[id="btnLogin"]');
      await page.waitForNavigation();
      console.log("Login button clicked successfully.");
      const continueLinkSelector = 'a[title="Continue"]';
      try {
        // Check if the selector exists within the timeout
        await page.waitForSelector(continueLinkSelector, { timeout: 10000 });
        console.log("Continue link found. Clicking...");
        await page.click(continueLinkSelector);
        console.log(
          "Continue link clicked. Waiting for the next page to load..."
        );
        await page.waitForNavigation({ waitUntil: "networkidle2" });
      } catch (error) {
        if (error.name === "TimeoutError") {
          console.log("Continue link not found. Proceeding without clicking.");
        } else {
          throw error; // Rethrow if it's an unexpected error
        }
      }
      const pdfLinkSelector = "a.attachment-container-border";
      await page.waitForSelector(pdfLinkSelector, { timeout: 20000 });
      console.log("PDF link found. Clicking...");
      const linkHtml = await page.$eval(pdfLinkSelector, (el) => el.outerHTML);
      console.log("Found <a> tag:", linkHtml);
      await page.waitForSelector(pdfLinkSelector, {
        visible: true,
        timeout: 20000,
      });
      console.log("PDF link is visible. Clicking...");
      await page.click(pdfLinkSelector);
      console.log("PDF link clicked successfully.");
      console.log("Current URL:", page.url());
      await page.waitForSelector('a[href$=".pdf"]');
      const link = await page.$eval('a[href$=".pdf"]', (a) => a.href);
      logger.debug(`Actual Link : ` + link);

      await page.click('a[href$=".pdf"]');

      const fileName = await page.$eval(
        "span.attachment-filename",
        (span) => span.textContent
      );
      const destinationFileName = uuidv4() + "-" + fileName;
      console.log('filename:',fileName)
      console.log('destination filename:' , destinationFileName );

      for (i = 0; i < 15; i++) {
        await page.waitForTimeout(1000);
        if (await fileExists(path.join(downloadFolder, fileName))) {
          shell.mv(
            path.join(downloadFolder, fileName),
            path.join(destinationFolder, destinationFileName)
          );
          break;
        }
      }

      await browser.close();
      isBrowsing = false;
      if (await fileExists(path.join(destinationFolder, destinationFileName))) {
        shell.rm(path.join(downloadFolder, fileName));
        // Upload to S3
        const s3BucketName = config.S3BucketName;
        const s3Key = `uploads/${destinationFileName}`;
        await uploadToS3(
          path.join(destinationFolder, destinationFileName),
          s3BucketName,
          extractDataFromPDF
        );
        console.log("File uploaded to S3 successfully.");

        return path.join(destinationFolder, destinationFileName);
      } else {
        throw new Error(`download ${linkAdress} failed!`);
      }
    } catch (err) {
      logger.error(err);
      if (browser) await browser.close();
      isBrowsing = false;

      sendEgressAlarm();

      throw new Error(`download ${linkAdress} failed!`);
    }
}

async function uploadToS3(filePath, bucketName, extractDataFromPDF) {
  try {
    // Extract data from the PDF
    const { extRef, receivedOn } = await extractDataFromPDF(filePath);
    console.log("Extracted Data:", { extRef, receivedOn });

    if (!extRef || !receivedOn) {
      throw new Error("Failed to extract Ext Ref or Received On from PDF.");
    }

    // Remove dashes from extRef
    const sanitizedExtRef = extRef.replace(/-/g, "");

    // Parse the "Received on" date and time
    const [datePart, timePart] = receivedOn.split(" at ");
    const [day, month, year] = datePart.split("/").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);

    // Create a timestamp
    const timestamp = new Date(year, month - 1, day, hours, minutes).getTime();
    if (isNaN(timestamp)) {
      throw new Error(`Invalid Received On date: ${receivedOn}`);
    }

    // Format the filename using sanitizedExtRef and timestamp
    const keyName = `${sanitizedExtRef}-${timestamp}-${uuidv4()}.pdf`;

    // Read the file content
    const fileContent = fs.readFileSync(filePath);

    // Set S3 parameters
    const params = {
      Bucket: bucketName,
      Key: keyName,
      Body: fileContent,
      ACL: "private", // Ensure the file is private
    };

    // Upload to S3
    const uploadResponse = await s3.upload(params).promise();
    console.log(`File uploaded successfully to S3: ${uploadResponse.Location}`);
    return uploadResponse.Location;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const fileExists = async path => !!(await fs.promises.stat(path).catch(e => false));

function extractDataFromPDF(pdfPath) {
  return new Promise((resolve, reject) => {
    const results = {
      extRef: null,
      receivedOn: null,
    };

    let pageText = "";

    new PdfReader().parseFileItems(pdfPath, (err, item) => {
      if (err) {
        reject(err);
      } else if (!item) {
        // End of file
        const extRefMatch = pageText.match(/Ext Ref\s+([\d\-]+)/);
        const receivedOnMatch = pageText.match(
          /Received on\s+([\d/]+\s+at\s+\d{2}:\d{2})/
        );

        if (extRefMatch) {
          results.extRef = extRefMatch[1];
        }
        else{
          results.extRef = '000000000';
        }
        if (receivedOnMatch) {
          results.receivedOn = receivedOnMatch[1];
        }else{
          results.receivedOn = "12/31/2000 at 00:00";
        }

        resolve(results);
      } else if (item.text) {
        // Accumulate text from the page
        pageText += `${item.text} `;
      }
    });
  });
}