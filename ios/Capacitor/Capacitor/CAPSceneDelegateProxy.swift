//
//  CAPSceneDelegateProxy.swift
//  Capacitor
//
//  Created by Joseph Orlando Pender on 6/10/26.
//  Copyright © 2026 Drifty Co. All rights reserved.
//

import Foundation

@objc(CAPSceneDelegateProxy)
public class SceneDelegateProxy: NSObject, UISceneDelegate {
    public static let shared = SceneDelegateProxy()

    public private(set) var lastURL: URL?

    public func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        NotificationCenter.default.post(name: .capacitorSceneWillConnect, object: scene)

        // Plugins haven't loaded yet on a cold start, so notifications posted here are
        // missed. Deliver them on the first capacitorViewDidAppear, once plugins are
        // registered.
        var token: NSObjectProtocol?
        token = NotificationCenter.default.addObserver(forName: .capacitorViewDidAppear, object: nil, queue: .main) { _ in
            if let token {
                NotificationCenter.default.removeObserver(token)
            }
            if !connectionOptions.urlContexts.isEmpty {
                self.scene(scene, openURLContexts: connectionOptions.urlContexts)
            }
            for userActivity in connectionOptions.userActivities {
                self.scene(scene, continue: userActivity)
            }
        }
    }

    public func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        for context in URLContexts {
            lastURL = context.url
            ApplicationDelegateProxy.shared.lastURL = context.url
            let options = Self.openURLOptions(from: context.options)

            // Capacitor 8 backwards compat
            NotificationCenter.default.post(name: .capacitorOpenURL, object: [
                "url": context.url,
                "options": options
            ])

            NotificationCenter.default.post(name: NSNotification.Name.CDVPluginHandleOpenURL, object: context.url)

            NotificationCenter.default.post(name: .capacitorSceneOpenURL, object: scene, userInfo: [
                "url": context.url,
                "options": options
            ])
        }
    }

    public func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        guard userActivity.activityType == NSUserActivityTypeBrowsingWeb,
              let url = userActivity.webpageURL else {
            return
        }
        lastURL = url
        ApplicationDelegateProxy.shared.lastURL = url

        // Capacitor 8 backwards compat
        NotificationCenter.default.post(name: .capacitorOpenUniversalLink, object: [
            "url": url
        ])

        NotificationCenter.default.post(name: .capacitorSceneOpenUniversalLink, object: scene, userInfo: [
            "url": url
        ])
    }

    private static func openURLOptions(from sceneOptions: UIScene.OpenURLOptions) -> [UIApplication.OpenURLOptionsKey: Any] {
        var options: [UIApplication.OpenURLOptionsKey: Any] = [:]
        if let sourceApplication = sceneOptions.sourceApplication {
            options[.sourceApplication] = sourceApplication
        }
        if let annotation = sceneOptions.annotation {
            options[.annotation] = annotation
        }
        options[.openInPlace] = sceneOptions.openInPlace
        return options
    }
}
