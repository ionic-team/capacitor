/*! Built with http://stenciljs.com */

App.loadComponents(

/**** module id (dev mode) ****/
"stencil-async-content",

/**** component modules ****/
function importComponent(exports, h, Context, publicPath) {
"use strict";
// @stencil/core

var AsyncContent = /** @class */ (function () {
    function AsyncContent() {
    }
    AsyncContent.prototype["componentWillLoad"] = function () {
        return this.fetchNewContent();
    };
    AsyncContent.prototype.fetchNewContent = function () {
        var _this = this;
        return fetch(this.documentLocation)
            .then(function (response) { return response.text(); })
            .then(function (data) {
            _this.content = data;
        });
    };
    AsyncContent.prototype.render = function () {
        return (h("div", { innerHTML: this.content }));
    };
    return AsyncContent;
}());

var isarray = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

/**
 * Expose `pathToRegexp`.
 */
var pathToRegexp_1 = pathToRegexp;
var parse_1 = parse;
var compile_1 = compile;
var tokensToFunction_1 = tokensToFunction;
var tokensToRegExp_1 = tokensToRegExp;

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g');

/**
 * Parse a string for the raw tokens.
 *
 * @param  {string}  str
 * @param  {Object=} options
 * @return {!Array}
 */
function parse (str, options) {
  var tokens = [];
  var key = 0;
  var index = 0;
  var path = '';
  var defaultDelimiter = options && options.delimiter || '/';
  var res;

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0];
    var escaped = res[1];
    var offset = res.index;
    path += str.slice(index, offset);
    index = offset + m.length;

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1];
      continue
    }

    var next = str[index];
    var prefix = res[2];
    var name = res[3];
    var capture = res[4];
    var group = res[5];
    var modifier = res[6];
    var asterisk = res[7];

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path);
      path = '';
    }

    var partial = prefix != null && next != null && next !== prefix;
    var repeat = modifier === '+' || modifier === '*';
    var optional = modifier === '?' || modifier === '*';
    var delimiter = res[2] || defaultDelimiter;
    var pattern = capture || group;

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      partial: partial,
      asterisk: !!asterisk,
      pattern: pattern ? escapeGroup(pattern) : (asterisk ? '.*' : '[^' + escapeString(delimiter) + ']+?')
    });
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index);
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path);
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {string}             str
 * @param  {Object=}            options
 * @return {!function(Object=, Object=)}
 */
function compile (str, options) {
  return tokensToFunction(parse(str, options))
}

/**
 * Prettier encoding of URI path segments.
 *
 * @param  {string}
 * @return {string}
 */
function encodeURIComponentPretty (str) {
  return encodeURI(str).replace(/[\/?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
 *
 * @param  {string}
 * @return {string}
 */
function encodeAsterisk (str) {
  return encodeURI(str).replace(/[?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length);

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$');
    }
  }

  return function (obj, opts) {
    var path = '';
    var data = obj || {};
    var options = opts || {};
    var encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent;

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (typeof token === 'string') {
        path += token;

        continue
      }

      var value = data[token.name];
      var segment;

      if (value == null) {
        if (token.optional) {
          // Prepend partial segment prefixes.
          if (token.partial) {
            path += token.prefix;
          }

          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encode(value[j]);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment;
        }

        continue
      }

      segment = token.asterisk ? encodeAsterisk(value) : encode(value);

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment;
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {string} str
 * @return {string}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {string} group
 * @return {string}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1')
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {!RegExp} re
 * @param  {Array}   keys
 * @return {!RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys;
  return re
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {string}
 */
function flags (options) {
  return options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {!RegExp} path
 * @param  {!Array}  keys
 * @return {!RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g);

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        partial: false,
        asterisk: false,
        pattern: null
      });
    }
  }

  return attachKeys(path, keys)
}

/**
 * Transform an array into a regexp.
 *
 * @param  {!Array}  path
 * @param  {Array}   keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = [];

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source);
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

  return attachKeys(regexp, keys)
}

/**
 * Create a path regexp from string input.
 *
 * @param  {string}  path
 * @param  {!Array}  keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function stringToRegexp (path, keys, options) {
  return tokensToRegExp(parse(path, options), keys, options)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {!Array}          tokens
 * @param  {(Array|Object)=} keys
 * @param  {Object=}         options
 * @return {!RegExp}
 */
function tokensToRegExp (tokens, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */ (keys || options);
    keys = [];
  }

  options = options || {};

  var strict = options.strict;
  var end = options.end !== false;
  var route = '';

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];

    if (typeof token === 'string') {
      route += escapeString(token);
    } else {
      var prefix = escapeString(token.prefix);
      var capture = '(?:' + token.pattern + ')';

      keys.push(token);

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*';
      }

      if (token.optional) {
        if (!token.partial) {
          capture = '(?:' + prefix + '(' + capture + '))?';
        } else {
          capture = prefix + '(' + capture + ')?';
        }
      } else {
        capture = prefix + '(' + capture + ')';
      }

      route += capture;
    }
  }

  var delimiter = escapeString(options.delimiter || '/');
  var endsWithDelimiter = route.slice(-delimiter.length) === delimiter;

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + '(?:' + delimiter + '(?=$))?';
  }

  if (end) {
    route += '$';
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)';
  }

  return attachKeys(new RegExp('^' + route, flags(options)), keys)
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(string|RegExp|Array)} path
 * @param  {(Array|Object)=}       keys
 * @param  {Object=}               options
 * @return {!RegExp}
 */
