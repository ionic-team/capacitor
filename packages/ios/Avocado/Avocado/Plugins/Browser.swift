import Foundation
import SafariServices

public class Browser : Plugin, SFSafariViewControllerDelegate {
  var vc: SFSafariViewController?
  
  public init(_ avocado: Avocado) {
    super.init(avocado, id: "com.avocadojs.plugin.browser")
  }
  
  @objc public func open(_ call: PluginCall) {
    if let urlString = call.options["url"] as? String {
      let url = URL(string: urlString)
      vc = SFSafariViewController.init(url: url!)
      vc!.delegate = self
      avocado.viewController.present(vc!, animated: true, completion: {
        
      })
    }
  }
}

