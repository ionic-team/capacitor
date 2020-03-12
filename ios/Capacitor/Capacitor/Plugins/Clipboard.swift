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
      if let data = Data(base64Encoded: getCleanData(imageBase64)) {
        let image = UIImage(data: data)
        CAPLog.print("Loaded image", image!.size.width, image!.size.height)
        UIPasteboard.general.image = image
      } else {
        CAPLog.print("Unable to encode image")
      }
    }
    call.success()
  }
  
  // TODO - move to helper class
  func getCleanData(_ data: String) -> String {
    let dataParts = data.split(separator: ",")
    var cleanData = data
    if dataParts.count > 0 {
      cleanData = String(dataParts.last!)
    }
    return cleanData
  }

  @objc func read(_ call: CAPPluginCall) {
    if UIPasteboard.general.hasStrings {
      call.success([
        "value": UIPasteboard.general.string!,
        "type": "text/plain"
      ])
      return
    }
    if UIPasteboard.general.hasURLs {
      let url = UIPasteboard.general.url!
      call.success([
        "value": url.absoluteString,
        "type": "text/plain"
      ])
      return
    }
    if UIPasteboard.general.hasImages {
      let image = UIPasteboard.general.image!
      let data = image.pngData()
      if let base64 = data?.base64EncodedString() {
        call.success([
          "value": "data:image/png;base64," + base64,
          "type": "image/png"
        ])
      }
      return
    }
  }
}



