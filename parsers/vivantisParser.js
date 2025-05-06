"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseVivantis = parseVivantis;
const Product_1 = require("../models/Product");
//TODO: add cookies in the browsercontext
//TODO: add support for both ` and '
function parseVivantis(query, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        const page = yield browser.newPage();
        const encodedQuery = encodeURIComponent(query);
        yield page.goto(`https://www.vivantis.ro/fulltext/?q=${encodedQuery}`, { waitUntil: 'domcontentloaded' });
        yield page.waitForLoadState('networkidle');
        yield page.screenshot({ path: 'vivantis1.png', fullPage: true });
        yield page.mouse.wheel(0, 100);
        try {
            yield page.waitForTimeout(1000);
            yield page.locator('button.base-button.button.primary.medium.mt-1.mt-md-0.bg-success').click({ timeout: 2000 });
        }
        catch (e) {
            console.log(e);
        }
        yield page.screenshot({ path: 'vivantis2.png', fullPage: true });
        //await page.waitForLoadState('networkidle')
        //await page.waitForEvent('domcontentloaded');
        const productElements = yield page.locator('.product-card');
        console.log(yield productElements.count());
        const count = yield productElements.count();
        const limit = Math.min(count, 5);
        const matchingProducts = [];
        const queryWords = query.toLowerCase().split(' ');
        for (let i = 0; i < limit; i++) {
            const productElement = productElements.nth(i);
            try {
                const productName = (yield productElement.locator('.product-name').textContent()) + " " + (yield productElement.locator('.brand').textContent());
                console.log(productElement.textContent());
                const matches = queryWords.every(word => productName.toLowerCase().includes(word.toLowerCase()));
                if (matches) {
                    matchingProducts.push(productElement);
                }
            }
            catch (err) {
                console.log('VIVANTIS NAME MATCH ERROE', err);
            }
        }
        const finalProducts = [];
        for (let i = 0; i < matchingProducts.length; i++) {
            try {
                const productElement = matchingProducts[i];
                const productName = yield productElement.locator('.product-name').textContent();
                const productPrice = (0, Product_1.romanianToPrice)(yield productElement.locator('.price-actual').textContent());
                //first?
                const productImage = yield productElement.locator('.product-image img').first().getAttribute('src');
                const productUrl = 'https://www.vivantis.ro' + (yield productElement.locator('.text-link').first().getAttribute('href'));
                finalProducts.push(new Product_1.Product(productName, productPrice, productImage, productUrl));
            }
            catch (err) {
                console.log('Error parsing VIVANTIS product', err);
            }
        }
        console.log(finalProducts);
        yield page.close();
        return finalProducts;
    });
}
