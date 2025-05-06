import express,{ Request, Response } from 'express';
import {Browser} from 'playwright';
import { chromium } from 'playwright-extra';
import { parseVivantis } from './parsers/vivantisParser';
import { parseMM } from './parsers/mmParfumuriParser';
import stealth from 'puppeteer-extra-plugin-stealth';

chromium.use(stealth())

const app=express()
const port = 3000

let browserPromise=chromium.launch({headless:true})

async function getBrowser(){
    return await browserPromise
}

app.get('/',(req:Request,res:Response)=>{
    res.send('Hello World!')
})

app.get('/search',async(req:Request,res:Response):Promise<void>=>{
    const query=req.query.q as string;
    if(!query){
        res.status(404).json({error:'Missing query parameterr'})
        return;
    }
    try{
        const browser=await browserPromise
        const [resultsMM, resultsVivantis] = await Promise.all([
            (async () => {
                const contextMM = await browser.newContext();
                try {
                    return await parseMM(query, contextMM);
                } finally {
                    await contextMM.close();
                }
            })(),
            (async () => {
                const contextVivantis = await browser.newContext();
                try {
                    return await parseVivantis(query, contextVivantis);
                } finally {
                    await contextVivantis.close();
                }
            })(),
        ]);
        const results = [...resultsMM, ...resultsVivantis];
        res.json(results);
    }catch(err){
        console.error("Error in parse:",err)
        res.status(500).json({error:'Internal server error'})
    }
})

app.listen(port,()=>{
    console.log('Example app listening on port', port)
})

process.on('SIGINT', async () => {
    console.log('Shutting down...')
    const browser = await browserPromise
    await browser.close()
    process.exit()
})