function pathToRegexp (path, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */ (keys || options);
    keys = [];
  }

  options = options || {};

  if (path instanceof RegExp) {
    return regexpToRegexp(path, /** @type {!Array} */ (keys))
  }

  if (isarray(path)) {
    return arrayToRegexp(/** @type {!Array} */ (path), /** @type {!Array} */ (keys), options)
  }

  return stringToRegexp(/** @type {string} */ (path), /** @type {!Array} */ (keys), options)
}

pathToRegexp_1.parse = parse_1;
pathToRegexp_1.compile = compile_1;
pathToRegexp_1.tokensToFunction = tokensToFunction_1;
pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

var patternCache = {};
var cacheLimit = 10000;
var cacheCount = 0;
// Memoized function for creating the path match regex
function compilePath(pattern, options) {
    var cacheKey = "" + options.end + options.strict;
    var cache = patternCache[cacheKey] || (patternCache[cacheKey] = {});
    var cachePattern = JSON.stringify(pattern);
    if (cache[cachePattern]) {
        return cache[cachePattern];
    }
    var keys = [];
    var re = pathToRegexp_1(pattern, keys, options);
    var compiledPattern = { re: re, keys: keys };
    if (cacheCount < cacheLimit) {
        cache[cachePattern] = compiledPattern;
        cacheCount += 1;
    }
    return compiledPattern;
}
/**
 * Public API for matching a URL pathname to a path pattern.
 */
function matchPath(pathname, options) {
    if (options === void 0) { options = {}; }
    if (typeof options === 'string') {
        options = { path: options };
    }
    var _a = options.path, path = _a === void 0 ? '/' : _a, _b = options.exact, exact = _b === void 0 ? false : _b, _c = options.strict, strict = _c === void 0 ? false : _c;
    var _d = compilePath(path, { end: exact, strict: strict }), re = _d.re, keys = _d.keys;
    var match = re.exec(pathname);
    if (!match) {
        return null;
    }
    var url = match[0], values = match.slice(1);
    var isExact = pathname === url;
    if (exact && !isExact) {
        return null;
    }
    return {
        path: path,
        url: path === '/' && url === '' ? '/' : url,
        isExact: isExact,
        params: keys.reduce(function (memo, key, index) {
            memo[key.name] = values[index];
            return memo;
        }, {})
    };
}

