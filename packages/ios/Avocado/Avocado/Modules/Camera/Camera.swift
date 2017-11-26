import Foundation
import CoreMotion

@objc(Camera)
public class Camera : Plugin {
  var cameraViewController: CameraViewController?
  
  @objc func open(_ call: PluginCall) {
    if(avocado.isSimulator()) {
      avocado.modulePrint(self, "Camera not available in simulator")
      avocado.alert("Camera Error", "Camera not available in Simulator")
      call.error("Camera not available while running in Simulator")
    }
    
    if let missingUsageDescription = checkUsageDescriptions() {
      avocado.modulePrint(self, missingUsageDescription)
      call.error(missingUsageDescription)
      avocado.alert("Camera Error", "Missing required usage description. See console for more information")
      return
    }
    
    let viewController = UIStoryboard.init(name: "Camera", bundle: Bundle(for: type(of: self))).instantiateViewController(withIdentifier: "CameraViewController")
    
    self.avocado.viewController.present(viewController, animated: true) {
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


