import Foundation
import Photos
import UserNotifications

/**
 * Allow to check hardware permissions
 */
@objc(CAPPermissionsPlugin)
public class CAPPermissionsPlugin: CAPPlugin {

  @objc func query(_ call: CAPPluginCall) {
    guard let name = call.getString("name") else {
      call.reject("Must provide a permission to check")
      return
    }
    
    switch (name) {
    case "camera":
      return checkCamera(call)
    case "geolocation":
      return checkGeolocation(call)
    case "notifications":
      return checkNotifications(call)
    case "clipboard-read", "clipboard-write":
      return checkClipboard(call)
    case "photos":
      return checkPhotos(call)
    case "microphone":
      return checkMicrophone(call)
    default:
      return call.reject("Unknown permission type")
    }
  }

  func checkCamera(_ call: CAPPluginCall) {
    let authStatus = AVCaptureDevice.authorizationStatus(for: .video)
    
    var ret = "prompt"
    switch (authStatus) {
    case .notDetermined:
      ret = "prompt"
    case .denied, .restricted:
      ret = "denied"
    case .authorized:
      ret = "granted"
    }

    call.resolve([
      "state": ret
    ])
  }

  func checkPhotos(_ call: CAPPluginCall) {
    let photoAuthorizationStatus = PHPhotoLibrary.authorizationStatus()

    var ret = "prompt"
    switch (photoAuthorizationStatus) {
      case .notDetermined:
        ret = "prompt"
      case .denied, .restricted:
        ret = "denied"
      case .authorized:
        ret = "granted"
    }
    call.resolve([
      "state": ret
    ])
  }

  func checkGeolocation(_ call: CAPPluginCall) {
    var ret = "prompt"
    if CLLocationManager.locationServicesEnabled() {
        switch CLLocationManager.authorizationStatus() {
        case .notDetermined:
          ret = "prompt"
        case .denied, .restricted:
          ret = "denied"
        case .authorizedAlways, .authorizedWhenInUse:
          ret = "granted"
        }
    } else {
      ret = "denied"
    }

    call.resolve([
      "state": ret
    ])
  }

  func checkNotifications(_ call: CAPPluginCall) {
    UNUserNotificationCenter.current().getNotificationSettings(completionHandler: { settings in
      var ret = "prompt"
      switch settings.authorizationStatus {
      case .authorized, .provisional:
        ret = "granted"
      case .denied:
        ret = "denied"
      case .notDetermined:
        ret = "prompt"
      }
      
      call.resolve([
        "state": ret
      ])
    })
  }
  
  func checkClipboard(_ call: CAPPluginCall) {
    call.resolve([
      "state": "granted"
    ])
  }

  func checkMicrophone(_ call: CAPPluginCall) {
    let microStatus = AVCaptureDevice.authorizationStatus(for: .audio)

    var ret = "prompt"
    switch (microStatus) {
        case .authorized:
          ret = "granted"
        case .denied, .restricted:
          ret = "denied"
        case .notDetermined:
          ret = "prompt"
    }

    call.resolve([
      "state": ret
    ])
  }
}
