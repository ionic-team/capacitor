import Foundation
import Photos

enum CameraSource: String {
  case prompt = "PROMPT"
  case camera = "CAMERA"
  case photos = "PHOTOS"
}

enum CameraDirection: String {
  case rear = "REAR"
  case front = "FRONT"
}

enum CameraResultType: String {
  case base64 = "base64"
  case uri = "uri"
  case DATA_URL = "dataUrl"
}

struct CameraSettings {
  var source: CameraSource = CameraSource.prompt
  var direction: CameraDirection = CameraDirection.rear
  var allowEditing = false
  var shouldResize = false
  var shouldCorrectOrientation = true
  var quality: Float = 1.0
  var width: Float = 0
  var height: Float = 0
  var resultType = "base64"
  var saveToGallery = false
  var preserveAspectRatio = false
}

@objc(CAPCameraPlugin)
public class CAPCameraPlugin : CAPPlugin, UIImagePickerControllerDelegate, UINavigationControllerDelegate, UIPopoverPresentationControllerDelegate {
  let DEFAULT_SOURCE = CameraSource.prompt
  let DEFAULT_DIRECTION = CameraDirection.rear

  var imagePicker: UIImagePickerController?
  var call: CAPPluginCall?

  var imageCounter = 0

  var settings = CameraSettings()
  
  @objc func getPhoto(_ call: CAPPluginCall) {
    self.call = call
    self.settings = getSettings(call)

    // Make sure they have all the necessary info.plist settings
    if let missingUsageDescription = checkUsageDescriptions() {
      bridge.modulePrint(self, missingUsageDescription)
      call.error(missingUsageDescription)
      bridge.alert("Camera Error", "Missing required usage description. See console for more information")
      return
    }

    DispatchQueue.main.async {
      self.imagePicker = UIImagePickerController()
      self.imagePicker!.delegate = self
      self.imagePicker!.allowsEditing = self.settings.allowEditing
    }
    
    doShow(call: call, settings: settings)
  }

  func getSettings(_ call: CAPPluginCall) -> CameraSettings {
    var settings = CameraSettings()
    settings.quality = call.get("quality", Float.self, 100)!
    settings.allowEditing = call.get("allowEditing", Bool.self, false)!
    settings.source = CameraSource(rawValue: call.getString("source") ?? DEFAULT_SOURCE.rawValue) ?? DEFAULT_SOURCE
    settings.direction = CameraDirection(rawValue: call.getString("direction") ?? DEFAULT_DIRECTION.rawValue) ?? DEFAULT_DIRECTION
    settings.resultType = call.get("resultType", String.self, "base64")!
    settings.saveToGallery = call.get("saveToGallery", Bool.self, false)!
    settings.preserveAspectRatio = call.get("preserveAspectRatio", Bool.self, false)!

    // Get the new image dimensions if provided
    settings.width = Float(call.get("width", Int.self, 0)!)
    settings.height = Float(call.get("height", Int.self, 0)!)
    if settings.width > 0 || settings.height > 0 {
      // We resize only if a dimension was provided
      settings.shouldResize = true
    }
    settings.shouldCorrectOrientation = call.get("correctOrientation", Bool.self, true)!

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
    let promptLabelHeader = call.getString("promptLabelHeader") ?? "Photo"
    let promptLabelPhoto = call.getString("promptLabelPhoto") ?? "From Photos"
    let promptLabelPicture = call.getString("promptLabelPicture") ?? "Take Picture"
    let promptLabelCancel = call.getString("promptLabelCancel") ?? "Cancel"
    
    let alert = UIAlertController(title: promptLabelHeader, message: nil, preferredStyle: UIAlertController.Style.actionSheet)
    alert.addAction(UIAlertAction(title: promptLabelPhoto, style: .default, handler: { (action: UIAlertAction) in
      self.showPhotos(call)
    }))

    alert.addAction(UIAlertAction(title: promptLabelPicture, style: .default, handler: { (action: UIAlertAction) in
      self.showCamera(call)
    }))

    alert.addAction(UIAlertAction(title: promptLabelCancel, style: .cancel, handler: { (action: UIAlertAction) in
      self.call?.error("User cancelled photos app")
    }))

    self.setCenteredPopover(alert)
    self.bridge.viewController.present(alert, animated: true, completion: nil)
  }

