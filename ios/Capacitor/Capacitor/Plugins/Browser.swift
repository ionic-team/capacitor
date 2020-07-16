import Foundation
import SafariServices

@objc(CAPBrowserPlugin)
public class CAPBrowserPlugin: CAPPlugin, SFSafariViewControllerDelegate {
  var vc: SFSafariViewController?

  @objc func open(_ call: CAPPluginCall) {
    guard let urlString = call.getString("url") else {
      call.error("Must provide a URL to open")
      return
    }

    if urlString.isEmpty {
      call.error("URL must not be empty")
      return
    }

    let toolbarColor = call.getString("toolbarColor")
    let url = URL(string: urlString)
    if let scheme = url?.scheme, ["http", "https"].contains(scheme.lowercased()) {
    DispatchQueue.main.async { [weak self] in
        let safariVC = SFSafariViewController.init(url: url!)
        safariVC.delegate = self
        let presentationStyle = call.getString("presentationStyle")
        if presentationStyle != nil && presentationStyle == "popover" && (self?.supportsPopover() ?? false) {
          safariVC.modalPresentationStyle = .popover
          self?.setCenteredPopover(safariVC)
        } else {
          safariVC.modalPresentationStyle = .fullScreen
        }

        if toolbarColor != nil {
          safariVC.preferredBarTintColor = UIColor(fromHex: toolbarColor!)
        }

        self?.bridge?.presentVC(safariVC, animated: true, completion: {
          call.success()
        })
        self?.vc = safariVC
      }
    } else {
      call.error("Invalid URL")
    }
  }

  @objc func close(_ call: CAPPluginCall) {
    if vc == nil {
      call.success()
    }
    DispatchQueue.main.async {
      self.bridge?.dismissVC(animated: true) {
        call.success()
      }
    }
  }

  @objc func prefetch(_ call: CAPPluginCall) {
    call.unimplemented()
  }

  public func safariViewControllerDidFinish(_ controller: SFSafariViewController) {
    self.notifyListeners("browserFinished", data: [:])
    vc = nil
  }

  public func safariViewController(_ controller: SFSafariViewController, didCompleteInitialLoad didLoadSuccessfully: Bool) {
    self.notifyListeners("browserPageLoaded", data: [:])
  }
}
