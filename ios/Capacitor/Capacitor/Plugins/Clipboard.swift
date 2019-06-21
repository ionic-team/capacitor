import Foundation

@objc(CAPClipboardPlugin)
public class CAPClipboardPlugin : CAPPlugin {
  @objc func write(_ call: CAPPluginCall) {
    if let string = call.options["string"] as? String {
      UIPasteboard.general.string = string
    } else if let urlString = call.options["url"] as? String {
      if let url = URL(string: urlString) {
        UIPasteboard.general.url = url
      }
    } else if let imageBase64 = call.options["image"] as? String {
      if let data = Data(base64Encoded: imageBase64) {
        let image = UIImage(data: data)
        CAPLog.print("Loaded image", image!.size.width, image!.size.height)
        UIPasteboard.general.image = image
      } else {
        CAPLog.print("Unable to encode image")
      }
    }
    call.success()
  }
  
  @objc func read(_ call: CAPPluginCall) {
    let type = call.options["type"] as? String ?? "string"
    
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
      let data = image.pngData()
      if let base64 = data?.base64EncodedString() {
        call.success([
          "value": base64
        ])
      }
      return
    }
  }
}



