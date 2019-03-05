public final class CAPAppDelegate {
  public static let shared = CAPAppDelegate()
  
  public func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    return CAPBridge.handleOpenUrl(url, options)
  }
  
  public func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    return CAPBridge.handleContinueActivity(userActivity, restorationHandler)
  }
  
  public func applicationDidBecomeActive(_ application: UIApplication) {
    return CAPBridge.handleAppBecameActive(application)
  }
}
