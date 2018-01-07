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
  var call: AVCPluginCall?
  
  init(call: AVCPluginCall, options: [String:Any]) {
    super.init()
    
    self.call = call
    
    // TODO: Allow user to configure accuracy, request/authorization mode
    self.locationManager.delegate = self
    self.locationManager.requestWhenInUseAuthorization()
    self.locationManager.desiredAccuracy = kCLLocationAccuracyBest
    
    if let shouldWatch = options["watch"], shouldWatch as! Bool == true {
      self.locationManager.startUpdatingLocation()
    } else {
      self.locationManager.requestLocation()
    }
  }
  
  func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
    print("Error while updating location " + error.localizedDescription)
    if let call = self.call {
      call.error(error.localizedDescription, error, [
        "message": error.localizedDescription
      ])
    }
  }
  
  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    if let location = locations.first  {
      let result = makePosition(location)

      call!.success(result)
    } else {
      // TODO: Handle case where location is nil
      call!.success()
    }
  }
  
  func makePosition(_ location: CLLocation) -> JSObject {
    var ret = JSObject()
    var coords = JSObject()
    coords["latitude"] = location.coordinate.latitude
    coords["longitude"] = location.coordinate.longitude
    coords["accuracy"] = location.horizontalAccuracy
    coords["altitude"] = location.altitude
    coords["speed"] = location.speed
    coords["heading"] = location.course
    return ret
  }
}

@objc(Geolocation)
public class Geolocation : AVCPlugin {
  // TODO: Figure out better way to save the call hander (strong reference)
  var locationHandler: CLLocationManagerDelegate?
  var watchLocationHandler: CLLocationManagerDelegate?
  
  @objc public func getCurrentPosition(_ call: AVCPluginCall) {
    DispatchQueue.main.async {
      self.locationHandler = GetLocationHandler(call: call, options:[
        "watch": false
      ])
    }
  }
  
  @objc public func watchPosition(_ call: AVCPluginCall) {
    DispatchQueue.main.async {
      self.watchLocationHandler = GetLocationHandler(call: call, options:[
        "watch": true
      ]);
    }
  }
  
}

