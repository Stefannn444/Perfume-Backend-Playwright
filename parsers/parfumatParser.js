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
exports.parseParfumat = parseParfumat;
const Product_1 = require("../models/Product");
function parseParfumat(query, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        const page = yield browser.newPage();
        const encodedQuery = encodeURIComponent(query);
        yield page.goto(`https://parfumat.ro/#0641/fullscreen/m=and&q=${encodedQuery}`);
        page.setDefaultTimeout(5000);
        try {
            yield page.locator('button.cookiesplus-btn.cookiesplus-accept').first().click({ timeout: 2000 });
        }
        catch (e) {
            console.log(e);
        }
        const productElements = yield page.locator('div.dfd-card.dfd-card-preset-product.dfd-card-type-product');
        const count = yield productElements.count();
        const limit = Math.min(count, 5);
        const finalProducts = [];
        for (let i = 0; i < limit; i++) {
            try {
                const productElement = productElements.nth(i);
                const productName = yield productElement.locator('.dfd-card-title').textContent();
                const productPrice = (0, Product_1.romanianToPrice)(yield productElement.locator('div.dfd-card-pricing span').first().textContent());
                const productImage = yield productElement.locator('.dfd-card-thumbnail img').first().getAttribute('src');
                const productUrl = yield productElement.getAttribute('dfd-value-link');
                finalProducts.push(new Product_1.Product(productName, productPrice, productImage, productUrl));
            }
            catch (err) {
                console.log('Error parsing PARFUMAT product', err);
            }
        }
        yield page.close();
        return finalProducts;
    });
}
