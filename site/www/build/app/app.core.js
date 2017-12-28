/*! Built with http://stenciljs.com */
(function(Context,appNamespace,hydratedCssClass,publicPath){"use strict";
var s=document.querySelector("script[data-namespace='app']");if(s){publicPath=s.getAttribute('data-path');}
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
(function(window, document, Context, appNamespace, publicPath) {
  'use strict';
  function assignHostContentSlots(domApi, cmpMeta, elm, childNodes) {
    // compiler has already figured out if this component has slots or not
    // if the component doesn't even have slots then we'll skip over all of this code
    if (cmpMeta.slotMeta) {
      // looks like this component has slots
      // so let's loop through each of the childNodes to the host element
      // and pick out the ones that have a slot attribute
      // if it doesn't have a slot attribute, than it's a default slot
      elm.$defaultHolder || // create a comment to represent where the original
      // content was first placed, which is useful later on
      domApi.$insertBefore(elm, elm.$defaultHolder = domApi.$createComment(''), childNodes[0]);
      let slotName;
      let defaultSlot;
      let namedSlots;
      let i = 0;
      for (;i < childNodes.length; i++) {
        var childNode = childNodes[i];
        if (1 === domApi.$nodeType(childNode) && null != (slotName = domApi.$getAttribute(childNode, 'slot'))) {
          // is element node
          // this element has a slot name attribute
          // so this element will end up getting relocated into
          // the component's named slot once it renders
          namedSlots = namedSlots || {};
          namedSlots[slotName] ? namedSlots[slotName].push(childNode) : namedSlots[slotName] = [ childNode ];
        } else {
          // this is a text node
          // or it's an element node that doesn't have a slot attribute
          // let's add this node to our collection for the default slot
          defaultSlot ? defaultSlot.push(childNode) : defaultSlot = [ childNode ];
        }
      }
      // keep a reference to all of the initial nodes
      // found as immediate childNodes to the host element
      elm._hostContentNodes = {
        defaultSlot: defaultSlot,
        namedSlots: namedSlots
      };
    }
  }
  /**
     * SSR Attribute Names
     */
  const SSR_VNODE_ID = 'data-ssrv';
  /**
     * Default style mode id
     */
  /**
     * Reusable empty obj/array
     * Don't add values to these!!
     */
  const EMPTY_OBJ = {};
  const EMPTY_ARR = [];
  /**
     * Key Name to Key Code Map
     */
  const KEY_CODE_MAP = {
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
  const isDef = v => void 0 !== v && null !== v;
  const isUndef = v => void 0 === v || null === v;
  const toLowerCase = str => str.toLowerCase();
  const toDashCase = str => str.replace(/([A-Z])/g, g => ' ' + toLowerCase(g[0])).trim().replace(/ /g, '-');
  const noop = () => {};
  function createDomApi(win, doc, WindowCustomEvent) {
    // using the $ prefix so that closure is
    // cool with property renaming each of these
    const unregisterListenerFns = new WeakMap();
    const domApi = {
      $documentElement: doc.documentElement,
      $head: doc.head,
      $body: doc.body,
      $nodeType: node => node.nodeType,
      $createElement: tagName => doc.createElement(tagName),
      $createElementNS: (namespace, tagName) => doc.createElementNS(namespace, tagName),
      $createTextNode: text => doc.createTextNode(text),
      $createComment: data => doc.createComment(data),
      $insertBefore: (parentNode, childNode, referenceNode) => parentNode.insertBefore(childNode, referenceNode),
      $removeChild: (parentNode, childNode) => parentNode.removeChild(childNode),
      $appendChild: (parentNode, childNode) => parentNode.appendChild(childNode),
      $childNodes: node => node.childNodes,
      $parentNode: node => node.parentNode,
      $nextSibling: node => node.nextSibling,
      $tagName: elm => toLowerCase(elm.tagName),
      $getTextContent: node => node.textContent,
      $setTextContent: (node, text) => node.textContent = text,
      $getAttribute: (elm, key) => elm.getAttribute(key),
      $setAttribute: (elm, key, val) => elm.setAttribute(key, val),
      $setAttributeNS: (elm, namespaceURI, qualifiedName, val) => elm.setAttributeNS(namespaceURI, qualifiedName, val),
      $removeAttribute: (elm, key) => elm.removeAttribute(key),
      $elementRef: (elm, referenceName) => {
        if ('child' === referenceName) {
          return elm.firstElementChild;
        }
        if ('parent' === referenceName) {
          return domApi.$parentElement(elm);
        }
        if ('body' === referenceName) {
          return domApi.$body;
        }
        if ('document' === referenceName) {
          return doc;
        }
        if ('window' === referenceName) {
          return win;
        }
        return elm;
      },
      $addEventListener: (assignerElm, eventName, listenerCallback, useCapture, usePassive, attachTo, eventListenerOpts, splt) => {
        // remember the original name before we possibly change it
        const assignersEventName = eventName;
        let attachToElm = assignerElm;
        // get the existing unregister listeners for
        // this element from the unregister listeners weakmap
        let assignersUnregListeners = unregisterListenerFns.get(assignerElm);
        assignersUnregListeners && assignersUnregListeners[assignersEventName] && // removed any existing listeners for this event for the assigner element
        // this element already has this listener, so let's unregister it now
        assignersUnregListeners[assignersEventName]();
        if ('string' === typeof attachTo) {
          // attachTo is a string, and is probably something like
          // "parent", "window", or "document"
          // and the eventName would be like "mouseover" or "mousemove"
          attachToElm = domApi.$elementRef(assignerElm, attachTo);
        } else if ('object' === typeof attachTo) {
          // we were passed in an actual element to attach to
          attachToElm = attachTo;
        } else {
          // depending on the event name, we could actually be attaching
          // this element to something like the document or window
          splt = eventName.split(':');
          if (splt.length > 1) {
            // document:mousemove
            // parent:touchend
            // body:keyup.enter
            attachToElm = domApi.$elementRef(assignerElm, splt[0]);
            eventName = splt[1];
          }
        }
        if (!attachToElm) {
          // somehow we're referencing an element that doesn't exist
          // let's not continue
          return;
        }
        let eventListener = listenerCallback;
        // test to see if we're looking for an exact keycode
        splt = eventName.split('.');
        if (splt.length > 1) {
          // looks like this listener is also looking for a keycode
          // keyup.enter
          eventName = splt[0];
          eventListener = (ev => {
            // wrap the user's event listener with our own check to test
            // if this keyboard event has the keycode they're looking for
            ev.keyCode === KEY_CODE_MAP[splt[1]] && listenerCallback(ev);
          });
        }
        // create the actual event listener options to use
        // this browser may not support event options
        eventListenerOpts = domApi.$supportsEventOptions ? {
          capture: !!useCapture,
          passive: !!usePassive
        } : !!useCapture;
        // ok, good to go, let's add the actual listener to the dom element
        attachToElm.addEventListener(eventName, eventListener, eventListenerOpts);
        assignersUnregListeners || // we don't already have a collection, let's create it
        unregisterListenerFns.set(assignerElm, assignersUnregListeners = {});
        // add the unregister listener to this element's collection
        assignersUnregListeners[assignersEventName] = (() => {
          // looks like it's time to say goodbye
          attachToElm && attachToElm.removeEventListener(eventName, eventListener, eventListenerOpts);
          assignersUnregListeners[assignersEventName] = null;
        });
      },
      $removeEventListener: (elm, eventName) => {
        // get the unregister listener functions for this element
        const assignersUnregListeners = unregisterListenerFns.get(elm);
        if (assignersUnregListeners) {
          // this element has unregister listeners
          if (eventName) {
            // passed in one specific event name to remove
            assignersUnregListeners[eventName] && assignersUnregListeners[eventName]();
          } else {
            // remove all event listeners
            Object.keys(assignersUnregListeners).forEach(assignersEventName => {
              assignersUnregListeners[assignersEventName] && assignersUnregListeners[assignersEventName]();
            });
            // sure it's weakmap, but we're here, so let's just delete it now
            unregisterListenerFns.delete(elm);
          }
        }
      }
    };
    domApi.$parentElement = ((elm, parentNode) => {
      // if the parent node is a document fragment (shadow root)
      // then use the "host" property on it
      // otherwise use the parent node
      parentNode = domApi.$parentNode(elm);
      return parentNode && 11 === domApi.$nodeType(parentNode) ? parentNode.host : parentNode;
    });
    return domApi;
  }
  function updateElement(plt, oldVnode, newVnode, isSvgMode, name) {
    // if the element passed in is a shadow root, which is a document fragment
    // then we want to be adding attrs/props to the shadow root's "host" element
    // if it's not a shadow root, then we add attrs/props to the same element
    const elm = 11 === newVnode.elm.nodeType && newVnode.elm.host ? newVnode.elm.host : newVnode.elm;
    const oldVnodeAttrs = oldVnode && oldVnode.vattrs || EMPTY_OBJ;
    const newVnodeAttrs = newVnode.vattrs || EMPTY_OBJ;
    // remove attributes no longer present on the vnode by setting them to undefined
    for (name in oldVnodeAttrs) {
      newVnodeAttrs && null != newVnodeAttrs[name] || null == oldVnodeAttrs[name] || setAccessor(plt, elm, name, oldVnodeAttrs[name], void 0, isSvgMode);
    }
    // add new & update changed attributes
    for (name in newVnodeAttrs) {
      name in oldVnodeAttrs && newVnodeAttrs[name] === ('value' === name || 'checked' === name ? elm[name] : oldVnodeAttrs[name]) || setAccessor(plt, elm, name, oldVnodeAttrs[name], newVnodeAttrs[name], isSvgMode);
    }
  }
  function setAccessor(plt, elm, name, oldValue, newValue, isSvg, i, ilen) {
    if ('class' !== name || isSvg) {
      if ('style' === name) {
        // Style
        oldValue = oldValue || EMPTY_OBJ;
        newValue = newValue || EMPTY_OBJ;
        for (i in oldValue) {
          newValue[i] || (elm.style[i] = '');
        }
        for (i in newValue) {
          newValue[i] !== oldValue[i] && (elm.style[i] = newValue[i]);
        }
      } else if ('o' !== name[0] || 'n' !== name[1] || name in elm) {
        if ('list' !== name && 'type' !== name && !isSvg && (name in elm || -1 !== [ 'object', 'function' ].indexOf(typeof newValue) && null !== newValue)) {
          // Properties
          // - list and type are attributes that get applied as values on the element
          // - all svgs get values as attributes not props
          // - check if elm contains name or if the value is array, object, or function
          const cmpMeta = plt.getComponentMeta(elm);
          if (cmpMeta && cmpMeta.membersMeta && name in cmpMeta.membersMeta) {
            // setting a known @Prop on this element
            setProperty(elm, name, newValue);
          } else if ('ref' !== name) {
            // property setting a prop on a native property, like "value" or something
            setProperty(elm, name, null == newValue ? '' : newValue);
            null != newValue && false !== newValue || elm.removeAttribute(name);
          }
        } else if (null != newValue) {
          // Element Attributes
          i = name !== (name = name.replace(/^xlink\:?/, ''));
          1 !== BOOLEAN_ATTRS[name] || newValue && 'false' !== newValue ? 'function' !== typeof newValue && (i ? elm.setAttributeNS(XLINK_NS$1, toLowerCase(name), newValue) : elm.setAttribute(name, newValue)) : i ? elm.removeAttributeNS(XLINK_NS$1, toLowerCase(name)) : elm.removeAttribute(name);
        }
      } else {
        // Event Handlers
        // adding an standard event listener, like <button onClick=...> or something
        name = toLowerCase(name.substring(2));
        newValue ? oldValue || // add listener
        plt.domApi.$addEventListener(elm, name, newValue) : // remove listener
        plt.domApi.$removeEventListener(elm, name);
      }
    } else // Class
    if (oldValue !== newValue) {
      const oldList = null == oldValue || '' === oldValue ? EMPTY_ARR : oldValue.trim().split(/\s+/);
      const newList = null == newValue || '' === newValue ? EMPTY_ARR : newValue.trim().split(/\s+/);
      let classList = null == elm.className || '' === elm.className ? EMPTY_ARR : elm.className.trim().split(/\s+/);
      for (i = 0, ilen = oldList.length; i < ilen; i++) {
        -1 === newList.indexOf(oldList[i]) && (classList = classList.filter(c => c !== oldList[i]));
      }
      for (i = 0, ilen = newList.length; i < ilen; i++) {
        -1 === oldList.indexOf(newList[i]) && (classList = [ ...classList, newList[i] ]);
      }
      elm.className = classList.join(' ');
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
  const BOOLEAN_ATTRS = {
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
  const XLINK_NS$1 = 'http://www.w3.org/1999/xlink';
  /**
     * Virtual DOM patching algorithm based on Snabbdom by
     * Simon Friis Vindum (@paldepind)
     * Licensed under the MIT License
     * https://github.com/snabbdom/snabbdom/blob/master/LICENSE
     *
     * Modified for Stencil's renderer and slot projection
     */
  let isSvgMode = false;
  function createRendererPatch(plt, domApi) {
    // createRenderer() is only created once per app
    // the patch() function which createRenderer() returned is the function
    // which gets called numerous times by each component
    function createElm(vnode, parentElm, childIndex) {
      let i = 0;
      'function' === typeof vnode.vtag && (vnode = vnode.vtag(Object.assign({}, vnode.vattrs, {
        children: vnode.vchildren
      })));
      if ('slot' === vnode.vtag && !useNativeShadowDom) {
        if (hostContentNodes) {
          scopeId && domApi.$setAttribute(parentElm, scopeId + '-slot', '');
          // special case for manually relocating host content nodes
          // to their new home in either a named slot or the default slot
          let namedSlot = vnode.vattrs && vnode.vattrs.name;
          let slotNodes;
          // this vnode is a named slot
          slotNodes = isDef(namedSlot) ? hostContentNodes.namedSlots && hostContentNodes.namedSlots[namedSlot] : hostContentNodes.defaultSlot;
          if (isDef(slotNodes)) {
            // the host element has some nodes that need to be moved around
            // we have a slot for the user's vnode to go into
            // while we're moving nodes around, temporarily disable
            // the disconnectCallback from working
            plt.tmpDisconnected = true;
            for (;i < slotNodes.length; i++) {
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
        const elm = vnode.elm = isSvgMode || 'svg' === vnode.vtag ? domApi.$createElementNS('http://www.w3.org/2000/svg', vnode.vtag) : domApi.$createElement(vnode.vtag);
        isSvgMode = 'svg' === vnode.vtag || 'foreignObject' !== vnode.vtag && isSvgMode;
        // add css classes, attrs, props, listeners, etc.
        updateElement(plt, null, vnode, isSvgMode);
        null !== scopeId && elm._scopeId !== scopeId && // if there is a scopeId and this is the initial render
        // then let's add the scopeId as an attribute
        domApi.$setAttribute(elm, elm._scopeId = scopeId, '');
        const children = vnode.vchildren;
        if (children) {
          let childNode;
          for (;i < children.length; ++i) {
            // create the node
            childNode = createElm(children[i], elm, i);
            // return node could have been null
            childNode && // append our new node
            domApi.$appendChild(elm, childNode);
          }
        }
      }
      return vnode.elm;
    }
    function addVnodes(parentElm, before, vnodes, startIdx, endIdx) {
      const containerElm = parentElm.$defaultHolder && domApi.$parentNode(parentElm.$defaultHolder) || parentElm;
      let childNode;
      for (;startIdx <= endIdx; ++startIdx) {
        var vnodeChild = vnodes[startIdx];
        if (isDef(vnodeChild)) {
          childNode = isDef(vnodeChild.vtext) ? domApi.$createTextNode(vnodeChild.vtext) : createElm(vnodeChild, parentElm, startIdx);
          if (isDef(childNode)) {
            vnodeChild.elm = childNode;
            domApi.$insertBefore(containerElm, childNode, before);
          }
        }
      }
    }
    function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
      for (;startIdx <= endIdx; ++startIdx) {
        isDef(vnodes[startIdx]) && domApi.$removeChild(parentElm, vnodes[startIdx].elm);
      }
    }
    function updateChildren(parentElm, oldCh, newCh) {
      let oldStartIdx = 0, newStartIdx = 0;
      let oldEndIdx = oldCh.length - 1;
      let oldStartVnode = oldCh[0];
      let oldEndVnode = oldCh[oldEndIdx];
      let newEndIdx = newCh.length - 1;
      let newStartVnode = newCh[0];
      let newEndVnode = newCh[newEndIdx];
      let oldKeyToIdx;
      let idxInOld;
      let elmToMove;
      let node;
      while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (null == oldStartVnode) {
          oldStartVnode = oldCh[++oldStartIdx];
        } else if (null == oldEndVnode) {
          oldEndVnode = oldCh[--oldEndIdx];
        } else if (null == newStartVnode) {
          newStartVnode = newCh[++newStartIdx];
        } else if (null == newEndVnode) {
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
          isUndef(oldKeyToIdx) && (oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx));
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
              oldCh[idxInOld] = void 0;
              node = elmToMove.elm;
            }
            newStartVnode = newCh[++newStartIdx];
          }
          node && domApi.$insertBefore(parentElm, node, oldStartVnode.elm);
        }
      }
      oldStartIdx > oldEndIdx ? addVnodes(parentElm, null == newCh[newEndIdx + 1] ? null : newCh[newEndIdx + 1].elm, newCh, newStartIdx, newEndIdx) : newStartIdx > newEndIdx && removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
    function isSameVnode(vnode1, vnode2) {
      // compare if two vnode to see if they're "technically" the same
      // need to have the same element tag, and same key to be the same
      return vnode1.vtag === vnode2.vtag && vnode1.vkey === vnode2.vkey;
    }
    function createKeyToOldIdx(children, beginIdx, endIdx) {
      let i, key, ch, map = {};
      for (i = beginIdx; i <= endIdx; ++i) {
        ch = children[i];
        if (null != ch) {
          key = ch.vkey;
          void 0 !== key && (map.k = i);
        }
      }
      return map;
    }
    function patchVNode(oldVNode, newVNode) {
      const elm = newVNode.elm = oldVNode.elm;
      const oldChildren = oldVNode.vchildren;
      const newChildren = newVNode.vchildren;
      isSvgMode = newVNode.elm && null != newVNode.elm.parentElement && void 0 !== newVNode.elm.ownerSVGElement;
      isSvgMode = 'svg' === newVNode.vtag || 'foreignObject' !== newVNode.vtag && isSvgMode;
      if (isUndef(newVNode.vtext)) {
        // element node
        'slot' !== newVNode.vtag && // either this is the first render of an element OR it's an update
        // AND we already know it's possible it could have changed
        // this updates the element's css classes, attrs, props, listeners, etc.
        updateElement(plt, oldVNode, newVNode, isSvgMode);
        if (isDef(oldChildren) && isDef(newChildren)) {
          // looks like there's child vnodes for both the old and new vnodes
          updateChildren(elm, oldChildren, newChildren);
        } else if (isDef(newChildren)) {
          // no old child vnodes, but there are new child vnodes to add
          isDef(oldVNode.vtext) && // the old vnode was text, so be sure to clear it out
          domApi.$setTextContent(elm, '');
          // add the new vnode children
          addVnodes(elm, null, newChildren, 0, newChildren.length - 1);
        } else {
          isDef(oldChildren) && // no new child vnodes, but there are old child vnodes to remove
          removeVnodes(elm, oldChildren, 0, oldChildren.length - 1);
        }
      } else if (elm._hostContentNodes && elm._hostContentNodes.defaultSlot) {
        // this element has slotted content
        let parentElement = elm._hostContentNodes.defaultSlot[0].parentElement;
        domApi.$setTextContent(parentElement, newVNode.vtext);
        elm._hostContentNodes.defaultSlot = [ parentElement.childNodes[0] ];
      } else {
        oldVNode.vtext !== newVNode.vtext && // update the text content for the text only vnode
        // and also only if the text is different than before
        domApi.$setTextContent(elm, newVNode.vtext);
      }
    }
    // internal variables to be reused per patch() call
    let isUpdate, hostContentNodes, useNativeShadowDom, scopeId;
    return function patch(oldVNode, newVNode, isUpdatePatch, hostElementContentNodes, encapsulation, ssrPatchId) {
      // patchVNode() is synchronous
      // so it is safe to set these variables and internally
      // the same patch() call will reference the same data
      isUpdate = isUpdatePatch;
      hostContentNodes = hostElementContentNodes;
      scopeId = 2 === encapsulation || 1 === encapsulation && !domApi.$supportsShadowDom ? 'data-' + domApi.$tagName(oldVNode.elm) : null;
      isUpdate || scopeId && // this host element should use scoped css
      // add the scope attribute to the host
      domApi.$setAttribute(oldVNode.elm, scopeId + '-host', '');
      // synchronous patch
      patchVNode(oldVNode, newVNode);
      // return our new vnode
      return newVNode;
    };
  }
  function callNodeRefs(vNode, isDestroy) {
    if (vNode) {
      vNode.vref && vNode.vref(isDestroy ? null : vNode.elm);
      vNode.vchildren && vNode.vchildren.forEach(vChild => {
        callNodeRefs(vChild, isDestroy);
      });
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
  const stack = [];
  function h(nodeName, vnodeData, child) {
    var children;
    var lastSimple = false;
    var simple = false;
    for (var i = arguments.length; i-- > 2; ) {
      stack.push(arguments[i]);
    }
    while (stack.length) {
      if ((child = stack.pop()) && void 0 !== child.pop) {
        for (i = child.length; i--; ) {
          stack.push(child[i]);
        }
      } else {
        'boolean' === typeof child && (child = null);
        (simple = 'function' !== typeof nodeName) && (null == child ? child = '' : 'number' === typeof child ? child = String(child) : 'string' !== typeof child && (simple = false));
        simple && lastSimple ? children[children.length - 1].vtext += child : void 0 === children ? children = [ simple ? t(child) : child ] : children.push(simple ? t(child) : child);
        lastSimple = simple;
      }
    }
    const vnode = new VNode();
    vnode.vtag = nodeName;
    vnode.vchildren = children;
    if (vnodeData) {
      vnode.vattrs = vnodeData;
      vnode.vkey = vnodeData.key;
      vnode.vref = vnodeData.ref;
      // normalize class / classname attributes
      vnodeData.className && (vnodeData.class = vnodeData.className);
      if ('object' === typeof vnodeData.class) {
        for (i in vnodeData.class) {
          vnodeData.class[i] && stack.push(i);
        }
        vnodeData.class = stack.join(' ');
        stack.length = 0;
      }
    }
    return vnode;
  }
  function t(textValue) {
    const vnode = new VNode();
    vnode.vtext = textValue;
    return vnode;
  }
  function createQueueClient(raf, now, resolvePending, rafPending) {
    const highPromise = Promise.resolve();
    const highPriority = [];
    const lowPriority = [];
    function doHighPriority() {
      // holy geez we need to get this stuff done and fast
      // all high priority callbacks should be fired off immediately
      while (highPriority.length > 0) {
        highPriority.shift()();
      }
      resolvePending = false;
    }
    function doWork(start) {
      start = now();
      // always run all of the high priority work if there is any
      doHighPriority();
      while (lowPriority.length > 0 && now() - start < 40) {
        lowPriority.shift()();
      }
      // check to see if we still have work to do
      (rafPending = lowPriority.length > 0) && // everyone just settle down now
      // we already don't have time to do anything in this callback
      // let's throw the next one in a requestAnimationFrame
      // so we can just simmer down for a bit
      raf(flush);
    }
    function flush(start) {
      // always run all of the high priority work if there is any
      doHighPriority();
      // always force a bunch of medium callbacks to run, but still have
      // a throttle on how many can run in a certain time
      start = 4 + now();
      while (lowPriority.length > 0 && now() < start) {
        lowPriority.shift()();
      }
      (rafPending = lowPriority.length > 0) && // still more to do yet, but we've run out of time
      // let's let this thing cool off and try again in the next ric
      raf(doWork);
    }
    return {
      add: (cb, priority) => {
        if (3 === priority) {
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
    };
  }
  function parseComponentLoaders(cmpRegistryData, registry, attr) {
    // tag name will always be lower case
    const cmpMeta = {
      tagNameMeta: cmpRegistryData[0],
      membersMeta: {
        // every component defaults to always have
        // the mode and color properties
        // but only color should observe any attribute changes
        'mode': {
          memberType: 1
        },
        'color': {
          memberType: 1,
          attribName: 'color'
        }
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
    cmpRegistryData[6] && (// parse listener meta
    cmpMeta.listenersMeta = cmpRegistryData[6].map(parseListenerData));
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
          attribName: d[2] ? 1 === attr ? toLowerCase(d[0]) : toDashCase(d[0]) : 0,
          propType: d[3],
          ctrlId: d[4]
        };
      }
    }
  }
  function parseComponentMeta(registry, moduleImports, cmpMetaData, attr) {
    // tag name will always be lowser case
    const cmpMeta = registry[cmpMetaData[0]];
    // get the component class which was added to moduleImports
    // using the tag as the key on the export object
    cmpMeta.componentModule = moduleImports[cmpMetaData[0]];
    // component members
    parseMembersData(cmpMeta, cmpMetaData[1], attr);
    // host element meta
    cmpMeta.hostMeta = cmpMetaData[2];
    // component instance events
    cmpMetaData[3] && (cmpMeta.eventsMeta = cmpMetaData[3].map(parseEventData));
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
      if (3 === propType) {
        // per the HTML spec, any string value means it is a boolean true value
        // but we'll cheat here and say that the string "false" is the boolean false
        return 'false' !== propValue && ('' === propValue || !!propValue);
      }
      if (4 === propType) {
        // force it to be a number
        return parseFloat(propValue);
      }
    }
    // not sure exactly what type we want
    // so no need to change to a different type
    return propValue;
  }
  function attributeChangedCallback(membersMeta, elm, attribName, oldVal, newVal, propName) {
    // only react if the attribute values actually changed
    if (oldVal !== newVal && membersMeta) {
      // normalize the attribute name w/ lower case
      attribName = toLowerCase(attribName);
      // using the known component meta data
      // look up to see if we have a property wired up to this attribute name
      for (propName in membersMeta) {
        if (membersMeta[propName].attribName === attribName) {
          // cool we've got a prop using this attribute name the value will
          // be a string, so let's convert it to the correct type the app wants
          // below code is ugly yes, but great minification ;)
          elm[propName] = parsePropertyValue(membersMeta[propName].propType, newVal);
          break;
        }
      }
    }
  }
  function proxyHostElementPrototype(plt, membersMeta, hostPrototype) {
    // create getters/setters on the host element prototype to represent the public API
    // the setters allows us to know when data has changed so we can re-render
    membersMeta && Object.keys(membersMeta).forEach(memberName => {
      // add getters/setters
      const memberType = membersMeta[memberName].memberType;
      1 === memberType || 2 === memberType ? // @Prop() or @Prop({ mutable: true })
      definePropertyGetterSetter(hostPrototype, memberName, function getHostElementProp() {
        // host element getter (cannot be arrow fn)
        // yup, ugly, srynotsry
        // but its creating _values if it doesn't already exist
        return (this._values = this._values || {})[memberName];
      }, function setHostElementProp(newValue) {
        // host element setter (cannot be arrow fn)
        setValue(plt, this, memberName, newValue);
      }) : 6 === memberType && // @Method()
      // add a placeholder noop value on the host element's prototype
      // incase this method gets called before setup
      definePropertyValue(hostPrototype, memberName, noop);
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
    cmpMeta.membersMeta && Object.keys(cmpMeta.membersMeta).forEach(memberName => {
      defineMember(plt, cmpMeta, elm, instance, memberName);
    });
  }
  function defineMember(plt, cmpMeta, elm, instance, memberName) {
    const memberMeta = cmpMeta.membersMeta[memberName];
    const memberType = memberMeta.memberType;
    function getComponentProp() {
      // component instance prop/state getter
      // get the property value directly from our internal values
      const elm = this.__el;
      return elm && elm._values && elm._values[memberName];
    }
    function setComponentProp(newValue) {
      // component instance prop/state setter (cannot be arrow fn)
      const elm = this.__el;
      elm && 1 !== memberType && setValue(plt, elm, memberName, newValue);
    }
    if (1 === memberType || 5 === memberType || 2 === memberType) {
      if (5 !== memberType) {
        if (memberMeta.attribName && (void 0 === elm._values[memberName] || '' === elm._values[memberName])) {
          // check the prop value from the host element attribute
          const hostAttrValue = elm.getAttribute(memberMeta.attribName);
          null != hostAttrValue && (// looks like we've got an attribute value
          // let's set it to our internal values
          elm._values[memberName] = parsePropertyValue(memberMeta.propType, hostAttrValue));
        }
        if (elm.hasOwnProperty(memberName)) {
          // @Prop or @Prop({mutable:true})
          // property values on the host element should override
          // any default values on the component instance
          void 0 === elm._values[memberName] && (elm._values[memberName] = elm[memberName]);
          plt.isClient && // within the browser, the element's prototype
          // already has its getter/setter set, but on the
          // server the prototype is shared causing issues
          // so instead the server's elm has the getter/setter
          // on the actual element instance, not its prototype
          // for the client, let's delete its "own" property
          delete elm[memberName];
        }
      }
      instance.hasOwnProperty(memberName) && void 0 === elm._values[memberName] && (// @Prop() or @Prop({mutable:true}) or @State()
      // we haven't yet got a value from the above checks so let's
      // read any "own" property instance values already set
      // to our internal value as the source of getter data
      // we're about to define a property and it'll overwrite this "own" property
      elm._values[memberName] = instance[memberName]);
      // add getter/setter to the component instance
      // these will be pointed to the internal data set from the above checks
      definePropertyGetterSetter(instance, memberName, getComponentProp, setComponentProp);
      proxyPropChangeMethods(cmpMeta.propsDidChangeMeta, PROP_DID_CHG, elm, instance, memberName);
    } else if (7 === memberType) {
      // @Element()
      // add a getter to the element reference using
      // the member name the component meta provided
      definePropertyValue(instance, memberName, elm);
    } else if (3 === memberType) {
      // @Prop({ context: 'config' })
      var contextObj = plt.getContextItem(memberMeta.ctrlId);
      contextObj && definePropertyValue(instance, memberName, contextObj.getContext && contextObj.getContext(elm) || contextObj);
    }
  }
  function proxyPropChangeMethods(propChangeMeta, prefix, elm, instance, memberName) {
    // there are prop WILL change methods for this component
    const propChangeMthd = propChangeMeta && propChangeMeta.find(m => m[0] === memberName);
    propChangeMthd && (// cool, we should watch for changes to this property
    // let's bind their watcher function and add it to our list
    // of watchers, so any time this property changes we should
    // also fire off their method
    elm._values[prefix + memberName] = instance[propChangeMthd[1]].bind(instance));
  }
  function setValue(plt, elm, memberName, newVal) {
    // get the internal values object, which should always come from the host element instance
    // create the _values object if it doesn't already exist
    const internalValues = elm._values = elm._values || {};
    // check our new property value against our internal value
    const oldVal = internalValues[memberName];
    if (newVal !== oldVal) {
      // set our new value!
      // https://youtu.be/dFtLONl4cNc?t=22
      internalValues[memberName] = newVal;
      internalValues[PROP_DID_CHG + memberName] && // this instance is watching for when this property DID change
      internalValues[PROP_DID_CHG + memberName](newVal, oldVal);
      elm._instance && !plt.activeRender && // looks like this value actually changed, so we've got work to do!
      // but only if we've already created an instance, otherwise just chill out
      // queue that we need to do an update, but don't worry about queuing
      // up millions cuz this function ensures it only runs once
      queueUpdate(plt, elm);
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
    return new Promise(resolve => {
      let ctrlElm = controllerComponents[ctrlTag];
      ctrlElm || (ctrlElm = domApi.$body.querySelector(ctrlTag));
      if (!ctrlElm) {
        ctrlElm = controllerComponents[ctrlTag] = domApi.$createElement(ctrlTag);
        domApi.$appendChild(domApi.$body, ctrlElm);
      }
      ctrlElm.componentOnReady(resolve);
    });
  }
  function proxyProp(domApi, controllerComponents, ctrlTag, proxyMethodName) {
    return function() {
      const args = arguments;
      return loadComponent(domApi, controllerComponents, ctrlTag).then(ctrlElm => ctrlElm[proxyMethodName].apply(ctrlElm, args));
    };
  }
  const PROP_DID_CHG = '$$dc';
  function initComponentInstance(plt, elm, cmpMeta) {
    try {
      // using the user's component class, let's create a new instance
      cmpMeta = plt.getComponentMeta(elm);
      elm._instance = new cmpMeta.componentModule();
      // ok cool, we've got an host element now, and a actual instance
      // and there were no errors creating the instance
      // let's upgrade the data on the host element
      // and let the getters/setters do their jobs
      proxyComponentInstance(plt, cmpMeta, elm, elm._instance);
    } catch (e) {
      // something done went wrong trying to create a component instance
      // create a dumby instance so other stuff can load
      // but chances are the app isn't fully working cuz this component has issues
      elm._instance = {};
      plt.onError(e, 7, elm, true);
    }
  }
  function initLoad(plt, elm, hydratedCssClass) {
    // all is good, this component has been told it's time to finish loading
    // it's possible that we've already decided to destroy this element
    // check if this element has any actively loading child elements
    if (elm._instance && !elm._hasDestroyed && (!elm.$activeLoading || !elm.$activeLoading.length)) {
      // cool, so at this point this element isn't already being destroyed
      // and it does not have any child elements that are still loading
      // ensure we remove any child references cuz it doesn't matter at this point
      elm.$activeLoading = null;
      // sweet, this particular element is good to go
      // all of this element's children have loaded (if any)
      elm._hasLoaded = true;
      try {
        // fire off the ref if it exists
        callNodeRefs(elm._vnode);
        // fire off the user's elm.componentOnReady() callbacks that were
        // put directly on the element (well before anything was ready)
        if (elm._onReadyCallbacks) {
          elm._onReadyCallbacks.forEach(cb => cb(elm));
          elm._onReadyCallbacks = null;
        }
        // fire off the user's componentDidLoad method (if one was provided)
        // componentDidLoad only runs ONCE, after the instance's element has been
        // assigned as the host element, and AFTER render() has been called
        // we'll also fire this method off on the element, just to
        elm._instance.componentDidLoad && elm._instance.componentDidLoad();
      } catch (e) {
        plt.onError(e, 4, elm);
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
  function propagateElementLoaded(elm, index, ancestorsActivelyLoadingChildren) {
    // load events fire from bottom to top
    // the deepest elements load first then bubbles up
    if (elm._ancestorHostElement) {
      // ok so this element already has a known ancestor host element
      // let's make sure we remove this element from its ancestor's
      // known list of child elements which are actively loading
      ancestorsActivelyLoadingChildren = elm._ancestorHostElement.$activeLoading;
      if (ancestorsActivelyLoadingChildren) {
        index = ancestorsActivelyLoadingChildren.indexOf(elm);
        index > -1 && // yup, this element is in the list of child elements to wait on
        // remove it so we can work to get the length down to 0
        ancestorsActivelyLoadingChildren.splice(index, 1);
        // the ancestor's initLoad method will do the actual checks
        // to see if the ancestor is actually loaded or not
        // then let's call the ancestor's initLoad method if there's no length
        // (which actually ends up as this method again but for the ancestor)
        !ancestorsActivelyLoadingChildren.length && elm._ancestorHostElement.$initLoad();
      }
      // fuhgeddaboudit, no need to keep a reference after this element loaded
      elm._ancestorHostElement = null;
    }
  }
  function render(plt, elm, cmpMeta, isUpdateRender) {
    const instance = elm._instance;
    // if this component has a render function, let's fire
    // it off and generate the child vnodes for this host element
    // note that we do not create the host element cuz it already exists
    const hostMeta = cmpMeta.hostMeta;
    if (instance.render || instance.hostData || hostMeta) {
      // tell the platform we're actively rendering
      // if a value is changed within a render() then
      // this tells the platform not to queue the change
      plt.activeRender = true;
      const vnodeChildren = instance.render && instance.render();
      let vnodeHostData;
      // user component provided a "hostData()" method
      // the returned data/attributes are used on the host element
      vnodeHostData = instance.hostData && instance.hostData();
      // tell the platform we're done rendering
      // now any changes will again queue
      plt.activeRender = false;
      // looks like we've got child nodes to render into this host element
      // or we need to update the css class/attrs on the host element
      // if we haven't already created a vnode, then we give the renderer the actual element
      // if this is a re-render, then give the renderer the last vnode we already created
      const oldVNode = elm._vnode || new VNode();
      oldVNode.elm = elm;
      // each patch always gets a new vnode
      // the host element itself isn't patched because it already exists
      // kick off the actual render and any DOM updates
      elm._vnode = plt.render(oldVNode, h(null, vnodeHostData, vnodeChildren), isUpdateRender, elm._hostContentNodes, cmpMeta.encapsulation);
    }
    // attach the styles this component needs, if any
    // this fn figures out if the styles should go in a
    // shadow root or if they should be global
    plt.attachStyles(cmpMeta, instance.mode, elm);
    // it's official, this element has rendered
    elm.$rendered = true;
    if (elm.$onRender) {
      // ok, so turns out there are some child host elements
      // waiting on this parent element to load
      // let's fire off all update callbacks waiting
      elm.$onRender.forEach(cb => cb());
      elm.$onRender = null;
    }
  }
  function queueUpdate(plt, elm) {
    // only run patch if it isn't queued already
    if (!elm._isQueuedForUpdate) {
      elm._isQueuedForUpdate = true;
      // run the patch in the next tick
      plt.queue.add(() => {
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
      const isInitialLoad = !elm._instance;
      let userPromise;
      if (isInitialLoad) {
        const ancestorHostElement = elm._ancestorHostElement;
        if (ancestorHostElement && !ancestorHostElement.$rendered) {
          // this is the intial load
          // this element has an ancestor host element
          // but the ancestor host element has NOT rendered yet
          // so let's just cool our jets and wait for the ancestor to render
          (ancestorHostElement.$onRender = ancestorHostElement.$onRender || []).push(() => {
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
          elm._instance.componentWillLoad && (userPromise = elm._instance.componentWillLoad());
        } catch (e) {
          plt.onError(e, 3, elm);
        }
      }
      userPromise && userPromise.then ? // looks like the user return a promise!
      // let's not actually kick off the render
      // until the user has resolved their promise
      userPromise.then(() => renderUpdate(plt, elm, isInitialLoad)) : // user never returned a promise so there's
      // no need to wait on anything, let's do the render now my friend
      renderUpdate(plt, elm, isInitialLoad);
    }
  }
  function renderUpdate(plt, elm, isInitialLoad) {
    // if this component has a render function, let's fire
    // it off and generate a vnode for this
    try {
      render(plt, elm, plt.getComponentMeta(elm), !isInitialLoad);
    } catch (e) {
      plt.onError(e, 8, elm, true);
    }
    try {
      isInitialLoad && // so this was the initial load i guess
      elm.$initLoad();
    } catch (e) {
      // derp
      plt.onError(e, 6, elm, true);
    }
  }
  function connectedCallback(plt, cmpMeta, elm) {
    // do not reconnect if we've already created an instance for this element
    if (!elm.$connected) {
      // first time we've connected
      elm.$connected = true;
      // if somehow this node was reused, ensure we've removed this property
      elm._hasDestroyed = null;
      // register this component as an actively
      // loading child to its parent component
      registerWithParentComponent(plt, elm);
      // add to the queue to load the bundle
      // it's important to have an async tick in here so we can
      // ensure the "mode" attribute has been added to the element
      // place in high priority since it's not much work and we need
      // to know as fast as possible, but still an async tick in between
      plt.queue.add(() => {
        // only collects slot references if this component even has slots
        plt.connectHostElement(cmpMeta, elm);
        // start loading this component mode's bundle
        // if it's already loaded then the callback will be synchronous
        plt.loadBundle(cmpMeta, elm, () => // we've fully loaded the component mode data
        // let's queue it up to be rendered next
        queueUpdate(plt, elm));
      }, 3);
    }
  }
  function registerWithParentComponent(plt, elm, ancestorHostElement) {
    // find the first ancestor host element (if there is one) and register
    // this element as one of the actively loading child elements for its ancestor
    ancestorHostElement = elm;
    while (ancestorHostElement = plt.domApi.$parentElement(ancestorHostElement)) {
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
    if (!plt.tmpDisconnected && isDisconnected(plt.domApi, elm)) {
      // ok, let's officially destroy this thing
      // set this to true so that any of our pending async stuff
      // doesn't continue since we already decided to destroy this node
      elm._hasDestroyed = true;
      // double check that we've informed the ancestor host elements
      // that they're good to go and loaded (cuz this one is on its way out)
      propagateElementLoaded(elm);
      // since we're disconnecting, call all of the JSX ref's with null
      callNodeRefs(elm._vnode, true);
      // detatch any event listeners that may have been added
      // because we're not passing an exact event name it'll
      // remove all of this element's event, which is good
      plt.domApi.$removeEventListener(elm);
      elm._hostContentNodes && (// overreacting here just to reduce any memory leak issues
      elm._hostContentNodes = elm._hostContentNodes.defaultSlot = elm._hostContentNodes.namedSlots = null);
      // call instance Did Unload and destroy instance stuff
      // if we've created an instance for this
      if (elm._instance) {
        // call the user's componentDidUnload if there is one
        elm._instance.componentDidUnload && elm._instance.componentDidUnload();
        elm._instance = elm._instance.__el = null;
      }
      // fuhgeddaboudit
      // set it all to null to ensure we forget references
      // and reset values incase this node gets reused somehow
      // (possible that it got disconnected, but the node was reused)
      elm.$activeLoading = elm.$connected = elm.$defaultHolder = elm._root = elm._values = elm._vnode = elm._ancestorHostElement = elm._hasLoaded = elm._isQueuedForUpdate = elm._observer = null;
    }
  }
  function isDisconnected(domApi, elm) {
    while (elm) {
      if (!domApi.$parentNode(elm)) {
        return 9 !== domApi.$nodeType(elm);
      }
      elm = domApi.$parentNode(elm);
    }
  }
  function initHostConstructor(plt, cmpMeta, HostElementConstructor, hydratedCssClass) {
    // let's wire up our functions to the host element's prototype
    // we can also inject our platform into each one that needs that api
    // note: these cannot be arrow functions cuz "this" is important here hombre
    HostElementConstructor.connectedCallback = function() {
      // coolsville, our host element has just hit the DOM
      connectedCallback(plt, cmpMeta, this);
    };
    HostElementConstructor.attributeChangedCallback = function(attribName, oldVal, newVal) {
      // the browser has just informed us that an attribute
      // on the host element has changed
      attributeChangedCallback(cmpMeta.membersMeta, this, attribName, oldVal, newVal);
    };
    HostElementConstructor.disconnectedCallback = function() {
      // the element has left the builing
      disconnectedCallback(plt, this);
    };
    HostElementConstructor.componentOnReady = function(cb, promise) {
      cb || (promise = new Promise(resolve => cb = resolve));
      componentOnReady(this, cb);
      return promise;
    };
    HostElementConstructor.$initLoad = function() {
      initLoad(plt, this, hydratedCssClass);
    };
    HostElementConstructor.forceUpdate = function() {
      queueUpdate(plt, this);
    };
    // add getters/setters to the host element members
    // these would come from the @Prop and @Method decorators that
    // should create the public API to this component
    proxyHostElementPrototype(plt, cmpMeta.membersMeta, HostElementConstructor);
  }
  function componentOnReady(elm, cb) {
    elm._hasDestroyed || (elm._hasLoaded ? cb(elm) : (elm._onReadyCallbacks = elm._onReadyCallbacks || []).push(cb));
  }
  function useShadowDom(supportsNativeShadowDom, cmpMeta) {
    return supportsNativeShadowDom && 1 === cmpMeta.encapsulation;
  }
  function useScopedCss(supportsNativeShadowDom, cmpMeta) {
    if (2 === cmpMeta.encapsulation) {
      return true;
    }
    if (1 === cmpMeta.encapsulation && !supportsNativeShadowDom) {
      return true;
    }
    return false;
  }
  function createPlatformClient(Context, App, win, doc, publicPath, hydratedCssClass) {
    const registry = {
      'html': {}
    };
    const moduleImports = {};
    const bundleCallbacks = {};
    const loadedBundles = {};
    const styleTemplates = {};
    const pendingBundleRequests = {};
    const controllerComponents = {};
    const domApi = createDomApi(win, doc);
    const now = () => win.performance.now();
    const raf = cb => window.requestAnimationFrame(cb);
    Context.isServer = Context.isPrerender = !(Context.isClient = true);
    Context.window = win;
    Context.location = win.location;
    Context.document = doc;
    Context.publicPath = publicPath;
    // keep a global set of tags we've already defined
    const globalDefined = win.definedComponents = win.definedComponents || {};
    // create the platform api which is used throughout common core code
    const plt = {
      connectHostElement: connectHostElement,
      domApi: domApi,
      defineComponent: defineComponent,
      emitEvent: Context.emit,
      getComponentMeta: elm => registry[domApi.$tagName(elm)],
      getContextItem: contextKey => Context[contextKey],
      isClient: true,
      isDefinedComponent: elm => !!(globalDefined[domApi.$tagName(elm)] || plt.getComponentMeta(elm)),
      loadBundle: loadBundle,
      onError: (err, type, elm) => console.error(err, type, elm && elm.tagName),
      propConnect: ctrlTag => proxyController(domApi, controllerComponents, ctrlTag),
      queue: createQueueClient(raf, now),
      registerComponents: components => (components || []).map(data => parseComponentLoaders(data, registry))
    };
    // create the renderer that will be used
    plt.render = createRendererPatch(plt, domApi);
    // setup the root element which is the mighty <html> tag
    // the <html> has the final say of when the app has loaded
    const rootElm = domApi.$documentElement;
    rootElm.$rendered = true;
    rootElm.$activeLoading = [];
    // this will fire when all components have finished loaded
    rootElm.$initLoad = (() => rootElm._hasLoaded = true);
    function connectHostElement(cmpMeta, elm) {
      // set the "mode" property
      elm.mode || (// looks like mode wasn't set as a property directly yet
      // first check if there's an attribute
      // next check the app's global
      elm.mode = domApi.$getAttribute(elm, 'mode') || Context.mode);
      // host element has been connected to the DOM
      domApi.$getAttribute(elm, SSR_VNODE_ID) || useShadowDom(domApi.$supportsShadowDom, cmpMeta) || // only required when we're NOT using native shadow dom (slot)
      // this host element was NOT created with SSR
      // let's pick out the inner content for slot projection
      assignHostContentSlots(domApi, cmpMeta, elm, elm.childNodes);
      domApi.$supportsShadowDom || 1 !== cmpMeta.encapsulation || (// this component should use shadow dom
      // but this browser doesn't support it
      // so let's polyfill a few things for the user
      elm.shadowRoot = elm);
    }
    function defineComponent(cmpMeta, HostElementConstructor) {
      const tagName = cmpMeta.tagNameMeta;
      if (!globalDefined[tagName]) {
        // keep an array of all the defined components, useful for external frameworks
        globalDefined[tagName] = true;
        // initialize the members on the host element prototype
        initHostConstructor(plt, cmpMeta, HostElementConstructor.prototype, hydratedCssClass);
        {
          // add which attributes should be observed
          const observedAttributes = [];
          // at this point the membersMeta only includes attributes which should
          // be observed, it does not include all props yet, so it's safe to
          // loop through all of the props (attrs) and observed them
          for (var propName in cmpMeta.membersMeta) {
            // initialize the actual attribute name used vs. the prop name
            // for example, "myProp" would be "my-prop" as an attribute
            // and these can be configured to be all lower case or dash case (default)
            cmpMeta.membersMeta[propName].attribName && observedAttributes.push(// dynamically generate the attribute name from the prop name
            // also add it to our array of attributes we need to observe
            cmpMeta.membersMeta[propName].attribName);
          }
          // set the array of all the attributes to keep an eye on
          // https://www.youtube.com/watch?v=RBs21CFBALI
          HostElementConstructor.observedAttributes = observedAttributes;
        }
        // define the custom element
        win.customElements.define(tagName, HostElementConstructor);
      }
    }
    App.loadComponents = function loadComponents(bundleId, importFn) {
      // https://youtu.be/Z-FPimCmbX8?t=31
      // jsonp tag team back again from requested bundle
      const args = arguments;
      // import component function
      // inject globals
      importFn(moduleImports, h, Context, publicPath);
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
        bundleCallbacks[bundleId] = null;
      }
      // remember that we've already loaded this bundle
      loadedBundles[bundleId] = true;
    };
    App.loadStyles = function loadStyles() {
      // jsonp callback from requested bundles
      // either directly add styles to document.head or add the
      // styles to a template tag to be cloned later for shadow roots
      const args = arguments;
      let templateElm;
      for (var i = 0; i < args.length; i += 2) {
        // create the template element which will hold the styles
        // adding it to the dom via <template> so that we can
        // clone this for each potential shadow root that will need these styles
        // otherwise it'll be cloned and added to the document
        // but that's for the renderer to figure out later
        // let's create a new template element
        styleTemplates[args[i]] = templateElm = domApi.$createElement('template');
        // add the style text to the template element's innerHTML
        templateElm.innerHTML = `<style>${args[i + 1]}</style>`;
        // give the template element a unique id
        templateElm.id = `tmp-${args[i]}`;
        // add our new template element to the head
        // so it can be cloned later
        domApi.$appendChild(domApi.$head, templateElm);
      }
    };
    function loadBundle(cmpMeta, elm, cb, bundleId) {
      bundleId = (cmpMeta.bundleIds[elm.mode] || cmpMeta.bundleIds)[0];
      if (loadedBundles[bundleId]) {
        // sweet, we've already loaded this bundle
        cb();
      } else {
        // never seen this bundle before, let's start the request
        // and add it to the callbacks to fire when it has loaded
        (bundleCallbacks[bundleId] = bundleCallbacks[bundleId] || []).push(cb);
        // not using css shim, so no need to wait on css shim to finish
        // figure out which bundle to request and kick it off
        requestBundle(cmpMeta, bundleId);
      }
    }
    function requestBundle(cmpMeta, bundleId, url, tmrId, scriptElm) {
      // create the url we'll be requesting
      url = publicPath + bundleId + (useScopedCss(domApi.$supportsShadowDom, cmpMeta) ? '.sc' : '') + '.js';
      function onScriptComplete() {
        clearTimeout(tmrId);
        scriptElm.onerror = scriptElm.onload = null;
        domApi.$removeChild(domApi.$parentNode(scriptElm), scriptElm);
        // remove from our list of active requests
        pendingBundleRequests[url] = false;
      }
      if (!pendingBundleRequests[url]) {
        // we're not already actively requesting this url
        // let's kick off the bundle request and
        // remember that we're now actively requesting this url
        pendingBundleRequests[url] = true;
        // create a sript element to add to the document.head
        scriptElm = domApi.$createElement('script');
        scriptElm.charset = 'utf-8';
        scriptElm.async = true;
        scriptElm.src = url;
        // create a fallback timeout if something goes wrong
        tmrId = setTimeout(onScriptComplete, 12e4);
        // add script completed listener to this script element
        scriptElm.onerror = scriptElm.onload = onScriptComplete;
        // inject a script tag in the head
        // kick off the actual request
        domApi.$appendChild(domApi.$head, scriptElm);
      }
    }
    plt.attachStyles = ((cmpMeta, modeName, elm) => {
      {
        const templateElm = styleTemplates[cmpMeta.tagNameMeta + '_' + modeName] || styleTemplates[cmpMeta.tagNameMeta];
        if (templateElm) {
          let styleContainerNode = domApi.$head;
          if (domApi.$supportsShadowDom) {
            if (1 === cmpMeta.encapsulation) {
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
          const appliedStyles = styleContainerNode._appliedStyles = styleContainerNode._appliedStyles || {};
          if (!appliedStyles[templateElm.id]) {
            {
              // not using the css shim
              // we haven't added these styles to this element yet
              const styleElm = templateElm.content.cloneNode(true);
              const insertReferenceNode = styleContainerNode.querySelector('[data-visibility]');
              domApi.$insertBefore(styleContainerNode, styleElm, insertReferenceNode && insertReferenceNode.nextSibling || styleContainerNode.firstChild);
            }
            // remember we don't need to do this again for this element
            appliedStyles[templateElm.id] = true;
          }
        }
      }
    });
    return plt;
  }
  const App = window[appNamespace] = window[appNamespace] || {};
  const plt = createPlatformClient(Context, App, window, document, publicPath, hydratedCssClass);
  // es6 class extends HTMLElement
  plt.registerComponents(App.components).forEach(cmpMeta => plt.defineComponent(cmpMeta, class extends HTMLElement {}));
})(window, document, Context, appNamespace, publicPath);
})({},"App","hydrated","build/app/");