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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const playwright_extra_1 = require("playwright-extra");
const mmParfumuriParser_1 = require("./parsers/mmParfumuriParser");
const parfumatParser_1 = require("./parsers/parfumatParser");
const vivantisParser_1 = require("./parsers/vivantisParser");
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
playwright_extra_1.chromium.use((0, puppeteer_extra_plugin_stealth_1.default)());
const app = (0, express_1.default)();
const port = 3000;
let browserPromise = playwright_extra_1.chromium.launch({ headless: true });
function getBrowser() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield browserPromise;
    });
}
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.get('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query.q;
    if (!query) {
        res.status(404).json({ error: 'Missing query parameterr' });
        return;
    }
    try {
        const browser = yield browserPromise;
        const [resultsMM, resultsParfumat, resultsVivantis] = yield Promise.all([
            (() => __awaiter(void 0, void 0, void 0, function* () {
                const contextMM = yield browser.newContext();
                try {
                    return yield (0, mmParfumuriParser_1.parseMM)(query, contextMM);
                }
                finally {
                    yield contextMM.close();
                }
            }))(),
            (() => __awaiter(void 0, void 0, void 0, function* () {
                const contextParfumat = yield browser.newContext();
                try {
                    return yield (0, parfumatParser_1.parseParfumat)(query, contextParfumat);
                }
                finally {
                    yield contextParfumat.close();
                }
            }))(),
            (() => __awaiter(void 0, void 0, void 0, function* () {
                const contextVivantis = yield browser.newContext();
                yield new Promise(resolve => setTimeout(resolve, 1500));
                try {
                    return yield (0, vivantisParser_1.parseVivantis)(query, contextVivantis);
                }
                finally {
                    yield contextVivantis.close();
                }
            }))(),
        ]);
        const results = [...resultsMM, ...resultsParfumat, ...resultsVivantis];
        /*const resultsParfumat= await Promise.all([
            (async()=>{
                const contextParfumat=await browser.newContext();
                try{
                    return await parseParfumat(query,contextParfumat);
                }finally{
                    await contextParfumat.close()
                }
            })(),
        ])
        const results=[...resultsParfumat]*/
        res.json(results);
    }
    catch (err) {
        console.error("Error in parse:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
app.listen(port, () => {
    console.log('Example app listening on port', port);
});
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Shutting down...');
    const browser = yield browserPromise;
    yield browser.close();
    process.exit();
}));