var __assign = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var Route = /** @class */ (function () {
    function Route() {
        this.unsubscribe = function () { return; };
        this.componentProps = {};
        this.exact = false;
        this.group = null;
        this.routeRender = null;
        this.match = null;
    }
    // Identify if the current route is a match.
    Route.prototype.computeMatch = function (pathname) {
        if (!pathname) {
            var location_1 = this.activeRouter.get('location');
            pathname = location_1.pathname;
        }
        var newMatch = matchPath(pathname, {
            path: this.url,
            exact: this.exact,
            strict: true
        });
        // If we have a match and we've already matched for the group, don't set the match
        if (newMatch) {
            if (this.group && this.activeRouter.didGroupAlreadyMatch(this.group)) {
                return null;
            }
            this.group && this.activeRouter.setGroupMatched(this.group);
        }
        return newMatch;
    };
    Route.prototype.componentWillLoad = function () {
        // subscribe the project's active router and listen
        // for changes. Recompute the match if any updates get
        // pushed
        var _this = this;
        if (this.group) {
            this.activeRouter.addToGroup(this, this.group);
        }
        this.unsubscribe = this.activeRouter.subscribe(function () {
            _this.match = _this.computeMatch();
        });
        this.match = this.computeMatch();
    };
    Route.prototype.componentDidUnload = function () {
        // be sure to unsubscribe to the router so that we don't
        // get any memory leaks
        this.activeRouter.removeFromGroups(this);
        this.unsubscribe();
    };
    Route.prototype.render = function () {
        // If there is no activeRouter then do not render
        // Check if this route is in the matching URL (for example, a parent route)
        if (!this.activeRouter || !this.match) {
            return null;
        }
        // component props defined in route
        // the history api
        // current match data including params
        var childProps = __assign({}, this.componentProps, { history: this.activeRouter.get('history'), match: this.match });
        // If there is a routerRender defined then use
        // that and pass the component and component props with it.
        if (this.routeRender) {
            return this.routeRender(__assign({}, childProps, { component: this.component }));
        }
        if (this.component) {
            var ChildComponent = this.component;
            return h(ChildComponent, __assign({}, childProps));
        }
    };
    return Route;
}());

var RouteLink = /** @class */ (function () {
    function RouteLink() {
        this.unsubscribe = function () { return; };
        this.exact = false;
        this.custom = false;
        this.activeClass = 'link-active';
        this.match = null;
    }
    // Identify if the current route is a match.
    RouteLink.prototype.computeMatch = function (pathname) {
        if (!pathname) {
            var location_1 = this.activeRouter.get('location');
            pathname = location_1.pathname;
        }
        var match = matchPath(pathname, {
            path: this.urlMatch || this.url,
            exact: this.exact,
            strict: true
        });
        return match;
    };
    RouteLink.prototype.componentWillLoad = function () {
        var _this = this;
        // subscribe the project's active router and listen
        // for changes. Recompute the match if any updates get
        // pushed
        this.unsubscribe = this.activeRouter.subscribe(function () {
            _this.match = _this.computeMatch();
        });
        // Likely that this route link could receive a location prop
        this.match = this.computeMatch();
    };
    RouteLink.prototype.componentDidUnload = function () {
        // be sure to unsubscribe to the router so that we don't
        // get any memory leaks
        this.unsubscribe();
    };
    RouteLink.prototype.handleClick = function (e) {
        e.preventDefault();
        if (!this.activeRouter) {
            console.warn('<stencil-route-link> wasn\'t passed an instance of the router as the "router" prop!');
            return;
        }
        var history = this.activeRouter.get('history');
        return history.push(this.url, {});
    };
    RouteLink.prototype.render = function () {
        var classes = (_a = {},
            _a[this.activeClass] = this.match !== null,
            _a);
        if (this.custom) {
            return (h("span", { class: classes, onClick: this.handleClick.bind(this) },
                h("slot", null)));
        }
        else {
            return (h("a", { class: classes, href: this.url, onClick: this.handleClick.bind(this) },
                h("slot", null)));
        }
        var _a;
    };
    return RouteLink;
}());

var RouteTitle = /** @class */ (function () {
    function RouteTitle() {
    }
    RouteTitle.prototype.componentWillLoad = function () {
        var suffix = this.activeRouter && this.activeRouter.get('titleSuffix') || '';
        document.title = "" + this.title + suffix;
    };
    RouteTitle.prototype.render = function () {
        return null;
    };
    return RouteTitle;
}());

function hasBasename(path, prefix) {
    return (new RegExp('^' + prefix + '(\\/|\\?|#|$)', 'i')).test(path);
}
function stripBasename(path, prefix) {
    return hasBasename(path, prefix) ? path.substr(prefix.length) : path;
}
function stripTrailingSlash(path) {
    return path.charAt(path.length - 1) === '/' ? path.slice(0, -1) : path;
}
function addLeadingSlash(path) {
    return path.charAt(0) === '/' ? path : '/' + path;
}


