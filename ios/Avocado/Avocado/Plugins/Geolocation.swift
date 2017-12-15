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
      let result = [
        "coords": [
          "latitude": location.coordinate.latitude,
          "longitude": location.coordinate.longitude
        ]
      ]
      call!.success(result)

    } else {
      // TODO: Handle case where location is nil
    }
  }
}

@objc(Geolocation)
public class Geolocation : AVCPlugin {
  // TODO: Figure out better way to save the call hander (strong reference)
  var locationHandler: CLLocationManagerDelegate?
  var watchLocationHandler: CLLocationManagerDelegate?
  
  @objc public func getCurrentPosition(_ call: AVCPluginCall) {
    self.locationHandler = GetLocationHandler(call: call, options:[
      "watch": false
    ])
  }
  
  @objc public func watchPosition(_ call: AVCPluginCall) {
    self.watchLocationHandler = GetLocationHandler(call: call, options:[
      "watch": true
    ]);
  }
  
}

