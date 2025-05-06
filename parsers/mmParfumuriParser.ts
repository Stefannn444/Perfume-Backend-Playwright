import {BrowserContext} from 'playwright'
import {Product, romanianToPrice} from "../models/Product";

export async function parseMM(query:string,browser:BrowserContext) {


    const page = await browser.newPage();

    const encodedQuery = encodeURIComponent(query);
    await page.goto(`https://mmparfumuri.ro/index.php?route=product/search&sort=p.price&order=ASC&search=${encodedQuery}&description=true`, {waitUntil: 'networkidle'})
    await page.screenshot({path: 'mmparfumuri.png', fullPage: true})

    const productElements = await page.locator('.product-thumb')

    ///////filtering//////
    //count?
    const count=await productElements.count()
    const limit=Math.min(count,5)
    const matchingProducts=[]
    const queryWords=query.toLowerCase().split(' ');

    for(let i=0;i<limit;i++){
        const productElement=productElements.nth(i)
        try{
            const productName=await productElement.locator('.name').textContent()
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
            const productName=await productElement.locator('.name').textContent()
            const productPrice= romanianToPrice(await productElement.locator('.price').textContent() as string)
            const productImage = await productElement.locator('.image img').first().getAttribute('src')
            const productUrl = await productElement.locator('.image a').getAttribute('href')

            finalProducts.push(new Product(productName,productPrice,productImage,productUrl))
        }catch(err){
            console.log('ERROR PARSING PRODUT',err)
        }
    }


    console.log('Page loaded')

    console.log(finalProducts)
    await page.close()
    return finalProducts
}