function parsePath(path) {
    var pathname = path || '/';
    var search = '';
    var hash = '';
    var hashIndex = pathname.indexOf('#');
    if (hashIndex !== -1) {
        hash = pathname.substr(hashIndex);
        pathname = pathname.substr(0, hashIndex);
    }
    var searchIndex = pathname.indexOf('?');
    if (searchIndex !== -1) {
        search = pathname.substr(searchIndex);
        pathname = pathname.substr(0, searchIndex);
    }
    return {
        pathname: pathname,
        search: search === '?' ? '' : search,
        hash: hash === '#' ? '' : hash
    };
}
function createPath(location) {
    var pathname = location.pathname, search = location.search, hash = location.hash;
    var path = pathname || '/';
    if (search && search !== '?') {
        path += (search.charAt(0) === '?' ? search : "?" + search);
    }
    if (hash && hash !== '#') {
        path += (hash.charAt(0) === '#' ? hash : "#" + hash);
    }
    return path;
}
function parseQueryString(query) {
    if (!query) {
        return {};
    }
    return (/^[?#]/.test(query) ? query.slice(1) : query)
        .split('&')
        .reduce(function (params, param) {
        var _a = param.split('='), key = _a[0], value = _a[1];
        params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
        return params;
    }, {});
}

var __assign$1 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
function isAbsolute(pathname) {
    return pathname.charAt(0) === '/';
}
// About 1.5x faster than the two-arg version of Array#splice()
function spliceOne(list, index) {
    for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
        list[i] = list[k];
    }
    list.pop();
}
// This implementation is based heavily on node's url.parse
function resolvePathname(to, from) {
    if (from === void 0) { from = ''; }
    var toParts = to && to.split('/') || [];
    var fromParts = from && from.split('/') || [];
    var isToAbs = to && isAbsolute(to);
    var isFromAbs = from && isAbsolute(from);
    var mustEndAbs = isToAbs || isFromAbs;
    if (to && isAbsolute(to)) {
        // to is absolute
        fromParts = toParts;
    }
    else if (toParts.length) {
        // to is relative, drop the filename
        fromParts.pop();
        fromParts = fromParts.concat(toParts);
    }
    if (!fromParts.length) {
        return '/';
    }
    var hasTrailingSlash;
    if (fromParts.length) {
        var last = fromParts[fromParts.length - 1];
        hasTrailingSlash = (last === '.' || last === '..' || last === '');
    }
    else {
        hasTrailingSlash = false;
    }
    var up = 0;
    for (var i = fromParts.length; i >= 0; i--) {
        var part = fromParts[i];
        if (part === '.') {
            spliceOne(fromParts, i);
        }
        else if (part === '..') {
            spliceOne(fromParts, i);
            up++;
        }
        else if (up) {
            spliceOne(fromParts, i);
            up--;
        }
    }
    if (!mustEndAbs) {
        for (; up--; up) {
            fromParts.unshift('..');
        }
    }
    if (mustEndAbs && fromParts[0] !== '' && (!fromParts[0] || !isAbsolute(fromParts[0]))) {
        fromParts.unshift('');
    }
    var result = fromParts.join('/');
    if (hasTrailingSlash && result.substr(-1) !== '/') {
        result += '/';
    }
    return result;
}


function createLocation(path, state, key, currentLocation) {
    var location;
    if (typeof path === 'string') {
        // Two-arg form: push(path, state)
        location = parsePath(path);
        location.state = state;
    }
    else {
        // One-arg form: push(location)
        location = __assign$1({}, path);
        if (location.pathname === undefined) {
            location.pathname = '';
        }
        if (location.search) {
            if (location.search.charAt(0) !== '?') {
                location.search = '?' + location.search;
            }
        }
        else {
            location.search = '';
        }
        if (location.hash) {
            if (location.hash.charAt(0) !== '#') {
                location.hash = '#' + location.hash;
            }
        }
        else {
            location.hash = '';
        }
        if (state !== undefined && location.state === undefined) {
            location.state = state;
        }
    }
    try {
        location.pathname = decodeURI(location.pathname);
    }
    catch (e) {
        if (e instanceof URIError) {
            throw new URIError('Pathname "' + location.pathname + '" could not be decoded. ' +
                'This is likely caused by an invalid percent-encoding.');
        }
        else {
            throw e;
        }
    }
    if (key) {
        location.key = key;
    }
    if (currentLocation) {
        // Resolve incomplete/relative pathname relative to current location.
        if (!location.pathname) {
            location.pathname = currentLocation.pathname;
        }
        else if (location.pathname.charAt(0) !== '/') {
            location.pathname = resolvePathname(location.pathname, currentLocation.pathname);
        }
    }
    else {
        // When there is no prior location and pathname is empty, set it to /
        if (!location.pathname) {
            location.pathname = '/';
        }
    }
    location.query = parseQueryString(location.search);
    return location;
}

function invariant(value) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (!value) {
        console.error.apply(console, args);
    }
}
function warning(value) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (!value) {
        console.warn.apply(console, args);
    }
}

