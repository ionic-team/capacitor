import Foundation
import CoreMotion

@objc(Camera)
public class Camera : Plugin {
  var cameraViewController: CameraViewController?
  
  @objc func open(_ call: PluginCall) {
    if(avocado.isSimulator()) {
      avocado.modulePrint(self, "Camera not available in simulator")
      return
    }
    cameraViewController = CameraViewController()
    self.avocado.viewController.present(cameraViewController!, animated: true) {
      
      print("Done")
    }
  }
}


