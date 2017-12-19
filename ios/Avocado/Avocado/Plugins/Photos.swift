import Foundation
import SafariServices

@objc(Photos)
public class Photos : AVCPlugin {
  static let DEFAULT_QUANTITY = 25
  static let DEFAULT_TYPES = "photos"
  
  @objc func getPhotos(_ call: AVCPluginCall) {
    let quantity = call.getInt("quantity", defaultValue: Photos.DEFAULT_QUANTITY)
    let after = call.getString("after")
    let types = call.getString("types") ?? Photos.DEFAULT_TYPES
  }
  
  @objc func saveToPhotos(_ call: AVCPluginCall) {
    guard let path = call.getString("path") else {
      call.error("Must provide a path")
      return
    }
    
    
  }

}


