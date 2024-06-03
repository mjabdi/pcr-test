const puppeteer  = require ('puppeteer');
const fs = require('fs');
const shell = require('shelljs');
const config = require('config');
const logger = require('./utils/logger')();
const path = require('path');
const {sendEgressAlarm} = require('./utils/alarm');
const { v4: uuidv4 } = require("uuid");


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

    try
    {       
        browser = await puppeteer.launch({ headless : false});
        const page = await browser.newPage();

        await page.goto(linkAdress);
    
        await page.waitForSelector('input[name=tbEmail]');
        await page.focus('input[name=tbEmail]')
        await page.waitForTimeout(2000);
        await page.keyboard.type(egressAccount);

        await page.waitForTimeout(2000);

        await page.click('[id="btnContinue"]');
        await page.waitForNavigation();



        await page.waitForSelector('input[name=tbPassword]');
        await page.focus('input[name=tbPassword]')
        await page.waitForTimeout(2000);;
        await page.keyboard.type(egressPassword);

        await page.waitForTimeout(2000);;
    
        await page.click('[id="btnLogin"]');
        await page.waitForNavigation();
        
        await page.waitForSelector('[id="att-101"]');
    
        const link = await page.$eval('span[id="att-101"] > a', a => a.href);
    
        await page.goto(link);
    
        await page.waitForSelector('div[id="headerButtons"]');

        const link2 = await page.$eval('div[id="headerButtons"] > a', a => a.href);
        logger.debug(`Actual Link : ` + link2);


 
        await page.click('div[id="headerButtons"] > a');
        
        
        const uuid = uuidv4();
        console.log('uuid: ', uuid + '-' + '.......')
        const fileName =  'doc-' + uuid + '-' + await page.$eval('h4[id="panelHeadingText"] > span', span => span.textContent);;
        console.log("uuid - fileName: ", fileName);
        for (i=0 ; i < 15 ; i++)
        {
            await page.waitForTimeout(1000);
            console.log('loop: ', path.join(downloadFolder, fileName));
            console.log("loop: ", path.join(destinationFolder, fileName));
            if (await fileExists(path.join(downloadFolder , fileName)))
            {
                await page.waitForTimeout(1000);
                shell.mv(path.join(downloadFolder , fileName), path.join(destinationFolder , fileName));
                break;
            }
        }
        
        await browser.close();
        isBrowsing = false;

        if (await fileExists(path.join(destinationFolder , fileName)))
        {
            console.log("return: ", path.join(destinationFolder, fileName));
            return path.join(destinationFolder, fileName);
        }
        else
        {
            throw new Error(`download ${linkAdress} failed!`);
        }

    }catch (err)
    {
        logger.error(err);
        if (browser) await browser.close();
        isBrowsing = false;
    
        sendEgressAlarm();

        throw new Error(`download ${linkAdress} failed!`);
    }
}

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const fileExists = async path => !!(await fs.promises.stat(path).catch(e => false));