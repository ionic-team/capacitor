import Foundation
import SafariServices

@objc(Browser)
public class Browser : Plugin, SFSafariViewControllerDelegate {
  var vc: SFSafariViewController?
  
  @objc(open:url:)
  func open(_ call: PluginCall, url: String) {
    if let urlString = call.options["url"] as? String {
      let url = URL(string: urlString)
      vc = SFSafariViewController.init(url: url!)
      vc!.delegate = self
      bridge.viewController.present(vc!, animated: true, completion: {
        
      })
    }
  }
}