var createTransitionManager = function () {
    var prompt = null;
    var setPrompt = function (nextPrompt) {
        warning(prompt == null, 'A history supports only one prompt at a time');
        prompt = nextPrompt;
        return function () {
            if (prompt === nextPrompt) {
                prompt = null;
            }
        };
    };
    var confirmTransitionTo = function (location, action, getUserConfirmation, callback) {
        // TODO: If another transition starts while we're still confirming
        // the previous one, we may end up in a weird state. Figure out the
        // best way to handle this.
        if (prompt != null) {
            var result = typeof prompt === 'function' ? prompt(location, action) : prompt;
            if (typeof result === 'string') {
                if (typeof getUserConfirmation === 'function') {
                    getUserConfirmation(result, callback);
                }
                else {
                    warning(false, 'A history needs a getUserConfirmation function in order to use a prompt message');
                    callback(true);
                }
            }
            else {
                // Return false from a transition hook to cancel the transition.
                callback(result !== false);
            }
        }
        else {
            callback(true);
        }
    };
    var listeners = [];
    var appendListener = function (fn) {
        var isActive = true;
        var listener = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (isActive) {
                fn.apply(void 0, args);
            }
        };
        listeners.push(listener);
        return function () {
            isActive = false;
            listeners = listeners.filter(function (item) { return item !== listener; });
        };
    };
    var notifyListeners = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        listeners.forEach(function (listener) { return listener.apply(void 0, args); });
    };
    return {
        setPrompt: setPrompt,
        confirmTransitionTo: confirmTransitionTo,
        appendListener: appendListener,
        notifyListeners: notifyListeners
    };
};

var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);
var addEventListener = function (node, event, listener) { return (node.addEventListener
    ? node.addEventListener(event, listener, false)
    : node.attachEvent('on' + event, listener)); };
var removeEventListener = function (node, event, listener) { return (node.removeEventListener
    ? node.removeEventListener(event, listener, false)
    : node.detachEvent('on' + event, listener)); };
var getConfirmation = function (message, callback) { return (callback(window.confirm(message))); };
/**
 * Returns true if the HTML5 history API is supported. Taken from Modernizr.
 *
 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
 * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
 */
