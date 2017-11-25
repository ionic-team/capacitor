import Foundation
import SafariServices

public class Browser : Plugin, SFSafariViewControllerDelegate {
  var vc: SFSafariViewController?
  
  @objc func open(_ call: PluginCall) {
    if let urlString = call.options["url"] as? String {
      let url = URL(string: urlString)
      vc = SFSafariViewController.init(url: url!)
      vc!.delegate = self
      avocado.viewController.present(vc!, animated: true, completion: {
        
      })
    }
  }
}

