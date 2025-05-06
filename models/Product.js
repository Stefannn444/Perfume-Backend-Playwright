"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
exports.romanianToPrice = romanianToPrice;
class Product {
    constructor(name, price, image, url) {
        this.name = name;
        this.price = price;
        this.image = image;
        this.url = url;
    }
}
exports.Product = Product;
//TODO: string extension function?
function romanianToPrice(price) {
    const filteredString = price.replace(/[^\d,.]/g, '');
    const noSeparatorString = filteredString.replace(/\./g, '');
    const normalizedString = noSeparatorString.replace(',', '.');
    const productPrice = parseFloat(normalizedString);
    if (productPrice) {
        return productPrice;
    }
    return null;
}
