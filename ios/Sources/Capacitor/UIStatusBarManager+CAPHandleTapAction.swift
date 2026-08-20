//
//  UIStatusBarManager+CAPHandleTapAction.swift
//  Capacitor
//
//  Copyright © 2024 Drifty Co. All rights reserved.
//

import Foundation
import UIKit
import ObjectiveC

extension UIStatusBarManager {
    private static let swizzle: Void = {
        let classRef = UIStatusBarManager.self
        let originalSelector = Selector(("handleTapAction:"))
        let swizzledSelector = #selector(UIStatusBarManager.nofity_handleTapAction(_:))

        guard let originalMethod = class_getInstanceMethod(classRef, originalSelector),
              let swizzledMethod = class_getInstanceMethod(classRef, swizzledSelector) else {
            return
        }

        let didAddMethod = class_addMethod(
            classRef,
            originalSelector,
            method_getImplementation(swizzledMethod),
            method_getTypeEncoding(swizzledMethod)
        )

        if didAddMethod {
            class_replaceMethod(
                classRef,
                swizzledSelector,
                method_getImplementation(originalMethod),
                method_getTypeEncoding(originalMethod)
            )
        } else {
            method_exchangeImplementations(originalMethod, swizzledMethod)
        }
    }()

    static func ensureSwizzling() {
        _ = swizzle
    }

    @objc func nofity_handleTapAction(_ arg: Any) {
        NotificationCenter.default.post(
            name: Notification.Name(rawValue: "CapacitorStatusBarTappedNotification"),
            object: nil
        )
        nofity_handleTapAction(arg)
    }
}
