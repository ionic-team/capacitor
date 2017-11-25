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
    
    let viewController = UIStoryboard.init(name: "Camera", bundle: Bundle(for: type(of: self))).instantiateViewController(withIdentifier: "CameraViewController")
    
    self.avocado.viewController.present(viewController, animated: true) {
    }
  }
}