var supportsHistory = function () {
    var ua = window.navigator.userAgent;
    if ((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
        ua.indexOf('Mobile Safari') !== -1 &&
        ua.indexOf('Chrome') === -1 &&
        ua.indexOf('Windows Phone') === -1) {
        return false;
    }
    return window.history && 'pushState' in window.history;
};
/**
 * Returns true if browser fires popstate on hash change.
 * IE10 and IE11 do not.
 */
var supportsPopStateOnHashChange = function () { return (window.navigator.userAgent.indexOf('Trident') === -1); };
/**
 * Returns false if using go(n) with hash history causes a full page reload.
 */

var isExtraneousPopstateEvent = function (event) { return (event.state === undefined &&
    navigator.userAgent.indexOf('CriOS') === -1); };

var PopStateEvent = 'popstate';
var HashChangeEvent = 'hashchange';
var getHistoryState = function () {
    try {
        return window.history.state || {};
    }
    catch (e) {
        // IE 11 sometimes throws when accessing window.history.state
        // See https://github.com/ReactTraining/history/pull/289
        return {};
    }
};
/**
 * Creates a history object that uses the HTML5 history API including
 * pushState, replaceState, and the popstate event.
 */
var createBrowserHistory = function (props) {
    if (props === void 0) { props = {}; }
    invariant(canUseDOM, 'Browser history needs a DOM');
    var globalHistory = window.history;
    var canUseHistory = supportsHistory();
    var needsHashChangeListener = !supportsPopStateOnHashChange();
    var _a = props.forceRefresh, forceRefresh = _a === void 0 ? false : _a, _b = props.getUserConfirmation, getUserConfirmation = _b === void 0 ? getConfirmation : _b, _c = props.keyLength, keyLength = _c === void 0 ? 6 : _c;
    var basename = props.basename ? stripTrailingSlash(addLeadingSlash(props.basename)) : '';
    var getDOMLocation = function (historyState) {
        historyState = historyState || {};
        var key = historyState.key, state = historyState.state;
        var _a = window.location, pathname = _a.pathname, search = _a.search, hash = _a.hash;
        var path = pathname + search + hash;
        warning((!basename || hasBasename(path, basename)), 'You are attempting to use a basename on a page whose URL path does not begin ' +
            'with the basename. Expected path "' + path + '" to begin with "' + basename + '".');
        if (basename) {
            path = stripBasename(path, basename);
        }
        return createLocation(path, state, key);
    };
    var createKey = function () { return (Math.random().toString(36).substr(2, keyLength)); };
    var transitionManager = createTransitionManager();
    var setState = function (nextState) {
        Object.assign(history, nextState);
        history.length = globalHistory.length;
        transitionManager.notifyListeners(history.location, history.action);
    };
    var handlePopState = function (event) {
        // Ignore extraneous popstate events in WebKit.
        if (isExtraneousPopstateEvent(event)) {
            return;
        }
        handlePop(getDOMLocation(event.state));
    };
    var handleHashChange = function () {
        handlePop(getDOMLocation(getHistoryState()));
    };
    var forceNextPop = false;
    var handlePop = function (location) {
        if (forceNextPop) {
            forceNextPop = false;
            setState();
        }
        else {
            var action_1 = 'POP';
            transitionManager.confirmTransitionTo(location, action_1, getUserConfirmation, function (ok) {
                if (ok) {
                    setState({ action: action_1, location: location });
                }
                else {
                    revertPop(location);
                }
            });
        }
    };
    var revertPop = function (fromLocation) {
        var toLocation = history.location;
        // TODO: We could probably make this more reliable by
        // keeping a list of keys we've seen in sessionStorage.
        // Instead, we just default to 0 for keys we don't know.
        var toIndex = allKeys.indexOf(toLocation.key);
        if (toIndex === -1) {
            toIndex = 0;
        }
        var fromIndex = allKeys.indexOf(fromLocation.key);
        if (fromIndex === -1) {
            fromIndex = 0;
        }
        var delta = toIndex - fromIndex;
        if (delta) {
            forceNextPop = true;
            go(delta);
        }
    };
    var initialLocation = getDOMLocation(getHistoryState());
    var allKeys = [initialLocation.key];
    // Public interface
    var createHref = function (location) {
        return basename + createPath(location);
    };
    var push = function (path, state) {
        warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' +
            'argument is a location-like object that already has state; it is ignored');
        var action = 'PUSH';
        var location = createLocation(path, state, createKey(), history.location);
        transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
            if (!ok) {
                return;
            }
            var href = createHref(location);
            var key = location.key, state = location.state;
            if (canUseHistory) {
                globalHistory.pushState({ key: key, state: state }, null, href);
                if (forceRefresh) {
                    window.location.href = href;
                }
                else {
                    var prevIndex = allKeys.indexOf(history.location.key);
                    var nextKeys = allKeys.slice(0, prevIndex === -1 ? 0 : prevIndex + 1);
                    nextKeys.push(location.key);
                    allKeys = nextKeys;
                    setState({ action: action, location: location });
                }
            }
            else {
                warning(state === undefined, 'Browser history cannot push state in browsers that do not support HTML5 history');
                window.location.href = href;
            }
        });
    };
    var replace = function (path, state) {
        warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' +
            'argument is a location-like object that already has state; it is ignored');
        var action = 'REPLACE';
        var location = createLocation(path, state, createKey(), history.location);
        transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
            if (!ok) {
                return;
            }
            var href = createHref(location);
            var key = location.key, state = location.state;
            if (canUseHistory) {
                globalHistory.replaceState({ key: key, state: state }, null, href);
                if (forceRefresh) {
                    window.location.replace(href);
                }
                else {
                    var prevIndex = allKeys.indexOf(history.location.key);
                    if (prevIndex !== -1) {
                        allKeys[prevIndex] = location.key;
                    }
                    setState({ action: action, location: location });
                }
            }
            else {
                warning(state === undefined, 'Browser history cannot replace state in browsers that do not support HTML5 history');
                window.location.replace(href);
            }
        });
    };
    var go = function (n) {
        globalHistory.go(n);
    };
    var goBack = function () { return go(-1); };
    var goForward = function () { return go(1); };
    var listenerCount = 0;
    var checkDOMListeners = function (delta) {
        listenerCount += delta;
        if (listenerCount === 1) {
            addEventListener(window, PopStateEvent, handlePopState);
            if (needsHashChangeListener) {
                addEventListener(window, HashChangeEvent, handleHashChange);
            }
        }
        else if (listenerCount === 0) {
            removeEventListener(window, PopStateEvent, handlePopState);
            if (needsHashChangeListener) {
                removeEventListener(window, HashChangeEvent, handleHashChange);
            }
        }
    };
    var isBlocked = false;
    var block = function (prompt) {
        if (prompt === void 0) { prompt = ''; }
        var unblock = transitionManager.setPrompt(prompt);
        if (!isBlocked) {
            checkDOMListeners(1);
            isBlocked = true;
        }
        return function () {
            if (isBlocked) {
                isBlocked = false;
                checkDOMListeners(-1);
            }
            return unblock();
        };
    };
    var listen = function (listener) {
        var unlisten = transitionManager.appendListener(listener);
        checkDOMListeners(1);
        return function () {
            checkDOMListeners(-1);
            unlisten();
        };
    };
    var history = {
        length: globalHistory.length,
        action: 'POP',
        location: initialLocation,
        createHref: createHref,
        push: push,
        replace: replace,
        go: go,
        goBack: goBack,
        goForward: goForward,
        block: block,
        listen: listen
    };
    return history;
};

