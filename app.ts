import express,{ Request, Response } from 'express';
import {Browser} from 'playwright';
import { chromium } from 'playwright-extra';
import {parseBrasty} from "./parsers/brastyParser";
import { parseMM } from './parsers/mmParfumuriParser';
import {parseParfumat} from "./parsers/parfumatParser";
import { parseVivantis } from './parsers/vivantisParser';
import stealth from 'puppeteer-extra-plugin-stealth';
import {Product} from "./models/Product";
import {parseNotino} from "./parsers/notinoParser";

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
        const [resultsBrasty,resultsMM, resultsNotino, resultsParfumat, resultsVivantis] = await Promise.all([
            (async()=>{
                const contextBrasty=await browser.newContext();
                try{
                    return await parseBrasty(query,contextBrasty);
                }finally{
                    await contextBrasty.close()
                }
            })(),
            (async () => {
                const contextMM = await browser.newContext();
                try {
                    return await parseMM(query, contextMM);
                } finally {
                    await contextMM.close();
                }
            })(),
            (async()=>{
                const contextNotino=await browser.newContext();
                await new Promise(resolve => setTimeout(resolve, 1000));

                try{
                    return await parseNotino(query,contextNotino);
                }finally{
                    await contextNotino.close();
                }
            })(),
            (async()=>{
                const contextParfumat = await browser.newContext();
                try{
                    return await parseParfumat(query,contextParfumat);
                }finally{
                    await contextParfumat.close();
                }
            })(),
            (async () => {
                const contextVivantis = await browser.newContext();
                await new Promise(resolve => setTimeout(resolve, 1500));

                try {
                    return await parseVivantis(query, contextVivantis);
                } finally {
                    await contextVivantis.close();
                }
            })(),
        ]);
        const results = [...resultsBrasty,...resultsMM, ...resultsNotino, ...resultsParfumat, ...resultsVivantis];

        //TODO: IF i have to wait for networkidle, replace with expect, as tried in the other branch
        //TODO: check whether id-based searches are required for dynamically created class names
        //TODO: fix error 500 problems that arise due to the server's network's deficiencies
        //TODO: test null results
        //TODO: full ts
        //TODO: remove toLowercase redundancies
        //todo: IF LIMIT <1
        //TODO: erase screenshots
        //TODO: more query separators ' `?
        //TODO: variable name consistency, err - e
        //TODO: consistency in brand+productName retrieval
        //TODO: tinker with the general page timeout: change it to browsercontext or above?
        //TODO: quicker timeout for all awaits

        res.json(results.sort((a:Product,b:Product)=>{
            const priceA = a.price === null ? Infinity : a.price;
            const priceB = b.price === null ? Infinity : b.price;
            return priceA - priceB;
        }));
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
