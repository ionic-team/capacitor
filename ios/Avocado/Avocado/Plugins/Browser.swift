import Foundation
import SafariServices

@objc(Browser)
public class Browser : AVCPlugin, SFSafariViewControllerDelegate {
  var vc: SFSafariViewController?
  
  @objc func open(_ call: AVCPluginCall) {
    if let urlString = call.options["url"] as? String {
      let url = URL(string: urlString)
      vc = SFSafariViewController.init(url: url!)
      vc!.delegate = self
      bridge.viewController.present(vc!, animated: true, completion: {
        call.success()
      })
    }
  }
  
  public func safariViewControllerDidFinish(_ controller: SFSafariViewController) {
    self.notifyListeners("browserFinished", data: [:])
  }
  
  public func safariViewController(_ controller: SFSafariViewController, didCompleteInitialLoad didLoadSuccessfully: Bool) {
    self.notifyListeners("browserLoadedPage", data: [:])
  }
}

