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
exports.parseBrasty = parseBrasty;
const Product_1 = require("../models/Product");
//TODO: format producturl?
function parseBrasty(query, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        const page = yield browser.newPage();
        const encodedQuery = encodeURIComponent(query);
        yield page.goto(`https://www.brasty.ro/produsele?q=${encodedQuery}`, { waitUntil: 'networkidle' });
        page.setDefaultTimeout(5000);
        const productElements = yield page.locator('.c-productbox.js-paging-item');
        const count = yield productElements.count();
        const limit = Math.min(count, 5);
        const matchingProducts = [];
        const queryWords = query.toLowerCase().split(' ');
        for (let i = 0; i < limit; i++) {
            const productElement = productElements.nth(i);
            try {
                const productName = yield productElement.locator('.c-productbox__title').textContent();
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
                const productName = yield productElement.locator('.c-productbox__title').textContent();
                const productPrice = (0, Product_1.romanianToPrice)(yield productElement.locator('.c-productbox__price').textContent());
                const productImage = yield productElement.locator('.c-productbox__picture img').first().getAttribute('src');
                const productUrl = 'https://www.brasty.ro' + (yield productElement.locator('.c-productbox__title a').getAttribute('href'));
                finalProducts.push(new Product_1.Product(productName, productPrice, productImage, productUrl));
            }
            catch (err) {
                console.log('Error parsing BRASTY product', err);
            }
        }
        console.log(finalProducts);
        yield page.close();
        return finalProducts;
    });
}
