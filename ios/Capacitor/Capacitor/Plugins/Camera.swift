import Foundation
import Photos

enum CameraSource: String {
  case prompt = "PROMPT"
  case camera = "CAMERA"
  case photos = "PHOTOS"
}

enum CameraResultType: String {
  case base64 = "base64"
  case uri = "uri"
}

struct CameraSettings {
  var source: CameraSource = CameraSource.prompt
  var allowEditing = false
  var shouldResize = false
  var shouldCorrectOrientation = false
  var quality: Float = 1.0
  var width: Float = 0
  var height: Float = 0
  var resultType = "base64"
}

@objc(CAPCameraPlugin)
public class CAPCameraPlugin : CAPPlugin, UIImagePickerControllerDelegate, UINavigationControllerDelegate, UIPopoverPresentationControllerDelegate {
  let DEFAULT_SOURCE = CameraSource.prompt
  
  var imagePicker: UIImagePickerController?
  var call: CAPPluginCall?
  
  var imageCounter = 0
  
  var settings = CameraSettings()
  
  @objc func getPhoto(_ call: CAPPluginCall) {
    self.call = call
    self.settings = getSettings(call)

    let sourceType = getSourceType(settings.source)
    
    // Make sure they have all the necessary info.plist settings
    if let missingUsageDescription = checkUsageDescriptions() {
      bridge.modulePrint(self, missingUsageDescription)
      call.error(missingUsageDescription)
      bridge.alert("Camera Error", "Missing required usage description. See console for more information")
      return
    }
    
    if !UIImagePickerController.isSourceTypeAvailable(sourceType) {
      call.error("Camera is not available. Are you running in the simulator?")
      return
    }
    
    imagePicker = UIImagePickerController()
    imagePicker!.delegate = self
    imagePicker!.sourceType = sourceType
    imagePicker!.modalPresentationStyle = .popover
    imagePicker!.popoverPresentationController?.delegate = self
    self.setCenteredPopover(self.imagePicker!)
    //imagePicker!.popoverPresentationController?.sourceView = view
    
    doShow(call: call, settings: settings)
  }
  
  func getSettings(_ call: CAPPluginCall) -> CameraSettings {
    var settings = CameraSettings()
    settings.quality = call.get("quality", Float.self, 100)!
    settings.allowEditing = call.get("allowEditing", Bool.self, false)!
    settings.source = CameraSource(rawValue: call.getString("source") ?? DEFAULT_SOURCE.rawValue) ?? DEFAULT_SOURCE
    settings.resultType = call.get("resultType", String.self, "base64")!
    // Get the new image dimensions if provided
    settings.width = Float(call.get("width", Int.self, 0)!)
    settings.height = Float(call.get("height", Int.self, 0)!)
    if settings.width > 0 || settings.height > 0 {
      // We resize only if a dimension was provided
      settings.shouldResize = true
    }
    
    settings.shouldCorrectOrientation = call.get("correctOrientation", Bool.self, false)!

    return settings
  }
  
  func doShow(call: CAPPluginCall, settings: CameraSettings) {
    
    DispatchQueue.main.async {
      switch settings.source {
      case CameraSource.prompt:
        self.showPrompt(call)
      case CameraSource.camera:
        self.showCamera(call)
      case CameraSource.photos:
        self.showPhotos(call)
      }
    }
  }
  