var Router = /** @class */ (function () {
    function Router() {
        this.root = '/';
        // A suffix to append to the page title whenever
        // it's updated through RouteTitle
        this.titleSuffix = '';
        this.unsubscribe = function () { };
        this.match = null;
    }
    Router.prototype.titleSuffixChanged = function (newValue) {
        this.activeRouter.set({
            titleSuffix: newValue
        });
    };
    Router.prototype.computeMatch = function (pathname) {
        return {
            path: this.root,
            url: this.root,
            isExact: pathname === this.root,
            params: {}
        };
    };
    Router.prototype.componentWillLoad = function () {
        var _this = this;
        var history = createBrowserHistory();
        history.listen(function (location) {
            _this.activeRouter.set({ location: location });
        });
        this.activeRouter.set({
            location: history.location,
            titleSuffix: this.titleSuffix,
            history: history
        });
        // subscribe the project's active router and listen
        // for changes. Recompute the match if any updates get
        // pushed
        this.unsubscribe = this.activeRouter.subscribe(function () {
            _this.match = _this.computeMatch();
        });
        this.match = this.computeMatch();
    };
    Router.prototype.componentDidUnload = function () {
        // be sure to unsubscribe to the router so that we don't
        // get any memory leaks
        this.unsubscribe();
    };
    Router.prototype.render = function () {
        return h("slot", null);
    };
    return Router;
}());

var Redirect = /** @class */ (function () {
    function Redirect() {
    }
    Redirect.prototype.componentWillLoad = function () {
        var history = this.activeRouter.get('history');
        if (!history) {
            return;
        }
        return history.replace(this.url, {});
    };
    return Redirect;
}());

exports['stencil-async-content'] = AsyncContent;
exports['stencil-route'] = Route;
exports['stencil-route-link'] = RouteLink;
exports['stencil-route-title'] = RouteTitle;
exports['stencil-router'] = Router;
exports['stencil-router-redirect'] = Redirect;
},


/***************** stencil-async-content *****************/
[
/** stencil-async-content: tag **/
"stencil-async-content",

/** stencil-async-content: members **/
[
  [ "content", /** state **/ 5, /** do not observe attribute **/ 0, /** type any **/ 1 ],
  [ "documentLocation", /** prop **/ 1, /** observe attribute **/ 1, /** type string **/ 2 ]
],

/** stencil-async-content: host **/
0 /* no host data */,

/** stencil-async-content: events **/
0 /* no events */,

/** stencil-async-content: propWillChanges **/
0 /* no prop will change methods */,

/** stencil-async-content: propDidChanges **/
[
  [
    /*****  stencil-async-content prop did change [0] ***** /
    /* prop name **/ "doc",
    /* call fn *****/ "fetchNewContent"
  ]
]

],

