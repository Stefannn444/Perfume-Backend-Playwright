import {BrowserContext} from 'playwright';
import {romanianToPrice,Product} from "../models/Product";

export async function parseParfumat(query:string,browser:BrowserContext) {

    const page=await browser.newPage();

    const encodedQuery=encodeURIComponent(query);
    await page.goto(`https://parfumat.ro/#0641/fullscreen/m=and&q=${encodedQuery}`)

    page.setDefaultTimeout(5000)

    try{
        await page.locator('button.cookiesplus-btn.cookiesplus-accept').first().click({timeout:2000})
    }catch(e){
        console.log(e)
    }

    const productElements=await page.locator('div.dfd-card.dfd-card-preset-product.dfd-card-type-product')

    const count = await productElements.count()
    const limit=Math.min(count,5);
    const matchingProducts=[];
    const queryWords=query.toLowerCase().split(' ');

    for(let i=0;i<limit;i++){
        const productElement=productElements.nth(i);
        try{
            const productName=await productElement.locator('.dfd-card-title').textContent()
            const matches=queryWords.every(word=>
                productName?.toLowerCase().includes(word.toLowerCase())
            );
            if(matches){
                matchingProducts.push(productElement);
            }
        }catch(err){
            console.log(err);
        }
    }

    const finalProducts=[]

    for(let i=0;i<matchingProducts.length;i++){
        try{
            const productElement=matchingProducts[i];
            const productName=await productElement.locator('.dfd-card-title').textContent()
            const productPrice= romanianToPrice(await productElement.locator('div.dfd-card-pricing span').first().textContent() as string);
            const productImage = await productElement.locator('.dfd-card-thumbnail img').first().getAttribute('src')
            const productUrl = await productElement.getAttribute('dfd-value-link')

            finalProducts.push(new Product(productName,productPrice,productImage,productUrl));
        }catch(err){
            console.log('Error parsing PARFUMAT product',err)
        }
    }

    await page.close()
    return finalProducts
}