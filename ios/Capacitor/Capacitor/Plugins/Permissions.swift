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
    
    switch (type) {
    case "CAMERA":
      return checkCamera(call)
    case "GEOLOCATION":
      return checkGeolocation(call)
    case "PUSH_NOTIFICATIONS":
      return checkPushNotifications(call)
    case "CLIPBOARD":
      return checkClipboard(call)
    case "PHOTOS":
      return checkPhotos(call)
    default:
      return call.reject("Unknown permission type")
    }
  }

  func checkCamera(_ call: CAPPluginCall) {
    let authStatus = AVCaptureDevice.authorizationStatus(for: .video)
    
    var ret = false
    switch (authStatus){
    case .authorized:
      ret = true
    default:
      ret = false
    }

    call.resolve([
      "value": ret
    ])
  }

  func checkPhotos(_ call: CAPPluginCall) {
    var ret = false

    let photoAuthorizationStatus = PHPhotoLibrary.authorizationStatus()
    if photoAuthorizationStatus == .authorized {
      ret = true
    }
    call.resolve([
      "value": ret
    ])
  }

  func checkGeolocation(_ call: CAPPluginCall) {
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

    call.resolve([
      "value": ret
    ])
  }

  func checkPushNotifications(_ call: CAPPluginCall) {
    UNUserNotificationCenter.current().getNotificationSettings(completionHandler: { settings in
      var ret = false
      switch settings.authorizationStatus {
      case .authorized, .provisional:
        ret = true
      case .denied, .notDetermined:
        ret = false
      }
      
      call.resolve([
        "value": ret
      ])
    })
  }
  
  func checkClipboard(_ call: CAPPluginCall) {
    call.resolve([
      "value": true
    ])
  }
}
