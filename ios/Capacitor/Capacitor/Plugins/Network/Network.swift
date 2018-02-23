import Foundation

@objc(CAPNetworkPlugin)
public class CAPNetworkPlugin : CAPPlugin {
  let reachability = Reachability()!
  
  public override func load() {
    print("Loading network plugin")
    reachability.whenReachable = { reachability in
      if reachability.connection == .wifi {
        print("Reachable via WiFi")
        self.notifyStatusChangeListeners(connected: true, type: "wifi")
      } else {
        print("Reachable via Cellular")
        self.notifyStatusChangeListeners(connected: true, type: "cellular")
      }
    }
    reachability.whenUnreachable = { _ in
      print("Not reachable")
      self.notifyStatusChangeListeners(connected: false, type: "none")
    }
  
    do {
      try reachability.startNotifier()
    } catch {
      print("Unable to start notifier")
    }
  }
  
  @objc func getStatus(_ call: CAPPluginCall) {
    var connected = false
    var type = ""
    if reachability.connection == .wifi {
      connected = true
      type = "wifi"
    }
    if reachability.connection == .cellular {
      connected = true
      type = "cellular"
    }
    
    call.success([
      "connected": connected,
      "connectionType": type
    ])
  }
  
  func notifyStatusChangeListeners(connected: Bool, type: String) {
    notifyListeners("networkStatusChange", data: [
      "connected": connected,
      "connectionType": type
    ])
  }
}
