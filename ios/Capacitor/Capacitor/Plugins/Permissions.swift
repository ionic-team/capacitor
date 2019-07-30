import Foundation
import Photos

/**
 * Implement three common modal types: alert, confirm, and prompt
 */
@objc(CAPPermissionsPlugin)
public class CAPPermissionsPlugin: CAPPlugin {
  @objc func hasPermission(_ call: CAPPluginCall) {
    guard let type = call.getString("type") else {
      call.reject("Must provide a permission to check")
      return
    }
    
    var ret = false
    switch (type) {
    case "CAMERA":
        ret = checkCamera(call)
    case "GEOLOCATION":
        ret = checkGeolocation(call)
      default:
        return call.reject("Unknown permission")
    }
    
    call.resolve([
      "value": ret
    ])
  }

  func checkCamera(_ call: CAPPluginCall) -> Bool {
    let authStatus = AVCaptureDevice.authorizationStatus(for: .video)
    
    var ret = false
    switch (authStatus){
    case .authorized:
      ret = true
    default:
      ret = false
    }

    return ret
  }

  func checkGeolocation(_ call: CAPPluginCall) -> Bool {
    var ret = false
    if CLLocationManager.locationServicesEnabled() {
        switch CLLocationManager.authorizationStatus() {
        case .notDetermined, .restricted, .denied:
          ret = false
        case .authorizedAlways, .authorizedWhenInUse:
          ret = true
        default:
          ret = false
        }
    } else {
      ret = false
    }

    return ret
  }
}
