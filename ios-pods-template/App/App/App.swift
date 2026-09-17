import SwiftUI
import Capacitor

@main
struct CapacitorApp: App {
  @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
  
  var body: some Scene {
    WindowGroup {
      CapacitorView()
        .ignoresSafeArea()
        .onOpenURL { url in
          SceneDelegateProxy.shared.handle(openURL: url)
        }
        .onContinueUserActivity(NSUserActivityTypeBrowsingWeb) { activity in
          SceneDelegateProxy.shared.handle(userActivity: activity)
        }
    }
  }
}
