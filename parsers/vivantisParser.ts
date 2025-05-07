import {BrowserContext} from "playwright";
import {Product, romanianToPrice} from "../models/Product";
//TODO: add cookies in the browsercontext
//TODO: add support for both ` and '
export async function parseVivantis(query:string,browser:BrowserContext){
    const page= await browser.newPage()

    const encodedQuery=encodeURIComponent(query)
    await page.goto(`https://www.vivantis.ro/fulltext/?q=${encodedQuery}`,{waitUntil:'domcontentloaded'})
    //await page.waitForLoadState('networkidle')

    page.setDefaultTimeout(5000)


    //await page.screenshot({path:'vivantis1.png',fullPage:true})
    await page.mouse.wheel(0,100)

    try{
        await page.waitForTimeout(1000)
        await page.locator('button.base-button.button.primary.medium.mt-1.mt-md-0.bg-success').click({timeout:2000})
    }catch(e){
        console.log(e)
    }

    //await page.screenshot({path:'vivantis2.png',fullPage:true})
    //await page.waitForLoadState('networkidle')
    //await page.waitForEvent('domcontentloaded');

    const productElements = await page.locator('.product-card')
    console.log( await productElements.count())

    const count=await productElements.count()
    const limit=Math.min(count,5)
    const matchingProducts=[]
    const queryWords=query.toLowerCase().split(' ');

    for(let i=0;i<limit;i++){
        const productElement=productElements.nth(i)
        try {
            const productName = await productElement.locator('.product-name').textContent() + " " + await productElement.locator('.brand').textContent()
            console.log(productElement.textContent())
            const matches = queryWords.every(word =>
                productName.toLowerCase().includes(word.toLowerCase())
            )
            if(matches){
                matchingProducts.push(productElement)
            }
        }catch(err){
            console.log('VIVANTIS NAME MATCH ERROE',err)
        }
    }

    const finalProducts=[]

    for(let i=0;i<matchingProducts.length;i++){
        try{
            const productElement=matchingProducts[i]
            const productName=await productElement.locator('.product-name').textContent()
            const productPrice= romanianToPrice( await productElement.locator('.price-actual').textContent() as string);
            //first?
            const productImage = await productElement.locator('.product-image img').first().getAttribute('src')
            const productUrl = 'https://www.vivantis.ro'+await productElement.locator('.text-link').first().getAttribute('href')
            finalProducts.push(new Product(productName,productPrice,productImage,productUrl))
        }catch(err){
            console.log('Error parsing VIVANTIS product',err)
        }
    }

    console.log(finalProducts)
    await page.close()
    return finalProducts
}

