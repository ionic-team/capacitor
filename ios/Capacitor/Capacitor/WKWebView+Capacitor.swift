import Foundation
import WebKit

extension WKWebView: CapacitorExtension {}
public extension CapacitorExtensionTypeWrapper where T == WKWebView {
    var keyboardShouldRequireUserInteraction: Bool? {
        return (self.baseType.associatedKeyboardFlagValue as? NSNumber)?.boolValue
    }

    // the readonly nature of the wrapper extension means we can't use a computed property with a setter
    func setKeyboardShouldRequireUserInteraction(_ flag: Bool? = nil) {
        if let flag = flag {
            self.baseType.associatedKeyboardFlagValue = NSNumber(value: flag)
        } else {
            self.baseType.associatedKeyboardFlagValue = nil
        }
    }
}

private var associatedKeyboardFlagHandle: UInt8 = 0

internal extension WKWebView {
    // Our lazy property can't be represented in Obj-C so we need this simple wrapper.
    // swiftlint:disable identifier_name
    @objc static func _swizzleKeyboardMethods() {
        _ = oneTimeOnlySwizzle
    }

    typealias FourArgClosureType =  @convention(c) (Any, Selector, UnsafeRawPointer, Bool, Bool, Any?) -> Void
    typealias FiveArgClosureType =  @convention(c) (Any, Selector, UnsafeRawPointer, Bool, Bool, Bool, Any?) -> Void

    // dispatch_once isn't available in Swift, but lazy properties use the same mechanism under the hood so
    // we can safely assume that this block of code will only execute once.
    static let oneTimeOnlySwizzle: () = {
        let frameworkName = "WK"
        let className = "ContentView"
        guard let targetClass = NSClassFromString(frameworkName + className) else {
            return
        }

        let containingWebView = { (object: Any?) -> WKWebView? in
            var view = object as? UIView
            while view != nil {
                if let webview = view as? WKWebView {
                    return webview
                }
                view = view?.superview
            }
            return nil
        }

        let swizzleFourArgClosure = { (method: Method, selector: Selector) in
            let originalImp: IMP = method_getImplementation(method)
            let original: FourArgClosureType = unsafeBitCast(originalImp, to: FourArgClosureType.self)
            let block : @convention(block) (Any, UnsafeRawPointer, Bool, Bool, Any?) -> Void = { (me, arg0, arg1, arg2, arg3) in
                if let webview = containingWebView(me), let flag = webview.capacitor.keyboardShouldRequireUserInteraction {
                    original(me, selector, arg0, !flag, arg2, arg3)
                } else {
                    original(me, selector, arg0, arg1, arg2, arg3)
                }
            }
            let imp: IMP = imp_implementationWithBlock(block)
            method_setImplementation(method, imp)
        }

        let swizzleFiveArgClosure = { (method: Method, selector: Selector) in
            let originalImp: IMP = method_getImplementation(method)
            let original: FiveArgClosureType = unsafeBitCast(originalImp, to: FiveArgClosureType.self)
            let block : @convention(block) (Any, UnsafeRawPointer, Bool, Bool, Bool, Any?) -> Void = { (me, arg0, arg1, arg2, arg3, arg4) in
                if let webview = containingWebView(me), let flag = webview.capacitor.keyboardShouldRequireUserInteraction {
                    original(me, selector, arg0, !flag, arg2, arg3, arg4)
                } else {
                    original(me, selector, arg0, arg1, arg2, arg3, arg4)
                }
            }
            let imp: IMP = imp_implementationWithBlock(block)
            method_setImplementation(method, imp)
        }

        // older
        let selectorMkI: Selector = sel_getUid("_startAssistingNode:userIsInteracting:blurPreviousNode:userObject:")
        // iOS 11.3
        let selectorMkII: Selector = sel_getUid("_startAssistingNode:userIsInteracting:blurPreviousNode:changingActivityState:userObject:")
        // iOS 12.2
        let selectorMkIII: Selector = sel_getUid("_elementDidFocus:userIsInteracting:blurPreviousNode:changingActivityState:userObject:")
        // iOS 13
        let selectorMkIV: Selector = sel_getUid("_elementDidFocus:userIsInteracting:blurPreviousNode:activityStateChanges:userObject:")

        if let method = class_getInstanceMethod(targetClass, selectorMkI) {
            swizzleFourArgClosure(method, selectorMkI)
        }

        if let method = class_getInstanceMethod(targetClass, selectorMkII) {
            swizzleFiveArgClosure(method, selectorMkII)
        }

        if let method = class_getInstanceMethod(targetClass, selectorMkIII) {
            swizzleFiveArgClosure(method, selectorMkIII)
        }

        if let method = class_getInstanceMethod(targetClass, selectorMkIV) {
            swizzleFiveArgClosure(method, selectorMkIV)
        }
    }()

    var associatedKeyboardFlagValue: Any? {
        get {
            return objc_getAssociatedObject(self, &associatedKeyboardFlagHandle)
        }
        set {
            objc_setAssociatedObject(self, &associatedKeyboardFlagHandle, newValue, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
        }
    }
}
