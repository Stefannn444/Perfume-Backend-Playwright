import {BrowserContext} from "playwright";
import {Product, romanianToPrice} from "../models/Product";

//TODO: format producturl?

export async function parseBrasty(query:string,browser:BrowserContext){
    const page = await browser.newPage();

    const encodedQuery = encodeURIComponent(query);
    await page.goto(`https://www.brasty.ro/produsele?q=${encodedQuery}`, {waitUntil: 'networkidle'})
    page.setDefaultTimeout(5000)

    const productElements = await page.locator('.c-productbox.js-paging-item')

    const count=await productElements.count()
    const limit=Math.min(count,5)
    const matchingProducts=[]
    const queryWords=query.toLowerCase().split(' ');

    for(let i=0;i<limit;i++){
        const productElement=productElements.nth(i)
        try{
            const productName=await productElement.locator('.c-productbox__title').textContent()
            console.log(productName)
            const matches= queryWords.every(word=>
                productName!.toLowerCase().includes(word.toLowerCase())
            )
            if(matches){
                matchingProducts.push(productElement);
            }
        }catch(err){
            console.log(err)
        }
    }

    const finalProducts=[]

    for(let i=0; i<matchingProducts.length; i++){
        try{
            const productElement=matchingProducts[i]
            const productName=await productElement.locator('.c-productbox__title').textContent()
            const productPrice= romanianToPrice(await productElement.locator('.c-productbox__price').textContent() as string)
            const productImage = await productElement.locator('.c-productbox__picture img').first().getAttribute('src')
            const productUrl = 'https://www.brasty.ro'+await productElement.locator('.c-productbox__title a').getAttribute('href')

            finalProducts.push(new Product(productName,productPrice,productImage,productUrl))
        }catch(err){
            console.log('Error parsing BRASTY product',err)
        }
    }

    console.log(finalProducts)
    await page.close()
    return finalProducts

}