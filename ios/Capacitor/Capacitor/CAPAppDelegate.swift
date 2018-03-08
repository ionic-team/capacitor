public final class CAPAppDelegate {
  public static let shared = CAPAppDelegate()
  
  public func application(_ app: UIApplication, open url: URL, options: [UIApplicationOpenURLOptionsKey : Any] = [:]) -> Bool {
    return CAPBridge.handleOpenUrl(url, options)
  }
  
  public func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([Any]?) -> Void) -> Bool {
    return CAPBridge.handleContinueActivity(userActivity, restorationHandler)
  }
  
  public func applicationDidBecomeActive(_ application: UIApplication) {
    return CAPBridge.handleAppBecameActive(application)
  }
  
  public func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    let tokenParts = deviceToken.map { data -> String in
      return String(format: "%02.2hhx", data)
    }
    
    let token = tokenParts.joined()
    print("Device Token: \(token)")
  }
  
  public func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
    print("Failed to register: \(error)")
  }
}