/***************** stencil-route *****************/
[
/** stencil-route: tag **/
"stencil-route",

/** stencil-route: members **/
[
  [ "activeRouter", /** prop context **/ 3, /** do not observe attribute **/ 0, /** type any **/ 1, /** context ***/ "activeRouter" ],
  [ "component", /** prop **/ 1, /** observe attribute **/ 1, /** type string **/ 2 ],
  [ "componentProps", /** prop **/ 1, /** observe attribute **/ 1, /** type any **/ 1 ],
  [ "exact", /** prop **/ 1, /** observe attribute **/ 1, /** type boolean **/ 3 ],
  [ "group", /** prop **/ 1, /** observe attribute **/ 1, /** type string **/ 2 ],
  [ "location", /** prop context **/ 3, /** do not observe attribute **/ 0, /** type any **/ 1, /** context ***/ "location" ],
  [ "match", /** state **/ 5, /** do not observe attribute **/ 0, /** type any **/ 1 ],
  [ "routeRender", /** prop **/ 1, /** observe attribute **/ 1, /** type any **/ 1 ],
  [ "url", /** prop **/ 1, /** observe attribute **/ 1, /** type any **/ 1 ]
]

],

/***************** stencil-route-link *****************/
[
/** stencil-route-link: tag **/
"stencil-route-link",

/** stencil-route-link: members **/
[
  [ "activeClass", /** prop **/ 1, /** observe attribute **/ 1, /** type string **/ 2 ],
  [ "activeRouter", /** prop context **/ 3, /** do not observe attribute **/ 0, /** type any **/ 1, /** context ***/ "activeRouter" ],
  [ "custom", /** prop **/ 1, /** observe attribute **/ 1, /** type boolean **/ 3 ],
  [ "exact", /** prop **/ 1, /** observe attribute **/ 1, /** type boolean **/ 3 ],
  [ "location", /** prop context **/ 3, /** do not observe attribute **/ 0, /** type any **/ 1, /** context ***/ "location" ],
  [ "match", /** state **/ 5, /** do not observe attribute **/ 0, /** type any **/ 1 ],
  [ "url", /** prop **/ 1, /** observe attribute **/ 1, /** type string **/ 2 ],
  [ "urlMatch", /** prop **/ 1, /** observe attribute **/ 1, /** type any **/ 1 ]
]

],

/***************** stencil-route-title *****************/
[
/** stencil-route-title: tag **/
"stencil-route-title",

/** stencil-route-title: members **/
[
  [ "activeRouter", /** prop context **/ 3, /** do not observe attribute **/ 0, /** type any **/ 1, /** context ***/ "activeRouter" ],
  [ "title", /** prop **/ 1, /** observe attribute **/ 1, /** type string **/ 2 ]
]

],

/***************** stencil-router *****************/
[
/** stencil-router: tag **/
"stencil-router",

/** stencil-router: members **/
[
  [ "activeRouter", /** prop context **/ 3, /** do not observe attribute **/ 0, /** type any **/ 1, /** context ***/ "activeRouter" ],
  [ "match", /** state **/ 5, /** do not observe attribute **/ 0, /** type any **/ 1 ],
  [ "root", /** prop **/ 1, /** observe attribute **/ 1, /** type string **/ 2 ],
  [ "titleSuffix", /** prop **/ 1, /** observe attribute **/ 1, /** type string **/ 2 ]
],

/** stencil-router: host **/
0 /* no host data */,

/** stencil-router: events **/
0 /* no events */,

/** stencil-router: propWillChanges **/
0 /* no prop will change methods */,

/** stencil-router: propDidChanges **/
[
  [
    /*****  stencil-router prop did change [0] ***** /
    /* prop name **/ "titleSuffix",
    /* call fn *****/ "titleSuffixChanged"
  ]
]

],

/***************** stencil-router-redirect *****************/
[
/** stencil-router-redirect: tag **/
"stencil-router-redirect",

/** stencil-router-redirect: members **/
[
  [ "activeRouter", /** prop context **/ 3, /** do not observe attribute **/ 0, /** type any **/ 1, /** context ***/ "activeRouter" ],
  [ "url", /** prop **/ 1, /** observe attribute **/ 1, /** type string **/ 2 ]
]

]
);