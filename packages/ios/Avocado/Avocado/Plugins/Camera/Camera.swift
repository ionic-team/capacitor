import Foundation
import CoreMotion

@objc(Camera)
public class Camera : Plugin {
  var cameraViewController: CameraViewController?
  
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
    
    if let viewController = UIStoryboard.init(name: "Camera", bundle: Bundle(for: type(of: self))).instantiateViewController(withIdentifier: "CameraViewController") as? CameraViewController {
      viewController.setPluginCall(call)
      self.bridge.viewController.present(viewController, animated: true) {
      }
    } else {
      call.error("Unable to build CameraViewController. Please file an issue")
    }

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


