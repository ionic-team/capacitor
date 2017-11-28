import Foundation
import CoreMotion

@objc(Clipboard)
public class Clipboard : Plugin {
  @objc func set(_ call: PluginCall) {
    if let string = call.get("string", String.self) {
      UIPasteboard.general.string = string
      return
    }
    if let urlString = call.get("url", String.self) {
      if let url = URL(string: urlString) {
        UIPasteboard.general.url = url
      }
    }
    if let imageBase64 = call.get("image", String.self) {
      if let data = Data(base64Encoded: imageBase64) {
        let image = UIImage(data: data)
        UIPasteboard.general.image = image
      }
    }

    call.success()
  }
  
  @objc func get(_ call: PluginCall) {
    let type = call.get("type", String.self, "string")!
    
    if type == "string" && UIPasteboard.general.hasStrings {
      call.success([
        "value": UIPasteboard.general.string!
      ])
      return
    }
    
    if type == "url" && UIPasteboard.general.hasURLs {
      let url = UIPasteboard.general.url!
      call.success([
        "value": url.absoluteString
      ])
      return
    }
    
    if type == "image" && UIPasteboard.general.hasImages {
      let image = UIPasteboard.general.image!
      let data = UIImagePNGRepresentation(image)
      if let base64 = data?.base64EncodedString() {
        call.success([
          "value": base64
        ])
      }
      return
    }
  }
}



