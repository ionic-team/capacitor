"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const marked_1 = __importDefault(require("marked"));
const glob_1 = __importDefault(require("glob"));
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const url_1 = __importDefault(require("url"));
const utils_1 = require("@stencil/utils");
const markdown_renderer_1 = require("./markdown-renderer");
const front_matter_1 = __importDefault(require("front-matter"));
const node_fetch_1 = __importDefault(require("node-fetch"));
require('dotenv').config();
const readFile = util_1.promisify(fs_1.default.readFile);
const writeFile = util_1.promisify(fs_1.default.writeFile);
const globAsync = util_1.promisify(glob_1.default);
const DESTINATION_DIR = './src/assets/docs-content';
const SOURCE_DIR = './docs-md';
const SITE_STRUCTURE_FILE = './src/assets/docs-structure.json';
(async function () {
    const siteStructure = await readFile(SITE_STRUCTURE_FILE, { encoding: 'utf8' });
    const siteStructureJson = JSON.parse(siteStructure);
    console.log(`running glob: ${SOURCE_DIR}/**/*.md`);
    const files = await globAsync(`${SOURCE_DIR}/**/*.md`, {});
    await utils_1.rimraf(DESTINATION_DIR);
    const filePromises = files.map(async (filePath) => {
        if (filePath === './docs-md/README.md') {
            return Promise.resolve();
        }
        let markdownMetadata = {};
        const jsonFileName = path_1.default.relative(SOURCE_DIR, filePath);
        const destinationFileName = path_1.default.join(DESTINATION_DIR, path_1.default.dirname(jsonFileName), path_1.default.basename(jsonFileName, '.md') + '.json');
        markdownMetadata.headings = [];
        const markdownContents = await readFile(filePath, { encoding: 'utf8' });
        try {
            let parsedMarkdown = front_matter_1.default(markdownContents);
            parsedMarkdown = await getGithubData(filePath, parsedMarkdown);
            const renderer = new marked_1.default.Renderer();
            markdown_renderer_1.collectHeadingMetadata(renderer, markdownMetadata);
            markdown_renderer_1.changeCodeCreation(renderer);
            markdown_renderer_1.localizeMarkdownLink(renderer, destinationFileName.replace('src', ''), siteStructureJson);
            let htmlContents = marked_1.default(parsedMarkdown.body, {
                renderer,
                headerIds: true
            });
            await utils_1.mkdirp(path_1.default.join(DESTINATION_DIR, path_1.default.dirname(jsonFileName)));
            await writeFile(destinationFileName, JSON.stringify(Object.assign(Object.assign(Object.assign({}, parsedMarkdown.attributes), markdownMetadata), { srcPath: filePath, content: htmlContents })), {
                encoding: 'utf8'
            });
        }
        catch (e) {
            console.error(filePath);
            throw e;
        }
    });
    await Promise.all(filePromises);
    console.log(`successfully converted ${filePromises.length} files`);
})();
async function getGithubData(filePath, parsedMarkdown) {
    const since = new Date('2018-06-01').toISOString();
    try {
        const request = await node_fetch_1.default(url_1.default.format({
            protocol: 'https',
            hostname: 'api.github.com',
            pathname: 'repos/ionic-team/stencil-site/commits',
            query: {
                access_token: process.env.GITHUB_TOKEN,
                since: since,
                path: filePath
            }
        }));
        if (request.status === 403) {
            console.warn(`Ignoring commit history for ${filePath} due to GH API limit. To resolve, add the GITHUB_TOKEN envar.`);
            return parsedMarkdown;
        }
        const commits = await request.json();
        const contributors = Array.from(new Set(commits.map(commit => commit.author.login)));
        const lastUpdated = commits.length ? commits[0].commit.author.date : since;
        const attributes = parsedMarkdown.attributes = parsedMarkdown.attributes || {};
        attributes.lastUpdated = lastUpdated;
        attributes.contributors = attributes.contributors || [];
        contributors.forEach(contributor => {
            if (!attributes.contributors.includes(contributor)) {
                attributes.contributors.push(contributor);
            }
        });
        console.log('filePath:', filePath, 'contributors:', attributes.contributors.length, 'lastUpdated:', lastUpdated);
    }
    catch (e) {
        console.log(e);
    }
    return parsedMarkdown;
}