  func showPrompt(_ call: CAPPluginCall) {
    // Build the action sheet
    let alert = UIAlertController(title: "Photo", message: nil, preferredStyle: UIAlertControllerStyle.actionSheet)
    alert.addAction(UIAlertAction(title: "From Photos", style: .default, handler: { (action: UIAlertAction) in
      self.showPhotos(call)
    }))
    
    alert.addAction(UIAlertAction(title: "Take Picture", style: .default, handler: { (action: UIAlertAction) in
      self.showCamera(call)
    }))
    
    alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: { (action: UIAlertAction) in
      alert.dismiss(animated: true, completion: nil)
    }))
    
    self.setCenteredPopover(alert)
    self.bridge.viewController.present(alert, animated: true, completion: nil)
  }
  
  func showCamera(_ call: CAPPluginCall) {
    if self.bridge.isSimulator() || !UIImagePickerController.isSourceTypeAvailable(UIImagePickerControllerSourceType.camera) {
      self.bridge.modulePrint(self, "Camera not available in simulator")
      self.bridge.alert("Camera Error", "Camera not available in Simulator")
      call.error("Camera not available while running in Simulator")
      return
    }
    
    guard let imagePicker = self.imagePicker else {
      call.error("Internal error, please file an issue")
      return
    }
    
    imagePicker.sourceType = .camera
    
    self.bridge.viewController.present(imagePicker, animated: true, completion: nil)
  }
  
  func showPhotos(_ call: CAPPluginCall) {
    let photoAuthorizationStatus = PHPhotoLibrary.authorizationStatus()
    if photoAuthorizationStatus == .restricted || photoAuthorizationStatus == .denied {
      call.error("User denied access to photos")
      return
    }
    
    self.imagePicker!.sourceType = .photoLibrary
    self.imagePicker!.allowsEditing = settings.allowEditing
    
    self.bridge.viewController.present(self.imagePicker!, animated: true, completion: nil)
  }
  
  func getSourceType(_ source: CameraSource) -> UIImagePickerControllerSourceType {
    switch source {
    case CameraSource.prompt:
      return .photoLibrary
    case CameraSource.camera:
      return .camera
    case CameraSource.photos:
      return .savedPhotosAlbum
    }
  }
  
  public func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
    picker.dismiss(animated: true)
  }
  
  public func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : Any]) {
    var image: UIImage?
    
    if let editedImage = info[UIImagePickerControllerEditedImage] as? UIImage {
      // Use editedImage Here
      image = editedImage
    } else if let originalImage = info[UIImagePickerControllerOriginalImage] as? UIImage {
      // Use originalImage Here
      image = originalImage
    }
    
    if settings.shouldResize {
      guard let convertedImage = resizeImage(image!) else {
        self.call?.error("Error resizing image")
        return
      }
      image = convertedImage
    }
    
    if settings.shouldCorrectOrientation {
      guard let convertedImage = correctOrientation(image!) else {
        self.call?.error("Error resizing image")
        return
      }
      image = convertedImage
    }
    
    guard let jpeg = UIImageJPEGRepresentation(image!, CGFloat(settings.quality/100)) else {
      print("Unable to convert image to jpeg")
      self.call?.error("Unable to convert image to jpeg")
      return
    }

    if settings.resultType == "base64" {
      let base64String = jpeg.base64EncodedString()
      
      self.call?.success([
        "base64Data": "data:image/jpeg;base64," + base64String,
        "format": "jpeg"
      ])
    } else if settings.resultType == "uri" {
      let path = try! saveTemporaryImage(jpeg)
      guard let webPath = CAPFileManager.getPortablePath(uri: URL(string: path)) else {
        call?.reject("Unable to get portable path to file")
        return
      }
      call?.success([
        "path": path,
        "webPath": webPath,
        "format": "jpeg"
      ])
    }
    
    picker.dismiss(animated: true, completion: nil)
  }
  
  func resizeImage(_ image: UIImage) -> UIImage? {
    let isAspectScale = settings.width > 0 && settings.height == 0 || settings.height > 0 && settings.width == 0
    let aspect = Float(image.size.width / image.size.height);

    var size = CGSize.init(width: Int(settings.width), height: Int(settings.height))
    if isAspectScale {
      if settings.width > 0 {
        size = CGSize.init(width: Int(settings.width), height: Int(settings.width * (1/aspect)))
      } else if settings.height > 0 {
        size = CGSize.init(width: Int(settings.height * (1/aspect)), height: Int(settings.height))
      }
    }

    UIGraphicsBeginImageContextWithOptions(size, false, 1.0)
    image.draw(in: CGRect(origin: CGPoint.zero, size: size))
    
    let scaledImage = UIGraphicsGetImageFromCurrentImageContext()
    UIGraphicsEndImageContext()
    return scaledImage
  }
  
  func correctOrientation(_ image: UIImage) -> UIImage? {
    UIGraphicsBeginImageContext(image.size)
    image.draw(at: .zero)
    let newImage = UIGraphicsGetImageFromCurrentImageContext()
    UIGraphicsEndImageContext()
    return newImage ?? image
  }
  
  func saveTemporaryImage(_ data: Data) throws -> String {
    var url: URL
    repeat {
      imageCounter += 1
      url = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent("photo-\(imageCounter).jpg")
    } while FileManager.default.fileExists(atPath: url.absoluteString)
    
    try data.write(to: url, options: .atomic)
    return url.absoluteString
  }
  
  /**
   * Make sure the developer provided proper usage descriptions
   * per apple's terms.
   */
  func checkUsageDescriptions() -> String? {
    if let dict = Bundle.main.infoDictionary {
      let hasPhotoLibraryAddUsage = dict["NSPhotoLibraryAddUsageDescription"] != nil
      if !hasPhotoLibraryAddUsage {
        let docLink = DocLinks.NSPhotoLibraryAddUsageDescription
        return "You are missing NSPhotoLibraryAddUsageDescription in your Info.plist file." +
        " Camera will not function without it. Learn more: \(docLink.rawValue)"
      }
      let hasPhotoLibraryUsage = dict["NSPhotoLibraryUsageDescription"] != nil
      if !hasPhotoLibraryUsage {
          let docLink = DocLinks.NSPhotoLibraryUsageDescription
          return "You are missing NSPhotoLibraryUsageDescription in your Info.plist file." +
          " Camera will not function without it. Learn more: \(docLink.rawValue)"
      }
      let hasCameraUsage = dict["NSCameraUsageDescription"] != nil
      if !hasCameraUsage {
          let docLink = DocLinks.NSCameraUsageDescription
          return "You are missing NSCameraUsageDescription in your Info.plist file." +
          " Camera will not function without it. Learn more: \(docLink.rawValue)"
      }
    }
    
    return nil
  }
  
}
