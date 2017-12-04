//
//  Geolocation.swift
//  IonicRunner
//
//  Created by Perry Govier on 3/25/17.
//  Copyright © 2017 Max Lynch. All rights reserved.
//

import Foundation
import UIKit
import CoreLocation

class GeolocationPlugin:NSObject, CLLocationManagerDelegate {
  var locationManager = CLLocationManager()
  var cb: ((Double, Double) -> Void)? = nil

  func getLocation(callback: @escaping (Double, Double) -> Void) {
    print("Getting location")
    
    // For use in foreground
    self.locationManager.requestWhenInUseAuthorization()
    self.locationManager.delegate = self
    self.locationManager.desiredAccuracy = kCLLocationAccuracyBest
    
    self.locationManager.requestLocation()
    self.cb = callback
  }
  
  func locationManager(_ manager: CLLocationManager, didFailWithError error: NSError) {
    print("Error while updating location " + error.localizedDescription)
  }
  
  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    let locValue:CLLocationCoordinate2D = manager.location!.coordinate
    //print("locations = \(locValue.latitude) \(locValue.longitude)")
    
    if( self.cb != nil) {
      self.cb!(locValue.latitude, locValue.longitude)
    }
  }
}
