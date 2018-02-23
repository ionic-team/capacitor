import Foundation

@objc(CAPClipboardPlugin)
public class CAPClipboardPlugin : CAPPlugin {
  @objc func write(_ call: CAPPluginCall) {
    guard let options = call.getObject("options") else {
      call.error("No options provided")
      return
    }
    
    if let string = options["string"] as? String {
      UIPasteboard.general.string = string
      return
    }
    if let urlString = options["url"] as? String {
      if let url = URL(string: urlString) {
        UIPasteboard.general.url = url
      }
    }
    if let imageBase64 = options["image"] as? String {
      print(imageBase64)
      if let data = Data(base64Encoded: imageBase64) {
        let image = UIImage(data: data)
        print("Loaded image", image!.size.width, image!.size.height)
        UIPasteboard.general.image = image
      } else {
        print("Unable to encode image")
      }
    }

    call.success()
  }
  
  @objc func read(_ call: CAPPluginCall) {
    guard let options = call.getObject("options") else {
      call.error("No options provided")
      return
    }
    
    let type = options["type"] as? String ?? "string"
    
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



