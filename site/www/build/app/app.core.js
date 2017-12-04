/*! Built with http://stenciljs.com */
(function(Context,appNamespace,hydratedCssClass,publicPath){"use strict";
var s=document.querySelector("script[data-core='app.core.js'][data-path]");if(s){publicPath=s.getAttribute('data-path');}
(function(publicPath){
    /** @stencil/router global **/

    var __assign = (undefined && undefined.__assign) || Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    Context.activeRouter = (function () {
        var state = {};
        var groups = {};
        var matchedGroups = {};
        var nextListeners = [];
        function getDefaultState() {
            return {
                location: {
                    pathname: Context.window.location.pathname,
                    search: Context.window.location.search
                }
            };
        }
        function set(value) {
            state = __assign({}, state, value);
            clearGroups();
            dispatch();
        }
        function get(attrName) {
            if (Object.keys(state).length === 0) {
                return getDefaultState();
            }
            if (!attrName) {
                return state;
            }
            return state[attrName];
        }
        /**
         *  When we get a new location, clear matching groups
         *  so we give them a chance to re-match and re-render.
         */
        function clearGroups() {
            matchedGroups = {};
        }
        function dispatch() {
            var listeners = nextListeners;
            for (var i = 0; i < listeners.length; i++) {
                var listener = listeners[i];
                listener();
            }
        }
        function subscribe(listener) {
            if (typeof listener !== 'function') {
                throw new Error('Expected listener to be a function.');
            }
            var isSubscribed = true;
            nextListeners.push(listener);
            return function unsubscribe() {
                if (!isSubscribed) {
                    return;
                }
                isSubscribed = false;
                var index = nextListeners.indexOf(listener);
                nextListeners.splice(index, 1);
            };
        }
        /**
         * Remove a Route from all groups
         */
        function removeFromGroups(route) {
            for (var groupName in groups) {
                var group = groups[groupName];
                groups[groupName] = group.filter(function (r) { return r !== route; });
            }
        }
        /**
         * Add a Route to the given group
         */
        function addToGroup(route, groupName) {
            if (!(groupName in groups)) {
                groups[groupName] = [];
            }
            groups[groupName].push(route);
        }
        /**
         * Check if a group already matched once
         */
        function didGroupAlreadyMatch(groupName) {
            if (!groupName) {
                return false;
            }
            return matchedGroups[groupName] === true;
        }
        /**
         * Set that a group has matched
         */
        function setGroupMatched(groupName) {
            matchedGroups[groupName] = true;
        }
        return {
            set: set,
            get: get,
            subscribe: subscribe,
            addToGroup: addToGroup,
            removeFromGroups: removeFromGroups,
            didGroupAlreadyMatch: didGroupAlreadyMatch,
            setGroupMatched: setGroupMatched
        };
    })();
})(publicPath);

(function (window, document, Context, appNamespace, publicPath) {
    "use strict";

    function isDef(v) {
        return v !== undefined && v !== null;
    }
    function isUndef(v) {
        return v === undefined || v === null;
    }

    function toDashCase(str) {
        return str.replace(/([A-Z])/g, function (g) {
            return '-' + g[0].toLowerCase();
        });
    }

    function noop() {}

    function getElementReference(elm, ref) {
        if (ref === 'child') {
            return elm.firstElementChild;
        }
        if (ref === 'parent') {
            return getParentElement(elm) || elm;
        }
        if (ref === 'body') {
            return elm.ownerDocument.body;
        }
        if (ref === 'document') {
            return elm.ownerDocument;
        }
        if (ref === 'window') {
            return elm.ownerDocument.defaultView;
        }
        return elm;
    }
    function getParentElement(elm) {
        if (elm.parentElement) {
            // normal element with a parent element
            return elm.parentElement;
        }
        if (elm.parentNode && elm.parentNode.host) {
            // shadow dom's document fragment
            return elm.parentNode.host;
        }
        return null;
    }

    /**
     * SSR Attribute Names
     */
    var SSR_VNODE_ID = 'data-ssrv';
    var SSR_CHILD_ID = 'data-ssrc';

    /**
     * Key Name to Key Code Map
     */
    var KEY_CODE_MAP = {
        'enter': 13,
        'escape': 27,
        'space': 32,
        'tab': 9,
        'left': 37,
        'up': 38,
        'right': 39,
        'down': 40
    };
    /**
     * Namespaces
     */

    /**
     * File names and value
     */

    function initElementListeners(plt, elm) {
        // so the element was just connected, which means it's in the DOM
        // however, the component instance hasn't been created yet
        // but what if an event it should be listening to get emitted right now??
        // let's add our listeners right now to our element, and if it happens
        // to receive events between now and the instance being created let's
        // queue up all of the event data and fire it off on the instance when it's ready
        var cmpMeta = plt.getComponentMeta(elm);
        var listeners = cmpMeta.listenersMeta;
        if (listeners) {
            for (var i = 0; i < listeners.length; i++) {
                var listener = listeners[i];
                if (listener.eventDisabled) continue;
                (elm._listeners = elm._listeners || {})[listener.eventName] = addEventListener(plt, elm, listener.eventName, createListenerCallback(elm, listener.eventMethodName), listener.eventCapture, listener.eventPassive);
            }
        }
    }
    function createListenerCallback(elm, eventMethodName) {
        // create the function that gets called when the element receives
        // an event which it should be listening for
        return function onEvent(ev) {
            if (elm.$instance) {
                // instance is ready, let's call it's member method for this event
                elm.$instance[eventMethodName](ev);
            } else {
                // instance is not ready!!
                // let's queue up this event data and replay it later
                // when the instance is ready
                (elm._queuedEvents = elm._queuedEvents || []).push(eventMethodName, ev);
            }
        };
    }
    function replayQueuedEventsOnInstance(elm) {
        // the element has an instance now and
        // we already added the event listeners to the element
        var queuedEvents = elm._queuedEvents;
        if (queuedEvents) {
            // events may have already fired before the instance was even ready
            // now that the instance is ready, let's replay all of the events that
            // we queued up earlier that were originally meant for the instance
            for (var i = 0; i < queuedEvents.length; i += 2) {
                // data was added in sets of two
                // first item the eventMethodName
                // second item is the event data
                // take a look at initElementListener()
                elm.$instance[queuedEvents[i]](queuedEvents[i + 1]);
            }
            // no longer need this data, be gone with you
            delete elm._queuedEvents;
        }
    }
    function enableEventListener(plt, instance, eventName, shouldEnable, attachTo) {
        if (instance) {
            var elm = instance.__el;
            var cmpMeta = plt.getComponentMeta(elm);
            var listenerMeta = cmpMeta.listenersMeta;
            if (listenerMeta) {
                var deregisterFns = elm._listeners = elm._listeners || {};
                for (var i = 0; i < listenerMeta.length; i++) {
                    var listener = listenerMeta[i];
                    if (listener.eventName === eventName) {
                        var fn = deregisterFns[eventName];
                        if (shouldEnable && !fn) {
                            var attachToEventName = eventName;
                            var element = elm;
                            if (typeof attachTo === 'string') {
                                attachToEventName = attachTo + ':' + eventName;
                            } else if (typeof attachTo === 'object') {
                                element = attachTo;
                            }
                            deregisterFns[eventName] = addEventListener(plt, element, attachToEventName, createListenerCallback(elm, listener.eventMethodName), listener.eventCapture, listener.eventPassive);
                        } else if (!shouldEnable && fn) {
                            deregisterFns[eventName]();
                            delete deregisterFns[eventName];
                        }
                        return true;
                    }
                }
            }
        }
        return false;
    }
    function addEventListener(plt, elm, eventName, listenerCallback, useCapture, usePassive) {
        // depending on the event name, we could actually be
        // attaching this element to something like the document or window
        var splt = eventName.split(':');
        var testKeyCode = 0;
        // get our event listener options
        // mainly this is used to set passive events if this browser supports it
        var eventListenerOpts = plt.getEventOptions(useCapture, usePassive);
        if (elm && splt.length > 1) {
            // document:mousemove
            // parent:touchend
            // body:keyup.enter
            elm = getElementReference(elm, splt[0]);
            eventName = splt[1];
        }
        if (!elm) {
            // something's up, let's not continue and just return a noop()
            return noop;
        }
        var eventListener = listenerCallback;
        // test to see if we're looking for an exact keycode
        splt = eventName.split('.');
        if (splt.length > 1) {
            // looks like this listener is also looking for a keycode
            // keyup.enter
            eventName = splt[0];
            testKeyCode = KEY_CODE_MAP[splt[1]];
            eventListener = function (ev) {
                // create the our internal event listener callback we'll be firing off
                // within it is the user's event listener callback and some other goodies
                if (testKeyCode > 0 && ev.keyCode !== testKeyCode) {
                    // we're looking for a specific keycode
                    // but the one we were given wasn't the right keycode
                    return;
                }
                // fire the user's component event listener callback
                // if the instance isn't ready yet, this listener is already
                // set to handle that and re-queue the update when it is ready
                listenerCallback(ev);
            };
        }
        // ok, good to go, let's add the actual listener to the dom element
        elm.addEventListener(eventName, eventListener, eventListenerOpts);
        // return a function which is used to remove this very same listener
        return function removeListener() {
            elm && elm.removeEventListener(eventName, eventListener, eventListenerOpts);
        };
    }
    function detachListeners(elm) {
        var deregisterFns = elm._listeners;
        if (deregisterFns) {
            var eventNames = Object.keys(deregisterFns);
            for (var i = 0; i < eventNames.length; i++) {
                deregisterFns[eventNames[i]]();
            }
            elm._listeners = null;
        }
    }

    class VNode {}

    /**
     * Production h() function based on Preact by
     * Jason Miller (@developit)
     * Licensed under the MIT License
     * https://github.com/developit/preact/blob/master/LICENSE
     *
     * Modified for Stencil's compiler and vdom
     */
    var stack = [];
    function h(nodeName, vnodeData, child) {
        var children;
        var lastSimple = false;
        var simple = false;
        for (var i = arguments.length; i-- > 2;) {
            stack.push(arguments[i]);
        }
        while (stack.length) {
            if ((child = stack.pop()) && child.pop !== undefined) {
                for (i = child.length; i--;) {
                    stack.push(child[i]);
                }
            } else {
                if (typeof child === 'boolean') child = null;
                if (simple = typeof nodeName !== 'function') {
                    if (child == null) child = '';else if (typeof child === 'number') child = String(child);else if (typeof child !== 'string') simple = false;
                }
                if (simple && lastSimple) {
                    children[children.length - 1].vtext += child;
                } else if (children === undefined) {
                    children = [simple ? t(child) : child];
                } else {
                    children.push(simple ? t(child) : child);
                }
                lastSimple = simple;
            }
        }
        vnodeData = vnodeData === null ? undefined : vnodeData;
        var vnode = new VNode();
        vnode.vtag = nodeName;
        vnode.vchildren = children;
        if (vnodeData != null) {
            vnode.vattrs = vnodeData;
            vnode.vkey = vnodeData.key;
            vnode.vref = vnodeData.ref;
        }
        // normalize class / classname attributes
        if (vnode.vattrs) {
            if (vnode.vattrs['className']) {
                vnode.vattrs['class'] = vnode.vattrs['className'];
            }
            if (vnode.vattrs['class'] && typeof vnode.vattrs['class'] === 'object') {
                var key = void 0,
                    classNameString = '';
                for (key in vnode.vattrs['class']) {
                    if (vnode.vattrs['class'][key] === true) {
                        classNameString += ' ' + key;
                    }
                }
                vnode.vattrs['class'] = classNameString.substr(1);
            }
        }
        return vnode;
    }
    function t(textValue) {
        var vnode = new VNode();
        vnode.vtext = textValue;
        return vnode;
    }

    function createVNodesFromSsr(domApi, rootElm) {
        var allSsrElms = rootElm.querySelectorAll('[' + SSR_VNODE_ID + ']'),
            elm,
            ssrVNodeId,
            ssrVNode,
            i,
            ilen = allSsrElms.length,
            j,
            jlen;
        if (rootElm._hasLoaded = ilen > 0) {
            for (i = 0; i < ilen; i++) {
                elm = allSsrElms[i];
                ssrVNodeId = domApi.$getAttribute(elm, SSR_VNODE_ID);
                ssrVNode = elm._vnode = new VNode();
                ssrVNode.vtag = domApi.$tagName(ssrVNode.elm = elm).toLowerCase();
                for (j = 0, jlen = elm.childNodes.length; j < jlen; j++) {
                    addChildSsrVNodes(domApi, elm.childNodes[j], ssrVNode, ssrVNodeId, true);
                }
            }
        }
    }
    function addChildSsrVNodes(domApi, node, parentVNode, ssrVNodeId, checkNestedElements) {
        var nodeType = domApi.$nodeType(node);
        var previousComment;
        var childVNodeId, childVNodeSplt, childVNode;
        if (checkNestedElements && nodeType === 1 /* ElementNode */) {
                childVNodeId = domApi.$getAttribute(node, SSR_CHILD_ID);
                if (childVNodeId) {
                    // split the start comment's data with a period
                    childVNodeSplt = childVNodeId.split('.');
                    // ensure this this element is a child element of the ssr vnode
                    if (childVNodeSplt[0] === ssrVNodeId) {
                        // cool, this element is a child to the parent vnode
                        childVNode = new VNode();
                        childVNode.vtag = domApi.$tagName(childVNode.elm = node).toLowerCase();
                        // this is a new child vnode
                        // so ensure its parent vnode has the vchildren array
                        if (!parentVNode.vchildren) {
                            parentVNode.vchildren = [];
                        }
                        // add our child vnode to a specific index of the vnode's children
                        parentVNode.vchildren[childVNodeSplt[1]] = childVNode;
                        // this is now the new parent vnode for all the next child checks
                        parentVNode = childVNode;
                        // if there's a trailing period, then it means there aren't any
                        // more nested elements, but maybe nested text nodes
                        // either way, don't keep walking down the tree after this next call
                        checkNestedElements = childVNodeSplt[2] !== '';
                    }
                }
                // keep drilling down through the elements
                for (var i = 0; i < node.childNodes.length; i++) {
                    addChildSsrVNodes(domApi, node.childNodes[i], parentVNode, ssrVNodeId, checkNestedElements);
                }
            } else if (nodeType === 3 /* TextNode */ && (previousComment = node.previousSibling) && domApi.$nodeType(previousComment) === 8 /* CommentNode */) {
                // split the start comment's data with a period
                childVNodeSplt = domApi.$getTextContent(previousComment).split('.');
                // ensure this is an ssr text node start comment
                // which should start with an "s" and delimited by periods
                if (childVNodeSplt[0] === 's' && childVNodeSplt[1] === ssrVNodeId) {
                    // cool, this is a text node and it's got a start comment
                    childVNode = t(domApi.$getTextContent(node));
                    childVNode.elm = node;
                    // this is a new child vnode
                    // so ensure its parent vnode has the vchildren array
                    if (!parentVNode.vchildren) {
                        parentVNode.vchildren = [];
                    }
                    // add our child vnode to a specific index of the vnode's children
                    parentVNode.vchildren[childVNodeSplt[2]] = childVNode;
                }
            }
    }
    function assignHostContentSlots(domApi, elm, slotMeta) {
        // compiler has already figured out if this component has slots or not
        // if the component doesn't even have slots then we'll skip over all of this code
        var childNodes = elm.childNodes;
        if (slotMeta && !elm.$defaultHolder) {
            domApi.$insertBefore(elm, elm.$defaultHolder = domApi.$createComment(''), childNodes[0]);
        }
        if (slotMeta === 2 /* HasNamedSlots */) {
                // looks like this component has named slots
                // so let's loop through each of the childNodes to the host element
                // and pick out the ones that have a slot attribute
                // if it doesn't have a slot attribute, than it's a default slot
                var slotName = void 0;
                var defaultSlot = void 0;
                var namedSlots = void 0;
                for (var i = 0, childNodeLen = childNodes.length; i < childNodeLen; i++) {
                    var childNode = childNodes[i];
                    if (domApi.$nodeType(childNode) === 1 && (slotName = domApi.$getAttribute(childNode, 'slot')) != null) {
                        // is element node
                        // this element has a slot name attribute
                        // so this element will end up getting relocated into
                        // the component's named slot once it renders
                        namedSlots = namedSlots || {};
                        if (namedSlots[slotName]) {
                            namedSlots[slotName].push(childNode);
                        } else {
                            namedSlots[slotName] = [childNode];
                        }
                    } else {
                        // this is a text node
                        // or it's an element node that doesn't have a slot attribute
                        // let's add this node to our collection for the default slot
                        if (defaultSlot) {
                            defaultSlot.push(childNode);
                        } else {
                            defaultSlot = [childNode];
                        }
                    }
                }
                // keep a reference to all of the initial nodes
                // found as immediate childNodes to the host element
                elm._hostContentNodes = {
                    defaultSlot: defaultSlot,
                    namedSlots: namedSlots
                };
            } else if (slotMeta === 1 /* HasSlots */) {
                // this component doesn't have named slots, but it does
                // have at least a default slot, so the work here is alot easier than
                // when we're not looping through each element and reading attribute values
                elm._hostContentNodes = {
                    defaultSlot: childNodes.length ? Array.apply(null, childNodes) : null
                };
            }
    }

    function createDomControllerClient(win, now) {
        var readCBs = [];
        var writeCBs = [];
        var rafPending = false;
        function raf(cb) {
            return win.requestAnimationFrame(cb);
        }
        function domRead(cb) {
            readCBs.push(cb);
            if (!rafPending) {
                rafPending = true;
                raf(rafFlush);
            }
        }
        function domWrite(cb) {
            writeCBs.push(cb);
            if (!rafPending) {
                rafPending = true;
                raf(rafFlush);
            }
        }
        function rafFlush(timeStamp, startTime, cb, err) {
            try {
                startTime = now();
                // ******** DOM READS ****************
                while (cb = readCBs.shift()) {
                    cb(timeStamp);
                }
                // ******** DOM WRITES ****************
                while (cb = writeCBs.shift()) {
                    cb(timeStamp);
                    if (now() - startTime > 8) {
                        break;
                    }
                }
            } catch (e) {
                err = e;
            }
            if (rafPending = readCBs.length > 0 || writeCBs.length > 0) {
                raf(rafFlush);
            }
            if (err) {
                console.error(err);
            }
        }
        return {
            read: domRead,
            write: domWrite,
            raf: raf
        };
    }

    function createDomApi(document) {
        // using the $ prefix so that closure is
        // cool with property renaming each of these
        return {
            $documentElement: document.documentElement,
            $head: document.head,
            $body: document.body,
            $nodeType: function nodeType(node) {
                return node.nodeType;
            },
            $createEvent: function createEvent() {
                return document.createEvent('CustomEvent');
            },
            $createElement: function createElement(tagName) {
                return document.createElement(tagName);
            },
            $createElementNS: function createElementNS(namespace, tagName) {
                return document.createElementNS(namespace, tagName);
            },
            $createTextNode: function createTextNode(text) {
                return document.createTextNode(text);
            },
            $createComment: function createComment(data) {
                return document.createComment(data);
            },
            $insertBefore: function insertBefore(parentNode, childNode, referenceNode) {
                parentNode.insertBefore(childNode, referenceNode);
            },
            $removeChild: function removeChild(parentNode, childNode) {
                return parentNode.removeChild(childNode);
            },
            $appendChild: function appendChild(parentNode, childNode) {
                parentNode.appendChild(childNode);
            },
            $childNodes: function childNodes(node) {
                return node.childNodes;
            },
            $parentNode: function parentNode(node) {
                return node.parentNode;
            },
            $nextSibling: function nextSibling(node) {
                return node.nextSibling;
            },
            $tagName: function tagName(elm) {
                return elm.tagName;
            },
            $getTextContent: function (node) {
                return node.textContent;
            },
            $setTextContent: function setTextContent(node, text) {
                node.textContent = text;
            },
            $getAttribute: function getAttribute(elm, key) {
                return elm.getAttribute(key);
            },
            $setAttribute: function setAttribute(elm, key, val) {
                elm.setAttribute(key, val);
            },
            $setAttributeNS: function $setAttributeNS(elm, namespaceURI, qualifiedName, val) {
                elm.setAttributeNS(namespaceURI, qualifiedName, val);
            },
            $removeAttribute: function removeAttribute(elm, key) {
                elm.removeAttribute(key);
            }
        };
    }

    var EMPTY_OBJ = {};
    var EMPTY_ARR = [];
    function updateElement(plt, oldVnode, newVnode, isSvgMode, propName) {
        var elm = newVnode.elm;
        var oldVnodeAttrs = oldVnode != null && oldVnode.vattrs != null ? oldVnode.vattrs : {};
        var newVnodeAttrs = newVnode.vattrs != null ? newVnode.vattrs : {};
        // remove attributes no longer present on the vnode by setting them to undefined
        for (propName in oldVnodeAttrs) {
            if (!(newVnodeAttrs && newVnodeAttrs[propName] != null) && oldVnodeAttrs[propName] != null) {
                setAccessor(plt, elm, propName, oldVnodeAttrs[propName], oldVnodeAttrs[propName] = undefined, isSvgMode);
            }
        }
        // add new & update changed attributes
        for (propName in newVnodeAttrs) {
            if (!(propName in oldVnodeAttrs) || newVnodeAttrs[propName] !== (propName === 'value' || propName === 'checked' ? elm[propName] : oldVnodeAttrs[propName])) {
                setAccessor(plt, elm, propName, oldVnodeAttrs[propName], oldVnodeAttrs[propName] = newVnodeAttrs[propName], isSvgMode);
            }
        }
    }
    function setAccessor(plt, elm, name, oldValue, newValue, isSvg, i, ilen) {
        if (name === 'class' && !isSvg) {
            // Class
            if (oldValue !== newValue) {
                var oldList = oldValue == null || oldValue === '' ? EMPTY_ARR : oldValue.trim().split(/\s+/);
                var newList = newValue == null || newValue === '' ? EMPTY_ARR : newValue.trim().split(/\s+/);
                for (i = 0, ilen = oldList.length; i < ilen; i++) {
                    if (newList.indexOf(oldList[i]) === -1) {
                        elm.classList.remove(oldList[i]);
                    }
                }
                for (i = 0, ilen = newList.length; i < ilen; i++) {
                    if (oldList.indexOf(newList[i]) === -1) {
                        elm.classList.add(newList[i]);
                    }
                }
            }
        } else if (name === 'style') {
            // Style
            oldValue = oldValue || EMPTY_OBJ;
            newValue = newValue || EMPTY_OBJ;
            for (i in oldValue) {
                if (!newValue[i]) {
                    elm.style[i] = '';
                }
            }
            for (i in newValue) {
                if (newValue[i] !== oldValue[i]) {
                    elm.style[i] = newValue[i];
                }
            }
        } else if (name[0] === 'o' && name[1] === 'n' && !(name in elm)) {
            // Event Handlers
            // adding an standard event listener, like <button onClick=...> or something
            name = name.toLowerCase().substring(2);
            var listeners = elm._listeners = elm._listeners || {};
            if (newValue) {
                if (!oldValue) {
                    // add listener
                    listeners[name] = addEventListener(plt, elm, name, newValue);
                }
            } else if (listeners[name]) {
                // remove listener
                listeners[name]();
            }
        } else if (name !== 'list' && name !== 'type' && !isSvg && (name in elm || ['object', 'function'].indexOf(typeof newValue) !== -1 && newValue !== null)) {
            // Properties
            // - list and type are attributes that get applied as values on the element
            // - all svgs get values as attributes not props
            // - check if elm contains name or if the value is array, object, or function
            var cmpMeta = plt.getComponentMeta(elm);
            if (cmpMeta && cmpMeta.membersMeta && name in cmpMeta.membersMeta) {
                // setting a known @Prop on this element
                setProperty(elm, name, newValue);
            } else {
                // property setting a prop on a native property, like "value" or something
                setProperty(elm, name, newValue == null ? '' : newValue);
                if (newValue == null || newValue === false) {
                    elm.removeAttribute(name);
                }
            }
        } else if (newValue != null) {
            // Element Attributes
            i = name !== (name = name.replace(/^xlink\:?/, ''));
            if (BOOLEAN_ATTRS[name] === 1 && (!newValue || newValue === 'false')) {
                if (i) {
                    elm.removeAttributeNS(XLINK_NS$1, name.toLowerCase());
                } else {
                    elm.removeAttribute(name);
                }
            } else if (typeof newValue !== 'function') {
                if (i) {
                    elm.setAttributeNS(XLINK_NS$1, name.toLowerCase(), newValue);
                } else {
                    elm.setAttribute(name, newValue);
                }
            }
        }
    }
    /**
     * Attempt to set a DOM property to the given value.
     * IE & FF throw for certain property-value combinations.
     */
    function setProperty(elm, name, value) {
        try {
            elm[name] = value;
        } catch (e) {}
    }
    var BOOLEAN_ATTRS = {
        'allowfullscreen': 1,
        'async': 1,
        'autofocus': 1,
        'autoplay': 1,
        'checked': 1,
        'controls': 1,
        'disabled': 1,
        'enabled': 1,
        'formnovalidate': 1,
        'hidden': 1,
        'multiple': 1,
        'noresize': 1,
        'readonly': 1,
        'required': 1,
        'selected': 1,
        'spellcheck': 1
    };
    var XLINK_NS$1 = 'http://www.w3.org/1999/xlink';

    /**
     * Virtual DOM patching algorithm based on Snabbdom by
     * Simon Friis Vindum (@paldepind)
     * Licensed under the MIT License
     * https://github.com/snabbdom/snabbdom/blob/master/LICENSE
     *
     * Modified for Stencil's renderer and slot projection
     */
    var isSvgMode = false;
    function createRendererPatch(plt, domApi, supportsNativeShadowDom) {
        // createRenderer() is only created once per app
        // the patch() function which createRenderer() returned is the function
        // which gets called numerous times by each component
        function createElm(vnode, parentElm, childIndex) {
            var i = 0;
            if (vnode.vtag === 'slot' && !useNativeShadowDom) {
                if (hostContentNodes) {
                    // special case for manually relocating host content nodes
                    // to their new home in either a named slot or the default slot
                    var namedSlot = vnode.vattrs && vnode.vattrs.name;
                    var slotNodes = void 0;
                    if (isDef(namedSlot)) {
                        // this vnode is a named slot
                        slotNodes = hostContentNodes.namedSlots && hostContentNodes.namedSlots[namedSlot];
                    } else {
                        // this vnode is the default slot
                        slotNodes = hostContentNodes.defaultSlot;
                    }
                    if (isDef(slotNodes)) {
                        // the host element has some nodes that need to be moved around
                        // we have a slot for the user's vnode to go into
                        // while we're moving nodes around, temporarily disable
                        // the disconnectCallback from working
                        plt.tmpDisconnected = true;
                        for (; i < slotNodes.length; i++) {
                            // remove the host content node from it's original parent node
                            // then relocate the host content node to its new slotted home
                            domApi.$appendChild(parentElm, domApi.$removeChild(domApi.$parentNode(slotNodes[i]), slotNodes[i]));
                        }
                        // done moving nodes around
                        // allow the disconnect callback to work again
                        plt.tmpDisconnected = false;
                    }
                }
                // this was a slot node, we do not create slot elements, our work here is done
                // no need to return any element to be added to the dom
                return null;
            }
            if (isDef(vnode.vtext)) {
                // create text node
                vnode.elm = domApi.$createTextNode(vnode.vtext);
            } else {
                // create element
                var elm = vnode.elm = isSvgMode || vnode.vtag === 'svg' ? domApi.$createElementNS('http://www.w3.org/2000/svg', vnode.vtag) : domApi.$createElement(vnode.vtag);
                isSvgMode = vnode.vtag === 'svg' ? true : vnode.vtag === 'foreignObject' ? false : isSvgMode;
                // add css classes, attrs, props, listeners, etc.
                updateElement(plt, null, vnode, isSvgMode);
                if (scopeId !== null && elm._scopeId !== scopeId) {
                    // if there is a scopeId and this is the initial render
                    // then let's add the scopeId as an attribute
                    domApi.$setAttribute(elm, elm._scopeId = scopeId, '');
                }
                var children = vnode.vchildren;
                if (isDef(ssrId)) {
                    // SSR ONLY: this is an SSR render and this
                    // logic does not run on the client
                    // give this element the SSR child id that can be read by the client
                    domApi.$setAttribute(elm, SSR_CHILD_ID, ssrId + '.' + childIndex + (hasChildNodes(children) ? '' : '.'));
                }
                if (children) {
                    var childNode = void 0;
                    for (; i < children.length; ++i) {
                        // create the node
                        childNode = createElm(children[i], elm, i);
                        // return node could have been null
                        if (childNode) {
                            if (isDef(ssrId) && childNode.nodeType === 3) {
                                // SSR ONLY: add the text node's start comment
                                domApi.$appendChild(elm, domApi.$createComment('s.' + ssrId + '.' + i));
                            }
                            // append our new node
                            domApi.$appendChild(elm, childNode);
                            if (isDef(ssrId) && childNode.nodeType === 3) {
                                // SSR ONLY: add the text node's end comment
                                domApi.$appendChild(elm, domApi.$createComment('/'));
                                domApi.$appendChild(elm, domApi.$createTextNode(' '));
                            }
                        }
                    }
                }
            }
            return vnode.elm;
        }
        function addVnodes(parentElm, before, vnodes, startIdx, endIdx) {
            var containerElm = parentElm.$defaultHolder && parentElm.$defaultHolder.parentNode || parentElm;
            var childNode = void 0;
            for (; startIdx <= endIdx; ++startIdx) {
                var vnodeChild = vnodes[startIdx];
                if (isDef(vnodeChild)) {
                    if (isDef(vnodeChild.vtext)) {
                        childNode = domApi.$createTextNode(vnodeChild.vtext);
                    } else {
                        childNode = createElm(vnodeChild, parentElm, startIdx);
                    }
                    if (isDef(childNode)) {
                        vnodeChild.elm = childNode;
                        domApi.$insertBefore(containerElm, childNode, before);
                    }
                }
            }
        }
        function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
            for (; startIdx <= endIdx; ++startIdx) {
                if (isDef(vnodes[startIdx])) {
                    domApi.$removeChild(parentElm, vnodes[startIdx].elm);
                }
            }
        }
        function updateChildren(parentElm, oldCh, newCh) {
            var oldStartIdx = 0,
                newStartIdx = 0;
            var oldEndIdx = oldCh.length - 1;
            var oldStartVnode = oldCh[0];
            var oldEndVnode = oldCh[oldEndIdx];
            var newEndIdx = newCh.length - 1;
            var newStartVnode = newCh[0];
            var newEndVnode = newCh[newEndIdx];
            var oldKeyToIdx = void 0;
            var idxInOld = void 0;
            var elmToMove = void 0;
            var node = void 0;
            while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
                if (oldStartVnode == null) {
                    oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
                } else if (oldEndVnode == null) {
                    oldEndVnode = oldCh[--oldEndIdx];
                } else if (newStartVnode == null) {
                    newStartVnode = newCh[++newStartIdx];
                } else if (newEndVnode == null) {
                    newEndVnode = newCh[--newEndIdx];
                } else if (isSameVnode(oldStartVnode, newStartVnode)) {
                    patchVNode(oldStartVnode, newStartVnode);
                    oldStartVnode = oldCh[++oldStartIdx];
                    newStartVnode = newCh[++newStartIdx];
                } else if (isSameVnode(oldEndVnode, newEndVnode)) {
                    patchVNode(oldEndVnode, newEndVnode);
                    oldEndVnode = oldCh[--oldEndIdx];
                    newEndVnode = newCh[--newEndIdx];
                } else if (isSameVnode(oldStartVnode, newEndVnode)) {
                    patchVNode(oldStartVnode, newEndVnode);
                    domApi.$insertBefore(parentElm, oldStartVnode.elm, domApi.$nextSibling(oldEndVnode.elm));
                    oldStartVnode = oldCh[++oldStartIdx];
                    newEndVnode = newCh[--newEndIdx];
                } else if (isSameVnode(oldEndVnode, newStartVnode)) {
                    patchVNode(oldEndVnode, newStartVnode);
                    domApi.$insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                    oldEndVnode = oldCh[--oldEndIdx];
                    newStartVnode = newCh[++newStartIdx];
                } else {
                    if (isUndef(oldKeyToIdx)) {
                        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                    }
                    idxInOld = oldKeyToIdx[newStartVnode.vkey];
                    if (isUndef(idxInOld)) {
                        // new element
                        node = createElm(newStartVnode, parentElm, newStartIdx);
                        newStartVnode = newCh[++newStartIdx];
                    } else {
                        elmToMove = oldCh[idxInOld];
                        if (elmToMove.vtag !== newStartVnode.vtag) {
                            node = createElm(newStartVnode, parentElm, idxInOld);
                        } else {
                            patchVNode(elmToMove, newStartVnode);
                            oldCh[idxInOld] = undefined;
                            node = elmToMove.elm;
                        }
                        newStartVnode = newCh[++newStartIdx];
                    }
                    if (node) {
                        domApi.$insertBefore(parentElm, node, oldStartVnode.elm);
                    }
                }
            }
            if (oldStartIdx > oldEndIdx) {
                addVnodes(parentElm, newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm, newCh, newStartIdx, newEndIdx);
            } else if (newStartIdx > newEndIdx) {
                removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
            }
        }
        function isSameVnode(vnode1, vnode2) {
            // compare if two vnode to see if they're "technically" the same
            // need to have the same element tag, and same key to be the same
            return vnode1.vtag === vnode2.vtag && vnode1.vkey === vnode2.vkey;
        }
        function createKeyToOldIdx(children, beginIdx, endIdx) {
            var i = void 0,
                map = {},
                key = void 0,
                ch = void 0;
            for (i = beginIdx; i <= endIdx; ++i) {
                ch = children[i];
                if (ch != null) {
                    key = ch.vkey;
                    if (key !== undefined) {
                        map.k = i;
                    }
                }
            }
            return map;
        }
        function patchVNode(oldVNode, newVNode) {
            var elm = newVNode.elm = oldVNode.elm;
            var oldChildren = oldVNode.vchildren;
            var newChildren = newVNode.vchildren;
            isSvgMode = newVNode.elm && newVNode.elm.parentElement != null && newVNode.elm.ownerSVGElement !== undefined;
            isSvgMode = newVNode.vtag === 'svg' ? true : newVNode.vtag === 'foreignObject' ? false : isSvgMode;
            if (isUndef(newVNode.vtext)) {
                // element node
                if (newVNode.vtag !== 'slot') {
                    // either this is the first render of an element OR it's an update
                    // AND we already know it's possible it could have changed
                    // this updates the element's css classes, attrs, props, listeners, etc.
                    updateElement(plt, oldVNode, newVNode, isSvgMode);
                }
                if (isDef(oldChildren) && isDef(newChildren)) {
                    // looks like there's child vnodes for both the old and new vnodes
                    updateChildren(elm, oldChildren, newChildren);
                } else if (isDef(newChildren)) {
                    // no old child vnodes, but there are new child vnodes to add
                    if (isDef(oldVNode.vtext)) {
                        // the old vnode was text, so be sure to clear it out
                        domApi.$setTextContent(elm, '');
                    }
                    // add the new vnode children
                    addVnodes(elm, null, newChildren, 0, newChildren.length - 1);
                } else if (isDef(oldChildren)) {
                    // no new child vnodes, but there are old child vnodes to remove
                    removeVnodes(elm, oldChildren, 0, oldChildren.length - 1);
                }
            } else if (elm._hostContentNodes && elm._hostContentNodes.defaultSlot) {
                // this element has slotted content
                var parentElement = elm._hostContentNodes.defaultSlot[0].parentElement;
                domApi.$setTextContent(parentElement, newVNode.vtext);
                elm._hostContentNodes.defaultSlot = [parentElement.childNodes[0]];
            } else if (oldVNode.vtext !== newVNode.vtext) {
                // update the text content for the text only vnode
                // and also only if the text is different than before
                domApi.$setTextContent(elm, newVNode.vtext);
            }
        }
        // internal variables to be reused per patch() call
        var isUpdate = void 0,
            hostContentNodes = void 0,
            useNativeShadowDom = void 0,
            ssrId = void 0,
            scopeId = void 0;
        return function patch(oldVNode, newVNode, isUpdatePatch, hostElementContentNodes, encapsulation, ssrPatchId) {
            // patchVNode() is synchronous
            // so it is safe to set these variables and internally
            // the same patch() call will reference the same data
            isUpdate = isUpdatePatch;
            hostContentNodes = hostElementContentNodes;
            ssrId = ssrPatchId;
            var tag = domApi.$tagName(oldVNode.elm).toLowerCase();
            scopeId = encapsulation === 2 /* ScopedCss */ || encapsulation === 1 /* ShadowDom */ && !supportsNativeShadowDom ? 'data-' + tag : null;
            // use native shadow dom only if the component wants to use it
            // and if this browser supports native shadow dom
            useNativeShadowDom = encapsulation === 1 /* ShadowDom */ && supportsNativeShadowDom;
            if (!isUpdate) {
                if (useNativeShadowDom) {
                    // this component SHOULD use native slot/shadow dom
                    // this browser DOES support native shadow dom
                    // and this is the first render
                    // let's create that shadow root
                    oldVNode.elm = oldVNode.elm.attachShadow({ mode: 'open' });
                } else if (scopeId) {
                    // this host element should use scoped css
                    // add the scope attribute to the host
                    domApi.$setAttribute(oldVNode.elm, scopeId + '-host', '');
                }
            }
            // synchronous patch
            patchVNode(oldVNode, newVNode);
            if (isDef(ssrId)) {
                // SSR ONLY: we've been given an SSR id, so the host element
                // should be given the ssr id attribute
                domApi.$setAttribute(oldVNode.elm, SSR_VNODE_ID, ssrId);
            }
            // return our new vnode
            return newVNode;
        };
    }
    function callNodeRefs(vNode, isDestroy) {
        if (vNode) {
            vNode.vref && vNode.vref(isDestroy ? null : vNode.elm);
            vNode.vchildren && vNode.vchildren.forEach(function (vChild) {
                callNodeRefs(vChild, isDestroy);
            });
        }
    }
    function hasChildNodes(children) {
        // SSR ONLY: check if there are any more nested child elements
        // if there aren't, this info is useful so the client runtime
        // doesn't have to climb down and check so many elements
        if (children) {
            for (var i = 0; i < children.length; i++) {
                if (children[i].vtag !== 'slot' || hasChildNodes(children[i].vchildren)) {
                    return true;
                }
            }
        }
        return false;
    }

    function createQueueClient(domCtrl, now) {
        var raf = domCtrl.raf;
        var highPromise = Promise.resolve();
        var highPriority = [];
        var lowPriority = [];
        var resolvePending = false;
        var rafPending = false;
        function doHighPriority() {
            // holy geez we need to get this stuff done and fast
            // all high priority callbacks should be fired off immediately
            while (highPriority.length > 0) {
                highPriority.shift()();
            }
            resolvePending = false;
        }
        function doWork() {
            var start = now();
            // always run all of the high priority work if there is any
            doHighPriority();
            while (lowPriority.length > 0 && now() - start < 40) {
                lowPriority.shift()();
            }
            // check to see if we still have work to do
            if (rafPending = lowPriority.length > 0) {
                // everyone just settle down now
                // we already don't have time to do anything in this callback
                // let's throw the next one in a requestAnimationFrame
                // so we can just simmer down for a bit
                raf(flush);
            }
        }
        function flush() {
            // always run all of the high priority work if there is any
            doHighPriority();
            // always force a bunch of medium callbacks to run, but still have
            // a throttle on how many can run in a certain time
            var start = now();
            while (lowPriority.length > 0 && now() - start < 4) {
                lowPriority.shift()();
            }
            if (rafPending = lowPriority.length > 0) {
                // still more to do yet, but we've run out of time
                // let's let this thing cool off and try again in the next ric
                raf(doWork);
            }
        }
        function add(cb, priority) {
            if (priority === 3 /* High */) {
                    // uses Promise.resolve() for next tick
                    highPriority.push(cb);
                    if (!resolvePending) {
                        // not already pending work to do, so let's tee it up
                        resolvePending = true;
                        highPromise.then(doHighPriority);
                    }
                } else {
                // defaults to low priority
                // uses requestAnimationFrame
                lowPriority.push(cb);
                if (!rafPending) {
                    // not already pending work to do, so let's tee it up
                    rafPending = true;
                    raf(doWork);
                }
            }
        }
        return {
            add: add,
            flush: flush
        };
    }

    function parseComponentLoaders(cmpRegistryData, registry, attr) {
        // tag name will always be lower case
        var cmpMeta = {
            tagNameMeta: cmpRegistryData[0],
            membersMeta: {
                // every component defaults to always have
                // the mode and color properties
                // but only color should observe any attribute changes
                'mode': { memberType: 1 /* Prop */ },
                'color': { memberType: 1 /* Prop */, attribName: 'color' }
            }
        };
        // map of the modes w/ bundle id and style data
        cmpMeta.bundleIds = cmpRegistryData[1];
        // parse member meta
        // this data only includes props that are attributes that need to be observed
        // it does not include all of the props yet
        parseMembersData(cmpMeta, cmpRegistryData[3], attr);
        // encapsulation
        cmpMeta.encapsulation = cmpRegistryData[4];
        // slot
        cmpMeta.slotMeta = cmpRegistryData[5];
        if (cmpRegistryData[6]) {
            // parse listener meta
            cmpMeta.listenersMeta = cmpRegistryData[6].map(parseListenerData);
        }
        // bundle load priority
        cmpMeta.loadPriority = cmpRegistryData[7];
        return registry[cmpMeta.tagNameMeta] = cmpMeta;
    }
    function parseListenerData(listenerData) {
        return {
            eventName: listenerData[0],
            eventMethodName: listenerData[1],
            eventDisabled: !!listenerData[2],
            eventPassive: !!listenerData[3],
            eventCapture: !!listenerData[4]
        };
    }
    function parseMembersData(cmpMeta, memberData, attr) {
        if (memberData) {
            cmpMeta.membersMeta = cmpMeta.membersMeta || {};
            for (var i = 0; i < memberData.length; i++) {
                var d = memberData[i];
                cmpMeta.membersMeta[d[0]] = {
                    memberType: d[1],
                    attribName: d[2] ? attr === 1 /* LowerCase */ ? d[0].toLowerCase() : toDashCase(d[0]) : 0,
                    propType: d[3],
                    ctrlId: d[4]
                };
            }
        }
    }
    function parseComponentMeta(registry, moduleImports, cmpMetaData, attr) {
        // tag name will always be lowser case
        var cmpMeta = registry[cmpMetaData[0]];
        // get the component class which was added to moduleImports
        // using the tag as the key on the export object
        cmpMeta.componentModule = moduleImports[cmpMetaData[0]];
        // component members
        parseMembersData(cmpMeta, cmpMetaData[1], attr);
        // host element meta
        cmpMeta.hostMeta = cmpMetaData[2];
        // component instance events
        if (cmpMetaData[3]) {
            cmpMeta.eventsMeta = cmpMetaData[3].map(parseEventData);
        }
        // component instance prop WILL change methods
        cmpMeta.propsWillChangeMeta = cmpMetaData[4];
        // component instance prop DID change methods
        cmpMeta.propsDidChangeMeta = cmpMetaData[5];
    }
    function parseEventData(d) {
        return {
            eventName: d[0],
            eventMethodName: d[1] || d[0],
            eventBubbles: !d[2],
            eventCancelable: !d[3],
            eventComposed: !d[4]
        };
    }
    function parsePropertyValue(propType, propValue) {
        // ensure this value is of the correct prop type
        if (isDef(propValue)) {
            if (propType === 3 /* Boolean */) {
                    // per the HTML spec, any string value means it is a boolean true value
                    // but we'll cheat here and say that the string "false" is the boolean false
                    return propValue === 'false' ? false : propValue === '' || !!propValue;
                }
            if (propType === 4 /* Number */) {
                    // force it to be a number
                    return parseFloat(propValue);
                }
        }
        // not sure exactly what type we want
        // so no need to change to a different type
        return propValue;
    }

    function attributeChangedCallback(cmpMeta, elm, attribName, oldVal, newVal) {
        // only react if the attribute values actually changed
        if (oldVal !== newVal) {
            // normalize the attribute name w/ lower case
            attribName = attribName.toLowerCase();
            // using the known component meta data
            // look up to see if we have a property wired up to this attribute name
            var propsMeta = cmpMeta.membersMeta;
            if (propsMeta) {
                for (var propName in propsMeta) {
                    if (propsMeta[propName].attribName === attribName) {
                        // cool we've got a prop using this attribute name the value will
                        // be a string, so let's convert it to the correct type the app wants
                        // below code is ugly yes, but great minification ;)
                        elm[propName] = parsePropertyValue(propsMeta[propName].propType, newVal);
                        break;
                    }
                }
            }
        }
    }

    function initEventEmitters(plt, componentEvents, instance) {
        if (componentEvents) {
            componentEvents.forEach(function (eventMeta) {
                instance[eventMeta.eventMethodName] = {
                    emit: function eventEmitter(data) {
                        var eventData = {
                            bubbles: eventMeta.eventBubbles,
                            composed: eventMeta.eventComposed,
                            cancelable: eventMeta.eventCancelable,
                            detail: data
                        };
                        plt.emitEvent(instance.__el, eventMeta.eventName, eventData);
                    }
                };
            });
        }
    }

    function proxyHostElementPrototype(plt, membersMeta, hostPrototype) {
        // create getters/setters on the host element prototype to represent the public API
        // the setters allows us to know when data has changed so we can re-render
        membersMeta && Object.keys(membersMeta).forEach(function (memberName) {
            // add getters/setters
            var memberType = membersMeta[memberName].memberType;
            if (memberType === 1 /* Prop */ || memberType === 2 /* PropMutable */) {
                    // @Prop() or @Prop({ mutable: true })
                    definePropertyGetterSetter(hostPrototype, memberName, function getHostElementProp() {
                        // host element getter (cannot be arrow fn)
                        // yup, ugly, srynotsry
                        // but its creating _values if it doesn't already exist
                        return (this._values = this._values || {})[memberName];
                    }, function setHostElementProp(newValue) {
                        // host element setter (cannot be arrow fn)
                        setValue(plt, this, memberName, newValue);
                    });
                } else if (memberType === 6 /* Method */) {
                    // @Method()
                    // add a placeholder noop value on the host element's prototype
                    // incase this method gets called before setup
                    definePropertyValue(hostPrototype, memberName, noop);
                }
        });
    }
    function proxyComponentInstance(plt, cmpMeta, elm, instance) {
        // at this point we've got a specific node of a host element, and created a component class instance
        // and we've already created getters/setters on both the host element and component class prototypes
        // let's upgrade any data that might have been set on the host element already
        // and let's have the getters/setters kick in and do their jobs
        // let's automatically add a reference to the host element on the instance
        instance.__el = elm;
        // create the _values object if it doesn't already exist
        // this will hold all of the internal getter/setter values
        elm._values = elm._values || {};
        cmpMeta.membersMeta && Object.keys(cmpMeta.membersMeta).forEach(function (memberName) {
            defineMember(plt, cmpMeta, elm, instance, memberName);
        });
    }
    function defineMember(plt, cmpMeta, elm, instance, memberName) {
        var memberMeta = cmpMeta.membersMeta[memberName];
        var memberType = memberMeta.memberType;
        function getComponentProp() {
            // component instance prop/state getter
            // get the property value directly from our internal values
            var elm = this.__el;
            return elm._values[memberName];
        }
        function setComponentProp(newValue) {
            // component instance prop/state setter (cannot be arrow fn)
            var elm = this.__el;
            if (memberType !== 1 /* Prop */) {
                    setValue(plt, elm, memberName, newValue);
                } else {
                console.warn('@Prop() "' + memberName + '" on "' + elm.tagName + '" cannot be modified.');
            }
        }
        if (memberType === 1 /* Prop */ || memberType === 5 /* State */ || memberType === 2 /* PropMutable */) {
                if (memberType !== 5 /* State */) {
                        if (memberMeta.attribName && (elm._values[memberName] === undefined || elm._values[memberName] === '')) {
                            // check the prop value from the host element attribute
                            var hostAttrValue = elm.getAttribute(memberMeta.attribName);
                            if (hostAttrValue != null) {
                                // looks like we've got an attribute value
                                // let's set it to our internal values
                                elm._values[memberName] = parsePropertyValue(memberMeta.propType, hostAttrValue);
                            }
                        }
                        if (elm.hasOwnProperty(memberName)) {
                            // @Prop or @Prop({mutable:true})
                            // property values on the host element should override
                            // any default values on the component instance
                            if (elm._values[memberName] === undefined) {
                                elm._values[memberName] = elm[memberName];
                            }
                            if (plt.isClient) {
                                // within the browser, the element's prototype
                                // already has its getter/setter set, but on the
                                // server the prototype is shared causing issues
                                // so instead the server's elm has the getter/setter
                                // on the actual element instance, not its prototype
                                // for the client, let's delete its "own" property
                                delete elm[memberName];
                            }
                        }
                    }
                if (instance.hasOwnProperty(memberName) && elm._values[memberName] === undefined) {
                    // @Prop() or @Prop({mutable:true}) or @State()
                    // we haven't yet got a value from the above checks so let's
                    // read any "own" property instance values already set
                    // to our internal value as the source of getter data
                    // we're about to define a property and it'll overwrite this "own" property
                    elm._values[memberName] = instance[memberName];
                }
                // add getter/setter to the component instance
                // these will be pointed to the internal data set from the above checks
                definePropertyGetterSetter(instance, memberName, getComponentProp, setComponentProp);
                // add watchers to props if they exist
                proxyPropChangeMethods(cmpMeta.propsWillChangeMeta, PROP_WILL_CHG, elm, instance, memberName);
                proxyPropChangeMethods(cmpMeta.propsDidChangeMeta, PROP_DID_CHG, elm, instance, memberName);
            } else if (memberType === 7 /* Element */) {
                // @Element()
                // add a getter to the element reference using
                // the member name the component meta provided
                definePropertyValue(instance, memberName, elm);
            } else if (memberType === 6 /* Method */) {
                // @Method()
                // add a property "value" on the host element
                // which we'll bind to the instance's method
                definePropertyValue(elm, memberName, instance[memberName].bind(instance));
            } else if (memberType === 3 /* PropContext */) {
                // @Prop({ context: 'config' })
                var contextObj = plt.getContextItem(memberMeta.ctrlId);
                if (contextObj) {
                    definePropertyValue(instance, memberName, contextObj.getContext && contextObj.getContext(elm) || contextObj);
                }
            } else if (memberType === 4 /* PropConnect */) {
                // @Prop({ connect: 'ion-loading-ctrl' })
                definePropertyValue(instance, memberName, plt.propConnect(memberMeta.ctrlId));
            }
    }
    function proxyPropChangeMethods(propChangeMeta, prefix, elm, instance, memberName) {
        // there are prop WILL change methods for this component
        var propChangeMthd = propChangeMeta && propChangeMeta.find(function (m) {
            return m[0 /* PropName */] === memberName;
        });
        if (propChangeMthd) {
            // cool, we should watch for changes to this property
            // let's bind their watcher function and add it to our list
            // of watchers, so any time this property changes we should
            // also fire off their method
            elm._values[prefix + memberName] = instance[propChangeMthd[1 /* MethodName */]].bind(instance);
        }
    }
    function setValue(plt, elm, memberName, newVal) {
        // get the internal values object, which should always come from the host element instance
        // create the _values object if it doesn't already exist
        var internalValues = elm._values = elm._values || {};
        // check our new property value against our internal value
        var oldVal = internalValues[memberName];
        if (newVal !== oldVal) {
            // gadzooks! the property's value has changed!!
            if (internalValues[PROP_WILL_CHG + memberName]) {
                // this instance is watching for when this property WILL change
                internalValues[PROP_WILL_CHG + memberName](newVal, oldVal);
            }
            // set our new value!
            // https://youtu.be/dFtLONl4cNc?t=22
            internalValues[memberName] = newVal;
            if (internalValues[PROP_DID_CHG + memberName]) {
                // this instance is watching for when this property DID change
                internalValues[PROP_DID_CHG + memberName](newVal, oldVal);
            }
            if (elm.$instance) {
                // looks like this value actually changed, so we've got work to do!
                // but only if we've already created an instance, otherwise just chill out
                // queue that we need to do an update, but don't worry about queuing
                // up millions cuz this function ensures it only runs once
                queueUpdate(plt, elm);
            }
        }
    }
    function definePropertyValue(obj, propertyKey, value) {
        // minification shortcut
        Object.defineProperty(obj, propertyKey, {
            'configurable': true,
            'value': value
        });
    }
    function definePropertyGetterSetter(obj, propertyKey, get, set) {
        // minification shortcut
        Object.defineProperty(obj, propertyKey, {
            'configurable': true,
            'get': get,
            'set': set
        });
    }
    function proxyController(domApi, controllerComponents, ctrlTag) {
        return {
            'create': proxyProp(domApi, controllerComponents, ctrlTag, 'create'),
            'componentOnReady': proxyProp(domApi, controllerComponents, ctrlTag, 'componentOnReady')
        };
    }
    function loadComponent(domApi, controllerComponents, ctrlTag) {
        return new Promise(function (resolve) {
            var ctrlElm = controllerComponents[ctrlTag];
            if (!ctrlElm) {
                ctrlElm = domApi.$body.querySelector(ctrlTag);
            }
            if (!ctrlElm) {
                ctrlElm = controllerComponents[ctrlTag] = domApi.$createElement(ctrlTag);
                domApi.$appendChild(domApi.$body, ctrlElm);
            }
            ctrlElm.componentOnReady(resolve);
        });
    }
    function proxyProp(domApi, controllerComponents, ctrlTag, proxyMethodName) {
        return function () {
            var args = arguments;
            return loadComponent(domApi, controllerComponents, ctrlTag).then(function (ctrlElm) {
                return ctrlElm[proxyMethodName].apply(ctrlElm, args);
            });
        };
    }
    var PROP_WILL_CHG = '$$wc';
    var PROP_DID_CHG = '$$dc';

    function initComponentInstance(plt, elm) {
        try {
            // using the user's component class, let's create a new instance
            var cmpMeta = plt.getComponentMeta(elm);
            var instance = elm.$instance = new cmpMeta.componentModule();
            // ok cool, we've got an host element now, and a actual instance
            // and there were no errors creating the instance
            // let's upgrade the data on the host element
            // and let the getters/setters do their jobs
            proxyComponentInstance(plt, cmpMeta, elm, instance);
            // add each of the event emitters which wire up instance methods
            // to fire off dom events from the host element
            initEventEmitters(plt, cmpMeta.eventsMeta, instance);
            try {
                // replay any event listeners on the instance that
                // were queued up between the time the element was
                // connected and before the instance was ready
                replayQueuedEventsOnInstance(elm);
            } catch (e) {
                plt.onError(e, 2 /* QueueEventsError */, elm);
            }
        } catch (e) {
            // something done went wrong trying to create a component instance
            // create a dumby instance so other stuff can load
            // but chances are the app isn't fully working cuz this component has issues
            elm.$instance = {};
            plt.onError(e, 7 /* InitInstanceError */, elm, true);
        }
    }
    function initLoad(plt, elm, hydratedCssClass) {
        // all is good, this component has been told it's time to finish loading
        var instance = elm.$instance;
        // it's possible that we've already decided to destroy this element
        // check if this element has any actively loading child elements
        if (instance && !elm._hasDestroyed && (!elm.$activeLoading || !elm.$activeLoading.length)) {
            // cool, so at this point this element isn't already being destroyed
            // and it does not have any child elements that are still loading
            // ensure we remove any child references cuz it doesn't matter at this point
            delete elm.$activeLoading;
            // sweet, this particular element is good to go
            // all of this element's children have loaded (if any)
            elm._hasLoaded = true;
            try {
                // fire off the user's elm.componentOnReady() callbacks that were
                // put directly on the element (well before anything was ready)
                if (elm._onReadyCallbacks) {
                    elm._onReadyCallbacks.forEach(function (cb) {
                        return cb(elm);
                    });
                    delete elm._onReadyCallbacks;
                }
                // fire off the user's componentDidLoad method (if one was provided)
                // componentDidLoad only runs ONCE, after the instance's element has been
                // assigned as the host element, and AFTER render() has been called
                // we'll also fire this method off on the element, just to
                instance.componentDidLoad && instance.componentDidLoad();
                // fire off the ref if it exists
                callNodeRefs(elm._vnode);
            } catch (e) {
                plt.onError(e, 4 /* DidLoadError */, elm);
            }
            // add the css class that this element has officially hydrated
            elm.classList.add(hydratedCssClass);
            // ( •_•)
            // ( •_•)>⌐■-■
            // (⌐■_■)
            // load events fire from bottom to top
            // the deepest elements load first then bubbles up
            propagateElementLoaded(elm);
        }
    }
    function propagateElementLoaded(elm) {
        // load events fire from bottom to top
        // the deepest elements load first then bubbles up
        if (elm._ancestorHostElement) {
            // ok so this element already has a known ancestor host element
            // let's make sure we remove this element from its ancestor's
            // known list of child elements which are actively loading
            var ancestorsActivelyLoadingChildren = elm._ancestorHostElement.$activeLoading;
            if (ancestorsActivelyLoadingChildren) {
                var index = ancestorsActivelyLoadingChildren.indexOf(elm);
                if (index > -1) {
                    // yup, this element is in the list of child elements to wait on
                    // remove it so we can work to get the length down to 0
                    ancestorsActivelyLoadingChildren.splice(index, 1);
                }
                // the ancestor's initLoad method will do the actual checks
                // to see if the ancestor is actually loaded or not
                // then let's call the ancestor's initLoad method if there's no length
                // (which actually ends up as this method again but for the ancestor)
                !ancestorsActivelyLoadingChildren.length && elm._ancestorHostElement.$initLoad();
            }
            // fuhgeddaboudit, no need to keep a reference after this element loaded
            delete elm._ancestorHostElement;
        }
    }

    function createThemedClasses(mode, color, classList) {
        var allClasses = {};
        return classList.split(' ').reduce(function (classObj, classString) {
            classObj[classString] = true;
            if (mode) {
                classObj[classString + '-' + mode] = true;
                if (color) {
                    classObj[classString + '-' + color] = true;
                    classObj[classString + '-' + mode + '-' + color] = true;
                }
            }
            return classObj;
        }, allClasses);
    }

    function render(plt, elm, cmpMeta, isUpdateRender) {
        var instance = elm.$instance;
        // if this component has a render function, let's fire
        // it off and generate the child vnodes for this host element
        // note that we do not create the host element cuz it already exists
        var hostMeta = cmpMeta.hostMeta;
        if (instance.render || instance.hostData || hostMeta) {
            var vnodeChildren = instance.render && instance.render();
            var vnodeHostData = instance.hostData && instance.hostData();
            if (hostMeta) {
                vnodeHostData = Object.keys(hostMeta).reduce(function (hostData, key) {
                    switch (key) {
                        case 'theme':
                            hostData['class'] = hostData['class'] || {};
                            hostData['class'] = Object.assign(hostData['class'], createThemedClasses(instance.mode, instance.color, hostMeta['theme']));
                    }
                    return hostData;
                }, vnodeHostData || {});
            }
            // looks like we've got child nodes to render into this host element
            // or we need to update the css class/attrs on the host element
            // if we haven't already created a vnode, then we give the renderer the actual element
            // if this is a re-render, then give the renderer the last vnode we already created
            var oldVNode = elm._vnode || new VNode();
            oldVNode.elm = elm;
            // each patch always gets a new vnode
            // the host element itself isn't patched because it already exists
            // kick off the actual render and any DOM updates
            elm._vnode = plt.render(oldVNode, h(null, vnodeHostData, vnodeChildren), isUpdateRender, elm._hostContentNodes, cmpMeta.encapsulation);
            // attach the styles this component needs, if any
            // this fn figures out if the styles should go in a
            // shadow root or if they should be global
            plt.attachStyles(cmpMeta, instance.mode, elm);
        }
        // it's official, this element has rendered
        elm.$rendered = true;
        if (elm.$onRender) {
            // ok, so turns out there are some child host elements
            // waiting on this parent element to load
            // let's fire off all update callbacks waiting
            elm.$onRender.forEach(function (cb) {
                cb();
            });
            delete elm.$onRender;
        }
    }

    function queueUpdate(plt, elm) {
        // only run patch if it isn't queued already
        if (!elm._isQueuedForUpdate) {
            elm._isQueuedForUpdate = true;
            // run the patch in the next tick
            plt.queue.add(function queueUpdateNextTick() {
                // no longer queued
                elm._isQueuedForUpdate = false;
                // vdom diff and patch the host element for differences
                update(plt, elm);
            });
        }
    }
    function update(plt, elm) {
        // everything is async, so somehow we could have already disconnected
        // this node, so be sure to do nothing if we've already disconnected
        if (!elm._hasDestroyed) {
            var isInitialLoad = !elm.$instance;
            var userPromise = void 0;
            if (isInitialLoad) {
                var ancestorHostElement = elm._ancestorHostElement;
                if (ancestorHostElement && !ancestorHostElement.$rendered) {
                    // this is the intial load
                    // this element has an ancestor host element
                    // but the ancestor host element has NOT rendered yet
                    // so let's just cool our jets and wait for the ancestor to render
                    (ancestorHostElement.$onRender = ancestorHostElement.$onRender || []).push(function () {
                        // this will get fired off when the ancestor host element
                        // finally gets around to rendering its lazy self
                        update(plt, elm);
                    });
                    return;
                }
                // haven't created a component instance for this host element yet!
                // create the instance from the user's component class
                // https://www.youtube.com/watch?v=olLxrojmvMg
                initComponentInstance(plt, elm);
                // fire off the user's componentWillLoad method (if one was provided)
                // componentWillLoad only runs ONCE, after instance's element has been
                // assigned as the host element, but BEFORE render() has been called
                try {
                    if (elm.$instance.componentWillLoad) {
                        userPromise = elm.$instance.componentWillLoad();
                    }
                } catch (e) {
                    plt.onError(e, 3 /* WillLoadError */, elm);
                }
            } else {
                // already created an instance and this is an update
                // fire off the user's componentWillUpdate method (if one was provided)
                // componentWillUpdate runs BEFORE render() has been called
                // but only BEFORE an UPDATE and not before the intial render
                // get the returned promise (if one was provided)
                try {
                    if (elm.$instance.componentWillUpdate) {
                        userPromise = elm.$instance.componentWillUpdate();
                    }
                } catch (e) {
                    plt.onError(e, 5 /* WillUpdateError */, elm);
                }
            }
            if (userPromise && userPromise.then) {
                // looks like the user return a promise!
                // let's not actually kick off the render
                // until the user has resolved their promise
                userPromise.then(function () {
                    return renderUpdate(plt, elm, isInitialLoad);
                });
            } else {
                // user never returned a promise so there's
                // no need to wait on anything, let's do the render now my friend
                renderUpdate(plt, elm, isInitialLoad);
            }
        }
    }
    function renderUpdate(plt, elm, isInitialLoad) {
        // if this component has a render function, let's fire
        // it off and generate a vnode for this
        try {
            render(plt, elm, plt.getComponentMeta(elm), !isInitialLoad);
            // _hasRendered was just set
            // _onRenderCallbacks were all just fired off
        } catch (e) {
            plt.onError(e, 8 /* RenderError */, elm, true);
        }
        try {
            if (isInitialLoad) {
                // so this was the initial load i guess
                elm.$initLoad();
                // componentDidLoad just fired off
            } else {
                // fire off the user's componentDidUpdate method (if one was provided)
                // componentDidUpdate runs AFTER render() has been called
                // but only AFTER an UPDATE and not after the intial render
                elm.$instance.componentDidUpdate && elm.$instance.componentDidUpdate();
            }
        } catch (e) {
            // derp
            plt.onError(e, 6 /* DidUpdateError */, elm, true);
        }
    }

    function connectedCallback(plt, cmpMeta, elm) {
        // do not reconnect if we've already created an instance for this element
        if (!elm.$connected) {
            // first time we've connected
            elm.$connected = true;
            // if somehow this node was reused, ensure we've removed this property
            delete elm._hasDestroyed;
            // initialize our event listeners on the host element
            // we do this now so that we can listening to events that may
            // have fired even before the instance is ready
            initElementListeners(plt, elm);
            // register this component as an actively
            // loading child to its parent component
            registerWithParentComponent(plt, elm);
            // add to the queue to load the bundle
            // it's important to have an async tick in here so we can
            // ensure the "mode" attribute has been added to the element
            // place in high priority since it's not much work and we need
            // to know as fast as possible, but still an async tick in between
            plt.queue.add(function () {
                // only collects slot references if this component even has slots
                plt.connectHostElement(cmpMeta, elm);
                // start loading this component mode's bundle
                // if it's already loaded then the callback will be synchronous
                plt.loadBundle(cmpMeta, elm, function () {
                    // we've fully loaded the component mode data
                    // let's queue it up to be rendered next
                    queueUpdate(plt, elm);
                });
            }, 3 /* High */);
        }
    }
    function registerWithParentComponent(plt, elm) {
        // find the first ancestor host element (if there is one) and register
        // this element as one of the actively loading child elements for its ancestor
        var ancestorHostElement = elm;
        while (ancestorHostElement = getParentElement(ancestorHostElement)) {
            // climb up the ancestors looking for the first registered component
            if (plt.isDefinedComponent(ancestorHostElement)) {
                // we found this elements the first ancestor host element
                // if the ancestor already loaded then do nothing, it's too late
                if (!ancestorHostElement._hasLoaded) {
                    // keep a reference to this element's ancestor host element
                    elm._ancestorHostElement = ancestorHostElement;
                    // ensure there is an array to contain a reference to each of the child elements
                    // and set this element as one of the ancestor's child elements it should wait on
                    (ancestorHostElement.$activeLoading = ancestorHostElement.$activeLoading || []).push(elm);
                }
                break;
            }
        }
    }

    function disconnectedCallback(plt, elm) {
        // only disconnect if we're not temporarily disconnected
        // tmpDisconnected will happen when slot nodes are being relocated
        if (!plt.tmpDisconnected && isDisconnected(elm)) {
            // ok, let's officially destroy this thing
            // set this to true so that any of our pending async stuff
            // doesn't continue since we already decided to destroy this node
            elm._hasDestroyed = true;
            // double check that we've informed the ancestor host elements
            // that they're good to go and loaded (cuz this one is on its way out)
            propagateElementLoaded(elm);
            callNodeRefs(elm._vnode, true);
            // detatch any event listeners that may have been added
            // this will also set _listeners to null if there are any
            detachListeners(elm);
            if (elm._hostContentNodes) {
                // overreacting here just to reduce any memory leak issues
                elm._hostContentNodes = elm._hostContentNodes.defaultSlot = elm._hostContentNodes.namedSlots = null;
            }
            // call instance Did Unload and destroy instance stuff
            // if we've created an instance for this
            var instance = elm.$instance;
            if (instance) {
                // call the user's componentDidUnload if there is one
                instance.componentDidUnload && instance.componentDidUnload();
                elm.$instance = instance.__el = null;
            }
            // fuhgeddaboudit
            // set it all to null to ensure we forget references
            // and reset values incase this node gets reused somehow
            // (possible that it got disconnected, but the node was reused)
            elm.$activeLoading = elm.$connected = elm.$defaultHolder = elm._root = elm._values = elm._vnode = elm._ancestorHostElement = elm._hasLoaded = elm._isQueuedForUpdate = elm._observer = null;
        }
    }
    function isDisconnected(elm) {
        while (elm) {
            if (elm.parentElement === null) {
                return elm.tagName !== 'HTML';
            }
            elm = elm.parentElement;
        }
        return false;
    }

    function initHostConstructor(plt, cmpMeta, HostElementConstructor, hydratedCssClass) {
        // let's wire up our functions to the host element's prototype
        // we can also inject our platform into each one that needs that api
        // note: these cannot be arrow functions cuz "this" is important here hombre
        HostElementConstructor.connectedCallback = function () {
            // coolsville, our host element has just hit the DOM
            connectedCallback(plt, cmpMeta, this);
        };
        HostElementConstructor.attributeChangedCallback = function (attribName, oldVal, newVal) {
            // the browser has just informed us that an attribute
            // on the host element has changed
            attributeChangedCallback(cmpMeta, this, attribName, oldVal, newVal);
        };
        HostElementConstructor.disconnectedCallback = function () {
            // the element has left the builing
            disconnectedCallback(plt, this);
        };
        HostElementConstructor.componentOnReady = function (cb) {
            var promise = void 0;
            if (!cb) {
                promise = new Promise(function (resolve) {
                    cb = resolve;
                });
            }
            componentOnReady(this, cb);
            return promise;
        };
        HostElementConstructor.$initLoad = function () {
            initLoad(plt, this, hydratedCssClass);
        };
        // add getters/setters to the host element members
        // these would come from the @Prop and @Method decorators that
        // should create the public API to this component
        proxyHostElementPrototype(plt, cmpMeta.membersMeta, HostElementConstructor);
    }
    function componentOnReady(elm, cb) {
        if (!elm._hasDestroyed) {
            if (elm._hasLoaded) {
                cb(elm);
            } else {
                (elm._onReadyCallbacks = elm._onReadyCallbacks || []).push(cb);
            }
        }
    }

    function useShadowDom(supportsNativeShadowDom, cmpMeta) {
        return supportsNativeShadowDom && cmpMeta.encapsulation === 1 /* ShadowDom */;
    }
    function useScopedCss(supportsNativeShadowDom, cmpMeta) {
        if (cmpMeta.encapsulation === 2 /* ScopedCss */) {
                return true;
            }
        if (cmpMeta.encapsulation === 1 /* ShadowDom */ && !supportsNativeShadowDom) {
            return true;
        }
        return false;
    }

    function createPlatformClient(Context, App, win, doc, publicPath, hydratedCssClass) {
        var registry = { 'html': {} };
        var moduleImports = {};
        var bundleCallbacks = {};
        var loadedBundles = {};
        var styleTemplates = {};
        var pendingBundleRequests = {};
        var controllerComponents = {};
        var domApi = createDomApi(doc);
        var now = function () {
            return win.performance.now();
        };
        // initialize Core global object
        Context.dom = createDomControllerClient(win, now);
        Context.addListener = function addListener(elm, eventName, cb, opts) {
            return addEventListener(plt, elm, eventName, cb, opts && opts.capture, opts && opts.passive);
        };
        Context.enableListener = function enableListener(instance, eventName, enabled, attachTo) {
            enableEventListener(plt, instance, eventName, enabled, attachTo);
        };
        Context.emit = function emitEvent(elm, eventName, data) {
            elm && elm.dispatchEvent(new WindowCustomEvent(Context.eventNameFn ? Context.eventNameFn(eventName) : eventName, data));
        };
        Context.isClient = true;
        Context.isServer = Context.isPrerender = false;
        Context.window = win;
        Context.location = win.location;
        Context.document = doc;
        // keep a global set of tags we've already defined
        var globalDefined = win.definedComponents = win.definedComponents || [];
        // create the platform api which is used throughout common core code
        var plt = {
            registerComponents: registerComponents,
            defineComponent: defineComponent,
            isDefinedComponent: isDefinedComponent,
            getComponentMeta: getComponentMeta,
            propConnect: propConnect,
            getContextItem: getContextItem,
            loadBundle: loadBundle,
            queue: createQueueClient(Context.dom, now),
            connectHostElement: connectHostElement,
            attachStyles: attachStyles,
            emitEvent: Context.emit,
            getEventOptions: getEventOptions,
            onError: onError,
            isClient: true
        };
        var supportsNativeShadowDom = !!Element.prototype.attachShadow;
        // create the renderer that will be used
        plt.render = createRendererPatch(plt, domApi, supportsNativeShadowDom);
        // setup the root element which is the mighty <html> tag
        // the <html> has the final say of when the app has loaded
        var rootElm = domApi.$documentElement;
        rootElm.$rendered = true;
        rootElm.$activeLoading = [];
        rootElm.$initLoad = function () {
            // this will fire when all components have finished loaded
            rootElm._hasLoaded = true;
        };
        // if the HTML was generated from SSR
        // then let's walk the tree and generate vnodes out of the data
        createVNodesFromSsr(domApi, rootElm);
        function getComponentMeta(elm) {
            // get component meta using the element
            // important that the registry has upper case tag names
            return registry[elm.tagName.toLowerCase()];
        }
        function connectHostElement(cmpMeta, elm) {
            // set the "mode" property
            if (!elm.mode) {
                // looks like mode wasn't set as a property directly yet
                // first check if there's an attribute
                // next check the app's global
                elm.mode = domApi.$getAttribute(elm, 'mode') || Context.mode;
            }
            // host element has been connected to the DOM
            if (!domApi.$getAttribute(elm, SSR_VNODE_ID) && !useShadowDom(supportsNativeShadowDom, cmpMeta)) {
                // only required when we're not using native shadow dom (slot)
                // this host element was NOT created with SSR
                // let's pick out the inner content for slot projection
                assignHostContentSlots(domApi, elm, cmpMeta.slotMeta);
            }
            if (!supportsNativeShadowDom && cmpMeta.encapsulation === 1 /* ShadowDom */) {
                    // this component should use shadow dom
                    // but this browser doesn't support it
                    // so let's polyfill a few things for the user
                    elm.shadowRoot = elm;
                }
        }
        function registerComponents(components) {
            // this is the part that just registers the minimal amount of data
            // it's basically a map of the component tag name to its associated external bundles
            return (components || []).map(function (data) {
                return parseComponentLoaders(data, registry);
            });
        }
        function defineComponent(cmpMeta, HostElementConstructor) {
            var tagName = cmpMeta.tagNameMeta;
            if (globalDefined.indexOf(tagName) === -1) {
                // keep an array of all the defined components, useful for external frameworks
                globalDefined.push(tagName);
                // initialize the members on the host element prototype
                initHostConstructor(plt, cmpMeta, HostElementConstructor.prototype, hydratedCssClass);
                // add which attributes should be observed
                var observedAttributes = [];
                // at this point the membersMeta only includes attributes which should
                // be observed, it does not include all props yet, so it's safe to
                // loop through all of the props (attrs) and observed them
                for (var propName in cmpMeta.membersMeta) {
                    // initialize the actual attribute name used vs. the prop name
                    // for example, "myProp" would be "my-prop" as an attribute
                    // and these can be configured to be all lower case or dash case (default)
                    if (cmpMeta.membersMeta[propName].attribName) {
                        observedAttributes.push(
                        // dynamically generate the attribute name from the prop name
                        // also add it to our array of attributes we need to observe
                        cmpMeta.membersMeta[propName].attribName);
                    }
                }
                // set the array of all the attributes to keep an eye on
                // https://www.youtube.com/watch?v=RBs21CFBALI
                HostElementConstructor.observedAttributes = observedAttributes;
                // define the custom element
                win.customElements.define(tagName, HostElementConstructor);
            }
        }
        function isDefinedComponent(elm) {
            // check if this component is already defined or not
            return globalDefined.indexOf(elm.tagName.toLowerCase()) > -1 || !!getComponentMeta(elm);
        }
        App.loadComponents = function loadComponents(bundleId, importFn) {
            // https://youtu.be/Z-FPimCmbX8?t=31
            // jsonp tag team callback from requested bundles contain tags
            var args = arguments;
            // import component function
            // inject globals
            importFn(moduleImports, h, t, Context, publicPath);
            for (var i = 2; i < args.length; i++) {
                // parse the external component data into internal component meta data
                parseComponentMeta(registry, moduleImports, args[i]);
            }
            // fire off all the callbacks waiting on this bundle to load
            var callbacks = bundleCallbacks[bundleId];
            if (callbacks) {
                for (i = 0; i < callbacks.length; i++) {
                    callbacks[i]();
                }
                delete bundleCallbacks[bundleId];
            }
            // remember that we've already loaded this bundle
            loadedBundles[bundleId] = true;
        };
        App.loadStyles = function loadStyles() {
            // jsonp callback from requested bundles
            // either directly add styles to document.head or add the
            // styles to a template tag to be cloned later for shadow roots
            var args = arguments;
            var templateElm = void 0;
            for (var i = 0; i < args.length; i += 2) {
                // create the template element which will hold the styles
                // adding it to the dom via <template> so that we can
                // clone this for each potential shadow root that will need these styles
                // otherwise it'll be cloned and added to the entire document
                // but that's for the renderer to figure out later
                styleTemplates[args[i]] = templateElm = domApi.$createElement('template');
                // add the style text to the template element
                templateElm.innerHTML = '<style>' + args[i + 1] + '</style>';
                // give it an unique id
                templateElm.id = 'tmp-' + args[i];
                // add our new element to the head
                domApi.$appendChild(domApi.$head, templateElm);
            }
        };
        function loadBundle(cmpMeta, elm, cb) {
            var bundleId = cmpMeta.bundleIds[elm.mode] || cmpMeta.bundleIds;
            if (loadedBundles[bundleId]) {
                // sweet, we've already loaded this bundle
                cb();
            } else {
                // never seen this bundle before, let's start the request
                // and add it to the callbacks to fire when it has loaded
                (bundleCallbacks[bundleId] = bundleCallbacks[bundleId] || []).push(cb);
                // figure out which bundle to request and kick it off
                requestBundle(cmpMeta, bundleId);
            }
        }
        function requestBundle(cmpMeta, bundleId) {
            // create the url we'll be requesting
            var url = publicPath + bundleId + ((useScopedCss(supportsNativeShadowDom, cmpMeta) ? '.sc' : '') + '.js');
            if (pendingBundleRequests[url]) {
                // we're already actively requesting this url
                // no need to do another request
                return;
            }
            // let's kick off the bundle request
            // remember that we're now actively requesting this url
            pendingBundleRequests[url] = true;
            // create a sript element to add to the document.head
            var scriptElm = domApi.$createElement('script');
            scriptElm.charset = 'utf-8';
            scriptElm.async = true;
            scriptElm.src = url;
            // create a fallback timeout if something goes wrong
            var tmrId = setTimeout(onScriptComplete, 120000);
            function onScriptComplete() {
                clearTimeout(tmrId);
                scriptElm.onerror = scriptElm.onload = null;
                domApi.$removeChild(scriptElm.parentNode, scriptElm);
                // remove from our list of active requests
                delete pendingBundleRequests[url];
            }
            // add script completed listener to this script element
            scriptElm.onerror = scriptElm.onload = onScriptComplete;
            // inject a script tag in the head
            // kick off the actual request
            domApi.$appendChild(domApi.$head, scriptElm);
        }
        function attachStyles(cmpMeta, modeName, elm) {
            var templateElm = styleTemplates[cmpMeta.tagNameMeta + '_' + modeName] || styleTemplates[cmpMeta.tagNameMeta];
            if (templateElm) {
                var styleContainerNode = domApi.$head;
                if (supportsNativeShadowDom) {
                    if (cmpMeta.encapsulation === 1 /* ShadowDom */) {
                            styleContainerNode = elm.shadowRoot;
                        } else {
                        while (elm = domApi.$parentNode(elm)) {
                            if (elm.host && elm.host.shadowRoot) {
                                styleContainerNode = elm.host.shadowRoot;
                                break;
                            }
                        }
                    }
                }
                var appliedStyles = styleContainerNode._appliedStyles = styleContainerNode._appliedStyles || {};
                if (!appliedStyles[templateElm.id]) {
                    // we haven't added these styles to this element yet
                    var styleElm = templateElm.content.cloneNode(true);
                    var insertReferenceNode = styleContainerNode.querySelector('[data-visibility]');
                    domApi.$insertBefore(styleContainerNode, styleElm, insertReferenceNode && insertReferenceNode.nextSibling || styleContainerNode.firstChild);
                    // remember we don't need to do this again for this element
                    appliedStyles[templateElm.id] = true;
                }
            }
        }
        var WindowCustomEvent = win.CustomEvent;
        if (typeof WindowCustomEvent !== 'function') {
            // CustomEvent polyfill
            WindowCustomEvent = function CustomEvent(event, data) {
                var evt = domApi.$createEvent();
                evt.initCustomEvent(event, data.bubbles, data.cancelable, data.detail);
                return evt;
            };
            WindowCustomEvent.prototype = win.Event.prototype;
        }
        // test if this browser supports event options or not
        var supportsEventOptions = false;
        try {
            win.addEventListener('eopt', null, Object.defineProperty({}, 'passive', {
                get: function () {
                    supportsEventOptions = true;
                }
            }));
        } catch (e) {}
        function getEventOptions(useCapture, usePassive) {
            return supportsEventOptions ? {
                capture: !!useCapture,
                passive: !!usePassive
            } : !!useCapture;
        }
        function onError(err, type, elm) {
            console.error(err, type, elm && elm.tagName);
        }
        function propConnect(ctrlTag) {
            return proxyController(domApi, controllerComponents, ctrlTag);
        }
        function getContextItem(contextKey) {
            return Context[contextKey];
        }
        return plt;
    }

    var App = window[appNamespace] = window[appNamespace] || {};
    var plt = createPlatformClient(Context, App, window, document, publicPath, hydratedCssClass);
    plt.registerComponents(App.components).forEach(function (cmpMeta) {
        plt.defineComponent(cmpMeta, class HostElement extends HTMLElement {});
    });
})(window, document, Context, appNamespace, publicPath);
})({},"App","hydrated","/build/app/");