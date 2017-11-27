import Foundation
import CoreMotion

@objc(Camera)
public class Camera : Plugin {
  @objc func open(_ call: PluginCall) {
    if(bridge.isSimulator()) {
      bridge.modulePrint(self, "Camera not available in simulator")
      bridge.alert("Camera Error", "Camera not available in Simulator")
      call.error("Camera not available while running in Simulator")
    }
    
    if let missingUsageDescription = checkUsageDescriptions() {
      bridge.modulePrint(self, missingUsageDescription)
      call.error(missingUsageDescription)
      bridge.alert("Camera Error", "Missing required usage description. See console for more information")
      return
    }
    
    let allowEditing = call.get("allowEditing", Bool.self, false)!
    
    let alert = UIAlertController(title: "Photo", message: nil, preferredStyle: UIAlertControllerStyle.actionSheet)
    alert.addAction(UIAlertAction(title: "From Photos", style: .destructive, handler: { (action: UIAlertAction) in
      self.bridge.reload()
    }))
    alert.addAction(UIAlertAction(title: "Take Picture", style: .destructive, handler: { (action: UIAlertAction) in
      self.bridge.reload()
    }))
  }
  
  
  /**
   * Make sure the developer provided proper usage descriptions
   * per apple's terms.
   */
  func checkUsageDescriptions() -> String? {
    if let dict = Bundle.main.infoDictionary {
      let hasPhotoLibraryUsage = dict["NSPhotoLibraryAddUsageDescription"] != nil
      if !hasPhotoLibraryUsage {
        let docLink = DocLinks.NSPhotoLibraryAddUsageDescription
        return "You are missing NSPhotoLibraryAddUsageDescription in your Info.plist file." +
        " Camera will not function without it. Learn more: \(docLink.rawValue)"
      }
    }
    
    return nil
  }
}



