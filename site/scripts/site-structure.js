"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const marked_1 = __importDefault(require("marked"));
const util_1 = require("util");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importStar(require("path"));
const front_matter_1 = __importDefault(require("front-matter"));
const markdown_renderer_1 = require("./markdown-renderer");
const readFile = util_1.promisify(fs_1.default.readFile);
const writeFile = util_1.promisify(fs_1.default.writeFile);
const DESTINATION_FILE = './src/assets/docs-structure.json';
const SOURCE_FILE = './docs-md/README.md';
const ASSETS_DIR = '/assets/docs-content';
const renderer = new marked_1.default.Renderer();
(async function () {
    const metadataList = [];
    const markdownContents = await readFile(SOURCE_FILE, { encoding: 'utf8' });
    try {
        markdown_renderer_1.listFactory(renderer, metadataList);
        marked_1.default(markdownContents, {
            renderer,
        });
    }
    catch (e) {
        throw e;
    }
    await walkUpdateChildren(metadataList, SOURCE_FILE);
    await writeFile(DESTINATION_FILE, JSON.stringify(metadataList, null, 2), {
        encoding: 'utf8'
    });
})();
async function walkUpdateChildren(itemList, sourcePath) {
    for (const item of itemList) {
        if (item.filePath && item.filePath.indexOf('//') === -1) {
            const fullPath = path_1.default.join(path_1.default.dirname(sourcePath), item.filePath);
            const url = await getMarkdownFileSitePath(fullPath);
            const jsonPath = path_1.default.join(ASSETS_DIR, path_1.dirname(item.filePath), path_1.basename(item.filePath, '.md') + '.json');
            item.url = url;
            item.filePath = jsonPath;
        }
        if (item.children) {
            await walkUpdateChildren(item.children, sourcePath);
        }
    }
}
async function getMarkdownFileSitePath(filePath) {
    let markdownContents;
    try {
        markdownContents = await readFile(filePath, { encoding: 'utf8' });
    }
    catch (e) {
        return null;
    }
    if (!markdownContents) {
        return null;
    }
    const metadata = front_matter_1.default(markdownContents);
    return (metadata && metadata.attributes ? metadata.attributes.url : null);
}
