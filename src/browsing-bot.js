const puppeteer  = require ('puppeteer');
const fs = require('fs');
const shell = require('shelljs');
const config = require('config');
const logger = require('./utils/logger')();
const path = require('path');
const stream = require('stream');
const fetch = require('node-fetch');
const Blob = require('fetch-blob');
const util = require('util');
const streamPipeline = util.promisify(require('stream').pipeline);


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
        browser = await puppeteer.launch({ headless : false, args:['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36');
        
        await page.goto(linkAdress);
    
        await page.waitFor('input[name=tbEmail]');
        await page.focus('input[name=tbEmail]')
        await page.keyboard.type(egressAccount);

        await page.waitFor('input[name=tbPassword]');
        await page.focus('input[name=tbPassword]')
        await page.keyboard.type(egressPassword);
    
        await page.click('[id="btnLogin"]');
        await page.waitForNavigation();
        
        await page.waitFor('[id="att-101"]');
    
        const link = await page.$eval('span[id="att-101"] > a', a => a.href);
    
        await page.goto(link);
    
        await page.waitFor('div[id="headerButtons"]');

        const link2 = await page.$eval('div[id="headerButtons"] > a', a => a.href);
        logger.debug(`Actual Link : ` + link2);

        // const res = await page.evaluate( async () =>
        //     {
        //         return fetch('https://secureemail.thelondonclinic.com/d/ec1c0c47e3a173d250df8617b57ca6ff/101/MEX-MCNULTY_65157805651.pdf', {
        //             method: 'GET',
        //             credentials: 'include'
        //         }).then(async (res) => {
        //             return await res.blob();
        //         }
        //         );
        //     });

          
 
        
         
        

           // streamPipeline(res, fs.createWriteStream('d:/octocat.pdf'));
        //    const binary = Buffer.from(res, 'utf8').toString('base64');
        //     logger.debug(res);
            //fs.createWriteStream('d:/pppp.pdf').write(data);  

        // const newBlob = new Blob([res.blob], { type: 'application/pdf' });    
        // logger.debug(res);   

 
        await page.click('div[id="headerButtons"] > a');
    
        const fileName = await page.$eval('h4[id="panelHeadingText"] > span', span => span.textContent);;
        
        for (i=0 ; i < 15 ; i++)
        {
            await page.waitForTimeout(1000);
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
        throw new Error(`download ${linkAdress} failed!`);
    }
}

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const fileExists = async path => !!(await fs.promises.stat(path).catch(e => false));