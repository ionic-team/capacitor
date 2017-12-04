import Foundation

@objc(Network)
public class Network : Plugin {
  let reachability = Reachability()!
  
  public override func load() {
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
      self.notifyStatusChangeListeners(connected: false, type: "")
    }
  
    do {
      try reachability.startNotifier()
    } catch {
      print("Unable to start notifier")
    }
  }
  
  func notifyStatusChangeListeners(connected: Bool, type: String) {
    notifyListeners("networkStatusChanged", data: [
      "connected": connected,
      "connectionType": type
    ])
  }
  
  @objc func onStatusChange(_ call: PluginCall) {
    addEventListener("networkStatusChanged", call)
  }
}


