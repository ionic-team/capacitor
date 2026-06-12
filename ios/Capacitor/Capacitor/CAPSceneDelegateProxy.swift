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

        if !connectionOptions.urlContexts.isEmpty {
            self.scene(scene, openURLContexts: connectionOptions.urlContexts)
        }

        for userActivity in connectionOptions.userActivities {
            self.scene(scene, continue: userActivity)
        }
    }

    public func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        for context in URLContexts {
            lastURL = context.url
            NotificationCenter.default.post(name: .capacitorOpenURL, object: [
                "url": context.url,
                "options": Self.openURLOptions(from: context.options)
            ])
        }
    }

    public func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        guard userActivity.activityType == NSUserActivityTypeBrowsingWeb,
              let url = userActivity.webpageURL else {
            return
        }
        lastURL = url
        NotificationCenter.default.post(name: .capacitorOpenUniversalLink, object: [
            "url": url
        ])
    }

    // Lifecycle hooks are intentionally stubbed until multi-window support lands.
    // Until then, CapacitorBridge keeps observing the UIApplication.* equivalents,
    // which still fire in scene-based apps for first-foreground / last-background.

    public func sceneDidDisconnect(_ scene: UIScene) {
        // TODO: multi-window — tear down the bridge associated with this scene.
    }

    public func sceneDidBecomeActive(_ scene: UIScene) {
        // TODO: multi-window — forward per-scene active event to the bridge.
    }

    public func sceneWillResignActive(_ scene: UIScene) {
        // TODO: multi-window — forward per-scene resign-active event to the bridge.
    }

    public func sceneWillEnterForeground(_ scene: UIScene) {
        // TODO: multi-window — drive JS `resume` from this instead of UIApplication.willEnterForegroundNotification.
    }

    public func sceneDidEnterBackground(_ scene: UIScene) {
        // TODO: multi-window — drive JS `pause` from this instead of UIApplication.didEnterBackgroundNotification.
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
