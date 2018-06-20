import Foundation

/**
 * Implement three common modal types: alert, confirm, and prompt
 */
@objc(CAPSharePlugin)
public class CAPSharePlugin : CAPPlugin {
  @objc func share(_ call: CAPPluginCall) {
    var items = [Any]()
    
    if let text = call.options["text"] as? String {
      items.append(text)
    }
    
    if let url = call.options["url"] as? String {
      let urlObj = URL(string: url)
      items.append(urlObj!)
    }
    
    let title = call.getString("title")
    
    if items.count == 0 {
      call.error("Must provide at least url or message")
      return
    }
    
    DispatchQueue.main.async {
      let actionController = UIActivityViewController(activityItems: items, applicationActivities: nil)
      
      if title != nil {
        // https://stackoverflow.com/questions/17020288/how-to-set-a-mail-subject-in-uiactivityviewcontroller
        actionController.setValue(title, forKey: "subject")
      }
      
      actionController.completionWithItemsHandler = { (activityType, completed, _ returnedItems, activityError) in
        if activityError != nil {
          call.error("Error sharing item", activityError)
          return
        }
        
        // TODO: Support returnedItems
        
        call.success([
          "completed": completed,
          "activityType": activityType?.rawValue ?? ""
        ])
      }
      
      self.setCenteredPopover(actionController)
      self.bridge.viewController.present(actionController, animated: true, completion: nil)
    }
  }
}
