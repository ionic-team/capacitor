"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismjs_1 = __importDefault(require("prismjs"));
const path_1 = __importDefault(require("path"));
const components_1 = __importDefault(require("prismjs/components/"));
const languages = ['tsx', 'bash', 'typescript', 'markup', 'css', 'json', 'diff'];
components_1.default(languages);
function findItem(siteStructureList, filePath) {
    for (const item of siteStructureList) {
        if (item.filePath === filePath) {
            return item;
        }
        else if (item.children && item.children.length > 0) {
            const foundItem = findItem(item.children, filePath);
            if (foundItem != null) {
                return foundItem;
            }
        }
    }
}
exports.findItem = findItem;
function listFactory(renderer, metadataList) {
    let lastItem = null;
    let activeList = [];
    const prevList = renderer.list;
    const prevListitem = renderer.listitem;
    const prevLink = renderer.link;
    renderer.list = function (body, ordered) {
        lastItem = {
            type: 'list'
        };
        return prevList.call(this, body, ordered);
    };
    renderer.listitem = function (text) {
        if (lastItem.type === 'list') {
            const [itemText] = text.split('<ul');
            lastItem = {
                type: 'listitem',
                text: itemText,
                children: activeList
            };
            metadataList.push({
                text: itemText,
                children: activeList
            });
            activeList = [];
        }
        else if (lastItem.type === 'link') {
            lastItem = {
                type: 'listitem',
                text: lastItem.text,
                filePath: lastItem.filePath
            };
            activeList.push({
                text: lastItem.text,
                filePath: lastItem.filePath
            });
        }
        else {
            lastItem = {
                type: 'listitem',
                text: text
            };
            activeList.push({
                text
            });
        }
        return prevListitem.call(this, text);
    };
    renderer.link = function (href, title, text) {
        lastItem = {
            type: 'link',
            text,
            filePath: href
        };
        return prevLink.call(this, href, title, text);
    };
}
exports.listFactory = listFactory;
function localizeMarkdownLink(renderer, filePath, metadataList) {
    const prevLink = renderer.link;
    renderer.link = function (href, title, text) {
        if (!(href.startsWith('/') || href.startsWith('#') || href.startsWith('http'))) {
            let [pathname, fragment] = href.split('#');
            fragment = fragment ? `#${fragment}` : '';
            const newPath = path_1.default.resolve(path_1.default.dirname(filePath), pathname) + '.json';
            const item = findItem(metadataList, newPath);
            if (item && item.url != null) {
                return `<stencil-route-link ${title ? `anchorTitle=${title}` : ''} url=${item.url}${fragment}>${text}</stencil-route-link>`;
            }
        }
        return prevLink.call(this, href, title, text);
    };
}
exports.localizeMarkdownLink = localizeMarkdownLink;
function collectHeadingMetadata(renderer, metadata) {
    renderer.heading = function (text, level, raw) {
        const id = raw.toLowerCase().replace(/[^\w]+/g, '-');
        metadata.headings.push({
            id,
            level,
            text
        });
        return `
<h${level} id="${id}">
  ${(level !== 1) ? `<a class="heading-link" href="#${id}"><ion-icon name="ios-link"></ion-icon>` : ''}
  ${text}
  ${(level !== 1) ? `</a>` : ''}
</h${level}>
`;
    };
}
exports.collectHeadingMetadata = collectHeadingMetadata;
function changeCodeCreation(renderer) {
    function highlight(code, lang) {
        code = code.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        if (lang != null && languages.indexOf(lang) !== -1) {
            return prismjs_1.default.highlight(code, prismjs_1.default.languages[lang]);
        }
        return code;
    }
    renderer.code = function (code, lang, escaped) {
        const hcl = [];
        code = code
            .split('\n')
            .map((line, index) => {
            if (line.charAt(0) === '|') {
                hcl.push(index + 1);
                return line.substring(1);
            }
            return line;
        })
            .join('\n');
        const out = highlight(code, lang);
        if (out != null) {
            escaped = true;
            code = out;
        }
        if (!lang) {
            return `<pre><code>${(escaped ? code : escape(code))}</code></pre>`;
        }
        return `
  <highlight-code-line ${hcl.length > 0 ? `lines="${hcl.join()}"` : ``}>
    <pre class="language-${escape(lang)}"><code class="language-${escape(lang)}">${(escaped ? code : escape(code))}</code></pre>
  </highlight-code-line>
  `;
    };
}
exports.changeCodeCreation = changeCodeCreation;
