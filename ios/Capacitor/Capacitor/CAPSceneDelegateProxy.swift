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

    public func scene(
        _ scene: UIScene, willConnectTo session: UISceneSession,
        options connectionOptions: UIScene.ConnectionOptions
    ) {
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
            let options = Self.openURLOptions(from: context.options)

            // Capacitor 8 backwards compat
            NotificationCenter.default.post(
                name: .capacitorOpenURL,
                object: [
                    "url": context.url,
                    "options": options
                ])

            NotificationCenter.default.post(
                name: .capacitorSceneOpenURL, object: scene,
                userInfo: [
                    "url": context.url,
                    "options": options
                ])
        }
    }

    public func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        guard userActivity.activityType == NSUserActivityTypeBrowsingWeb,
              let url = userActivity.webpageURL
        else {
            return
        }
        lastURL = url

        // Capacitor 8 backwards compat
        NotificationCenter.default.post(
            name: .capacitorOpenUniversalLink,
            object: [
                "url": url
            ])

        NotificationCenter.default.post(
            name: .capacitorSceneOpenUniversalLink, object: scene,
            userInfo: [
                "url": url
            ])
    }

    /// Routes a URL into Capacitor's open-URL handlers from a SwiftUI App-struct app.
    ///
    /// This is the recommended integration point for apps whose root is a `SwiftUI.App`
    /// and which therefore do not declare an explicit `UISceneDelegate` subclass.
    /// Call it from the `.onOpenURL` modifier inside the scene body:
    ///
    /// ```swift
    /// WindowGroup {
    ///     CapacitorView()
    ///         .onOpenURL { url in
    ///             SceneDelegateProxy.shared.handle(openURL: url)
    ///         }
    /// }
    /// ```
    ///
    /// Posts the same notifications as the `scene(_:openURLContexts:)` protocol path —
    /// both `.capacitorOpenURL` (Capacitor 8 back-compat payload) and
    /// `.capacitorSceneOpenURL` (scene-aware, with the resolved scene as the notification
    /// object and the URL in `userInfo`).
    ///
    /// - Parameters:
    ///   - openURL: The URL to route.
    ///   - scene: The scene that received the URL. SwiftUI's `.onOpenURL` does not
    ///     surface a scene reference, so this defaults to `nil`; when `nil`, the active
    ///     foreground `UIWindowScene` is resolved from
    ///     `UIApplication.shared.connectedScenes`. For single-scene apps (the Phase 1
    ///     default) this is unambiguous; multi-scene URL routing is Phase 2.
    public func handle(openURL: URL, scene: UIScene? = nil) {
        let targetScene = scene ?? Self.activeForegroundScene()
        lastURL = openURL
        let options: [UIApplication.OpenURLOptionsKey: Any] = [:]

        // Capacitor 8 backwards compat
        NotificationCenter.default.post(
            name: .capacitorOpenURL,
            object: [
                "url": openURL,
                "options": options
            ])

        NotificationCenter.default.post(
            name: .capacitorSceneOpenURL, object: targetScene,
            userInfo: [
                "url": openURL,
                "options": options
            ])
    }

    /// Routes a browsing-web `NSUserActivity` into Capacitor's universal-link handlers
    /// from a SwiftUI App-struct app.
    ///
    /// This is the recommended integration point for SwiftUI App-struct apps. Call it
    /// from the `.onContinueUserActivity` modifier inside the scene body:
    ///
    /// ```swift
    /// WindowGroup {
    ///     CapacitorView()
    ///         .onContinueUserActivity(NSUserActivityTypeBrowsingWeb) { activity in
    ///             SceneDelegateProxy.shared.handle(userActivity: activity)
    ///         }
    /// }
    /// ```
    ///
    /// Only activities with `activityType == NSUserActivityTypeBrowsingWeb` and a
    /// non-nil `webpageURL` produce notifications; other activity types are silently
    /// ignored, matching the `scene(_:continue:)` protocol path. When a notification is
    /// produced, both `.capacitorOpenUniversalLink` (Capacitor 8 back-compat payload)
    /// and `.capacitorSceneOpenUniversalLink` (scene-aware) are posted.
    ///
    /// - Parameters:
    ///   - userActivity: The activity to inspect.
    ///   - scene: The scene that received the activity. SwiftUI does not surface a
    ///     scene reference here either, so this defaults to `nil`; when `nil`, the
    ///     active foreground `UIWindowScene` is resolved from
    ///     `UIApplication.shared.connectedScenes`.
    public func handle(userActivity: NSUserActivity, scene: UIScene? = nil) {
        guard userActivity.activityType == NSUserActivityTypeBrowsingWeb,
              let url = userActivity.webpageURL
        else {
            return
        }
        let targetScene = scene ?? Self.activeForegroundScene()
        lastURL = url

        // Capacitor 8 backwards compat
        NotificationCenter.default.post(
            name: .capacitorOpenUniversalLink,
            object: [
                "url": url
            ])

        NotificationCenter.default.post(
            name: .capacitorSceneOpenUniversalLink, object: targetScene,
            userInfo: [
                "url": url
            ])
    }

    // TODO: Not until Phase 2 of the UI modernization project

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

    private static func activeForegroundScene() -> UIWindowScene? {
        let scenes = UIApplication.shared.connectedScenes
        if let active = scenes.first(where: { $0.activationState == .foregroundActive })
            as? UIWindowScene {
            return active
        }
        return scenes.first(where: { $0.activationState == .foregroundInactive }) as? UIWindowScene
    }

    private static func openURLOptions(from sceneOptions: UIScene.OpenURLOptions) -> [UIApplication
        .OpenURLOptionsKey: Any] {
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
