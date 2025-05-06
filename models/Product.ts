export class Product{
    name:string|null;
    price:number|null;
    image:string|null;
    url:string|null;

    constructor(name:string|null,price:number|null,image:string|null,url:string|null){
        this.name = name;
        this.price = price;
        this.image = image;
        this.url = url;
    }
}
//TODO: string extension function?
export function romanianToPrice(price:string):number|null{
    const filteredString=price.replace(/[^\d,.]/g,'');
    const noSeparatorString=filteredString.replace(/\./g , '');
    const normalizedString=noSeparatorString.replace(',','.');
    const productPrice = parseFloat(normalizedString);
    if( productPrice){
        return productPrice;
    }
    return null;
}