  func showCamera(_ call: CAPPluginCall) {
    if self.bridge.isSimulator() || !UIImagePickerController.isSourceTypeAvailable(UIImagePickerController.SourceType.camera) {
      self.bridge.modulePrint(self, "Camera not available in simulator")
      self.bridge.alert("Camera Error", "Camera not available in Simulator")
      call.error("Camera not available while running in Simulator")
      return
    }

    AVCaptureDevice.requestAccess(for: .video) { granted in
        if granted {
          DispatchQueue.main.async {
            let presentationStyle = call.getString("presentationStyle")
            if presentationStyle != nil && presentationStyle == "popover" {
              self.configurePicker()
            } else {
              self.imagePicker!.modalPresentationStyle = .fullScreen
            }

            self.imagePicker!.sourceType = .camera

            if self.settings.direction.rawValue == "REAR" {
              if UIImagePickerController.isCameraDeviceAvailable(.rear) {
                self.imagePicker!.cameraDevice = .rear
              }
            } else if self.settings.direction.rawValue == "FRONT" {
              if UIImagePickerController.isCameraDeviceAvailable(.front) {
                self.imagePicker!.cameraDevice = .front
              }
            }

            self.bridge.viewController.present(self.imagePicker!, animated: true, completion: nil)
          }
        } else {
            call.error("User denied access to camera")
        }
    }
  }

  func showPhotos(_ call: CAPPluginCall) {
    let photoAuthorizationStatus = PHPhotoLibrary.authorizationStatus()
    if (photoAuthorizationStatus != PHAuthorizationStatus.authorized) {
      PHPhotoLibrary.requestAuthorization({ (status) in
        if (status != PHAuthorizationStatus.authorized) {
          call.error("User denied access to photos")
          return
        } else {
          DispatchQueue.main.async {
            self.presentPhotos()
          }
        }
      })
    } else {
      presentPhotos()
    }
  }

  private func presentPhotos() {
    self.configurePicker()
    self.imagePicker!.sourceType = .photoLibrary
    self.bridge.viewController.present(self.imagePicker!, animated: true, completion: nil)
  }

  private func configurePicker() {
    self.imagePicker!.modalPresentationStyle = .popover
    self.imagePicker!.popoverPresentationController?.delegate = self
    self.setCenteredPopover(self.imagePicker!)
  }

