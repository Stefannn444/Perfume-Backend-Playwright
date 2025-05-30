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
exports.parseMM = parseMM;
const Product_1 = require("../models/Product");
function parseMM(query, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        const page = yield browser.newPage();
        const encodedQuery = encodeURIComponent(query);
        yield page.goto(`https://mmparfumuri.ro/index.php?route=product/search&sort=p.price&order=ASC&search=${encodedQuery}&description=true`, { waitUntil: 'networkidle' });
        yield page.screenshot({ path: 'mmparfumuri.png', fullPage: true });
        page.setDefaultTimeout(5000);
        const productElements = yield page.locator('.product-thumb');
        ///////filtering//////
        //count?
        const count = yield productElements.count();
        const limit = Math.min(count, 5);
        const matchingProducts = [];
        const queryWords = query.toLowerCase().split(' ');
        for (let i = 0; i < limit; i++) {
            const productElement = productElements.nth(i);
            try {
                const productName = yield productElement.locator('.name').textContent();
                console.log(productName);
                const matches = queryWords.every(word => productName.toLowerCase().includes(word.toLowerCase()));
                if (matches) {
                    matchingProducts.push(productElement);
                }
            }
            catch (err) {
                console.log(err);
            }
        }
        const finalProducts = [];
        for (let i = 0; i < matchingProducts.length; i++) {
            try {
                const productElement = matchingProducts[i];
                const productName = yield productElement.locator('.name').textContent();
                const productPrice = (0, Product_1.romanianToPrice)(yield productElement.locator('.price').textContent());
                const productImage = yield productElement.locator('.image img').first().getAttribute('src');
                const productUrl = yield productElement.locator('.image a').getAttribute('href');
                finalProducts.push(new Product_1.Product(productName, productPrice, productImage, productUrl));
            }
            catch (err) {
                console.log('ERROR PARSING PRODUT', err);
            }
        }
        console.log('Page loaded');
        console.log(finalProducts);
        yield page.close();
        return finalProducts;
    });
}
