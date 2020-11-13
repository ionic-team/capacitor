import Foundation
import UIKit
import CoreLocation

public struct GeolocationCoords {
  public var latitude: Double
  public var longitude: Double
  public init(latitude: Double, longitude: Double) {
    self.latitude = latitude
    self.longitude = longitude
  }
}

class GetLocationHandler: NSObject, CLLocationManagerDelegate {
  var locationManager = CLLocationManager()
  var call: CAPPluginCall
  var shouldWatch: Bool
  var hasPendingOperation: Bool

  init(call: CAPPluginCall, options: [String:Any]) {
    self.call = call
    self.shouldWatch = options["watch"] as! Bool
    self.hasPendingOperation = true
    super.init()
    // TODO: Allow user to configure accuracy, request/authorization mode
    self.locationManager.delegate = self
    if call.getBool("enableHighAccuracy", false)! {
      if shouldWatch {
        self.locationManager.desiredAccuracy = kCLLocationAccuracyBestForNavigation
      } else {
        self.locationManager.desiredAccuracy = kCLLocationAccuracyBest
      }
    } else {
      self.locationManager.desiredAccuracy = kCLLocationAccuracyThreeKilometers
    }

    if CLLocationManager.authorizationStatus() == .notDetermined {
      self.locationManager.requestWhenInUseAuthorization()
    } else {
      getLocation();
    }
  }

  public func stopUpdating() {
    self.locationManager.stopUpdatingLocation()
  }

  public func getLocation() {
    hasPendingOperation = false
    if shouldWatch {
      self.locationManager.startUpdatingLocation()
    } else {
      self.locationManager.requestLocation()
    }
  }

  func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
    call.error(error.localizedDescription, error, [
      "message": error.localizedDescription
    ])
  }
  
  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    if let location = locations.first  {
      let result = makePosition(location)

      call.success(result)
    } else {
      // TODO: Handle case where location is nil
      call.success()
    }
  }

  public func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
    if status != .notDetermined && hasPendingOperation {
      getLocation()
    }
  }

  func makePosition(_ location: CLLocation) -> JSObject {
    var ret = JSObject()
    var coords = JSObject()
    coords["latitude"] = location.coordinate.latitude
    coords["longitude"] = location.coordinate.longitude
    coords["accuracy"] = location.horizontalAccuracy
    coords["altitude"] = location.altitude
    coords["altitudeAccuracy"] = location.verticalAccuracy
    coords["speed"] = location.speed
    coords["heading"] = location.course
    ret["timestamp"] = NSNumber(value: Int((location.timestamp.timeIntervalSince1970 * 1000)))
    ret["coords"] = coords
    return ret
  }
}

@objc(CAPGeolocationPlugin)
public class CAPGeolocationPlugin : CAPPlugin {
  var locationHandler: GetLocationHandler?
  var watchLocationHandler: GetLocationHandler?
  
  @objc func getCurrentPosition(_ call: CAPPluginCall) {
    DispatchQueue.main.async {
      self.locationHandler = GetLocationHandler(call: call, options:[
        "watch": false
      ])
    }
  }
  
  @objc func watchPosition(_ call: CAPPluginCall) {
    call.save()
    
    DispatchQueue.main.async {
      self.watchLocationHandler = GetLocationHandler(call: call, options:[
        "watch": true
      ]);
    }
  }
  
  @objc func clearWatch(_ call: CAPPluginCall) {
    guard let callbackId = call.getString("id") else {
      CAPLog.print("Must supply id")
      return
    }
    let savedCall = bridge.getSavedCall(callbackId)
    if savedCall != nil {
      bridge.releaseCall(savedCall!)
      
      if self.watchLocationHandler != nil {
        self.watchLocationHandler?.stopUpdating()
      }
    }
    call.success()
  }
  
}

