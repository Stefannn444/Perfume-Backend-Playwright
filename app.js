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
const brastyParser_1 = require("./parsers/brastyParser");
const mmParfumuriParser_1 = require("./parsers/mmParfumuriParser");
const parfumatParser_1 = require("./parsers/parfumatParser");
const vivantisParser_1 = require("./parsers/vivantisParser");
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const notinoParser_1 = require("./parsers/notinoParser");
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
        const [resultsBrasty, resultsMM, resultsNotino, resultsParfumat, resultsVivantis] = yield Promise.all([
            (() => __awaiter(void 0, void 0, void 0, function* () {
                const contextBrasty = yield browser.newContext();
                try {
                    return yield (0, brastyParser_1.parseBrasty)(query, contextBrasty);
                }
                finally {
                    yield contextBrasty.close();
                }
            }))(),
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
                const contextNotino = yield browser.newContext();
                yield new Promise(resolve => setTimeout(resolve, 1000));
                try {
                    return yield (0, notinoParser_1.parseNotino)(query, contextNotino);
                }
                finally {
                    yield contextNotino.close();
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
        const results = [...resultsBrasty, ...resultsMM, ...resultsNotino, ...resultsParfumat, ...resultsVivantis];
        //TODO: IF i have to wait for networkidle, replace with expect, as tried in the other branch
        //TODO: check whether id-based searches are required for dynamically created class names
        //TODO: fix error 500 problems that arise due to the server's network's deficiencies
        //TODO: test null results
        //TODO: full ts
        //TODO: remove toLowercase redundancies
        //todo: IF LIMIT <1
        //TODO: erase screenshots
        //TODO: more query separators ' `?
        //TODO: variable name consistency, err - e
        //TODO: consistency in brand+productName retrieval
        //TODO: tinker with the general page timeout: change it to browsercontext or above?
        //TODO: quicker timeout for all awaits
        res.json(results.sort((a, b) => {
            const priceA = a.price === null ? Infinity : a.price;
            const priceB = b.price === null ? Infinity : b.price;
            return priceA - priceB;
        }));
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
