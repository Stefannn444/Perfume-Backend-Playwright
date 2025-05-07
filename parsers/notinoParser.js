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
exports.parseNotino = parseNotino;
const Product_1 = require("../models/Product");
function parseNotino(query, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        const page = yield browser.newPage();
        const encodedQuery = encodeURIComponent(query);
        yield page.goto(`https://www.notino.ro/search.asp?exps=${encodedQuery}`, { waitUntil: 'domcontentloaded' });
        yield page.screenshot({ path: 'notino1.png', fullPage: true });
        page.setDefaultTimeout(5000);
        const productElements = yield page.locator('.pt828i9');
        const count = yield productElements.count();
        const limit = Math.min(count, 5);
        const matchingProducts = [];
        const queryWords = query.toLowerCase().split(' ');
        for (let i = 0; i < limit; i++) {
            const productElement = productElements.nth(i);
            try {
                //h3
                const productName = (yield productElement.locator('.bpgbkyw.h1x64681').textContent()) + ' ' + (yield productElement.locator('.nbsht7r.h1a7qwyw').textContent());
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
                const productName = (yield productElement.locator('.bpgbkyw.h1x64681').textContent()) + ' ' + (yield productElement.locator('.nbsht7r.h1a7qwyw').textContent());
                const productPrice = (0, Product_1.romanianToPrice)(yield productElement.locator(' .p1nqvj2i.p1j6ozm1, .dq4qjrv').last().textContent());
                const productImage = yield productElement.locator('.n1jyi5ok').getAttribute('src');
                const productUrl = 'https://www.notino.ro' + (yield productElement.getAttribute('href'));
                finalProducts.push(new Product_1.Product(productName, productPrice, productImage, productUrl));
                //TODO: maybe replace with finally?
            }
            catch (err) {
                console.log('Error parsing NOTINO product', err);
            }
        }
        console.log(finalProducts);
        yield page.close();
        return finalProducts;
    });
}