  public func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
    picker.dismiss(animated: true)
    self.call?.error("User cancelled photos app")
  }

  public func popoverPresentationControllerDidDismissPopover(_ popoverPresentationController: UIPopoverPresentationController) {
    self.call?.error("User cancelled photos app")
  }

  public func presentationControllerDidDismiss(_ presentationController: UIPresentationController) {
    self.call?.error("User cancelled photos app")
  }

  public func imagePickerController(_ picker: UIImagePickerController,
                                    didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
    var image: UIImage?
    var isEdited = false
    var isGallery = true

    if let editedImage = info[UIImagePickerController.InfoKey.editedImage] as? UIImage {
      // Use editedImage Here
      isEdited = true
      image = editedImage
    } else if let originalImage = info[UIImagePickerController.InfoKey.originalImage] as? UIImage {
      // Use originalImage Here
      image = originalImage
    }

    var imageMetadata: [AnyHashable: Any] = [:]
    if let photoMetadata = info[UIImagePickerController.InfoKey.mediaMetadata] as? [AnyHashable: Any] {
      imageMetadata = photoMetadata
      isGallery = false
    }
    if let asset = info[UIImagePickerController.InfoKey.phAsset] as? PHAsset {
      imageMetadata = getImageMeta(asset: asset)!
    }

    if settings.shouldResize {
      guard let convertedImage = resizeImage(image!, settings.preserveAspectRatio) else {
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
    
    if settings.saveToGallery {
      if !isGallery || isEdited {
        UIImageWriteToSavedPhotosAlbum(image!, nil, nil, nil);
      }
    }
    
    guard let jpeg = image!.jpegData(compressionQuality: CGFloat(settings.quality/100)) else {
      self.call?.error("Unable to convert image to jpeg")
      return
    }

    if settings.resultType == CameraResultType.base64.rawValue {
      let base64String = jpeg.base64EncodedString()

      self.call?.success([
        "base64String": base64String,
        "exif": makeExif(imageMetadata) ?? [:],
        "format": "jpeg"
      ])
    } else if settings.resultType == CameraResultType.DATA_URL.rawValue {
      let base64String = jpeg.base64EncodedString()

      self.call?.success([
        "dataUrl": "data:image/jpeg;base64," + base64String,
        "exif": makeExif(imageMetadata) ?? [:],
        "format": "jpeg"
      ])
    } else if settings.resultType == CameraResultType.uri.rawValue {
      let path = try! saveTemporaryImage(jpeg)
      guard let webPath = CAPFileManager.getPortablePath(host: bridge.getLocalUrl(), uri: URL(string: path)) else {
        call?.reject("Unable to get portable path to file")
        return
      }
      call?.success([
        "path": path,
        "exif": makeExif(imageMetadata) ?? [:],
        "webPath": webPath,
        "format": "jpeg"
      ])
    }

    picker.dismiss(animated: true, completion: nil)
  }

  func metadataFromImageData(data: NSData)-> [String: Any]? {
    let options = [kCGImageSourceShouldCache as String: kCFBooleanFalse]
    if let imgSrc = CGImageSourceCreateWithData(data, options as CFDictionary) {
      let metadata = CGImageSourceCopyPropertiesAtIndex(imgSrc, 0, options as CFDictionary) as! [String: Any]
      return metadata
    }
    return nil
  }

  func getImageMeta(asset: PHAsset) -> [String:Any]?{
    let options = PHImageRequestOptions()
    options.isSynchronous = true
    options.resizeMode = .none
    options.isNetworkAccessAllowed = false
    options.version = .current
    var meta:[String:Any]? = nil
    _ = PHCachingImageManager().requestImageData(for: asset, options: options) { (imageData, dataUTI, orientation, info) in
      if let data = imageData {
        meta = self.metadataFromImageData(data: data as NSData)
      }
    }
    return meta
  }

  func resizeImage(_ image: UIImage, _ preserveAspectRatio: Bool) -> UIImage? {
    if preserveAspectRatio {
      return resizeImagePreservingAspectRatio(image)
    }
    return resizeImageWithoutPreservingAspectRatio(image)
  }

  func resizeImageWithoutPreservingAspectRatio(_ image: UIImage) -> UIImage? {
    let isAspectScale = settings.width > 0 && settings.height == 0 || settings.height > 0 && settings.width == 0
    let aspect = Float(image.size.width / image.size.height);

    var size = CGSize.init(width: Int(settings.width), height: Int(settings.height))
    if isAspectScale {
      if settings.width > 0 {
        size = CGSize.init(width: Int(settings.width), height: Int(settings.width * (1/aspect)))
      } else if settings.height > 0 {
        size = CGSize.init(width: Int(settings.height * aspect), height: Int(settings.height))
      }
    }

    UIGraphicsBeginImageContextWithOptions(size, false, 1.0)
    image.draw(in: CGRect(origin: CGPoint.zero, size: size))

    let scaledImage = UIGraphicsGetImageFromCurrentImageContext()
    UIGraphicsEndImageContext()
    return scaledImage
  }

  func resizeImagePreservingAspectRatio(_ image: UIImage) -> UIImage? {
    let imageHeight = Float(image.size.height)
    let imageWidth = Float(image.size.width)

    // 0 is treated as 'no restriction'
    let maxHeight = settings.height == 0 ? imageHeight : settings.height
    let maxWidth = settings.width == 0 ? imageWidth : settings.width

    // resize with preserved aspect ratio
    var newWidth = min(imageWidth, maxWidth)
    var newHeight = (imageHeight * newWidth) / imageWidth
    if newHeight > maxHeight {
      newWidth = (imageWidth * maxHeight) / imageHeight
      newHeight = maxHeight
    }
    let size = CGSize.init(width: Int(newWidth), height: Int(newHeight))

    UIGraphicsBeginImageContextWithOptions(size, false, 1.0)
    image.draw(in: CGRect(origin: CGPoint.zero, size: size))

    let scaledImage = UIGraphicsGetImageFromCurrentImageContext()
    UIGraphicsEndImageContext()
    return scaledImage
  }

  func makeExif(_ exif: [AnyHashable:Any]?) -> [AnyHashable:Any]? {
    return exif?["{Exif}"] as? [AnyHashable:Any]
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
