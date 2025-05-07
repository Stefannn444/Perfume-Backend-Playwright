import {BrowserContext} from "playwright";
import {Product, romanianToPrice} from "../models/Product";

export async function parseNotino(query:string, browser:BrowserContext){
    const page=await browser.newPage();

    const encodedQuery=encodeURIComponent(query);
    await page.goto(`https://www.notino.ro/search.asp?exps=${encodedQuery}`,{waitUntil:'domcontentloaded'});
    await page.screenshot({path: 'notino1.png', fullPage: true})

    page.setDefaultTimeout(5000);

    const productElements=await page.locator('.pt828i9')

    const count = await productElements.count()
    const limit = Math.min(count,5)
    const matchingProducts=[]
    const queryWords=query.toLowerCase().split(' ');

    for(let i=0;i<limit;i++){
        const productElement=productElements.nth(i)
        try{
            //h3
            const productName=await productElement.locator('.bpgbkyw.h1x64681').textContent()+' '+await productElement.locator('.nbsht7r.h1a7qwyw').textContent();
            console.log(productName);
            const matches=queryWords.every(word=>
            productName.toLowerCase().includes(word.toLowerCase())
            );
            if(matches){
                matchingProducts.push(productElement);
            }
        }catch(err){
            console.log(err);
        }
    }

    const finalProducts=[]

    for(let i=0;i<matchingProducts.length;i++) {
        try {
            const productElement = matchingProducts[i];
            const productName = await productElement.locator('.bpgbkyw.h1x64681').textContent() + ' ' + await productElement.locator('.nbsht7r.h1a7qwyw').textContent();
            const productPrice = romanianToPrice(await productElement.locator(' .p1nqvj2i.p1j6ozm1, .dq4qjrv').last().textContent() as string);
            const productImage = await productElement.locator('.n1jyi5ok').getAttribute('src');
            const productUrl = 'https://www.notino.ro'+await productElement.getAttribute('href');

            finalProducts.push(new Product(productName, productPrice, productImage, productUrl));
            //TODO: maybe replace with finally?
        } catch (err) {
            console.log('Error parsing NOTINO product', err)
        }
    }

    console.log(finalProducts);
    await page.close();
    return finalProducts;

}