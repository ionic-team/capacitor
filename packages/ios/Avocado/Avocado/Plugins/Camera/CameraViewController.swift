import AVFoundation
import UIKit

public class CameraViewController : UIViewController, AVCapturePhotoCaptureDelegate {
  var call: PluginCall?

  var session = AVCaptureSession()
  var stillImageOutput: AVCapturePhotoOutput?
  var videoPreviewLayer: AVCaptureVideoPreviewLayer?
  
  @IBOutlet weak var previewView: UIView!
  @IBOutlet weak var captureButton: UIButton!
  @IBOutlet weak var lastImageView: UIImageView!
  
  func setPluginCall(_ call: PluginCall) {
    self.call = call
  }
  
  func getFlashMode() -> AVCaptureDevice.FlashMode {
    let flashMode = call?.get("flashMode", "off") as! String
    return [
      "off": AVCaptureDevice.FlashMode.off,
      "on": AVCaptureDevice.FlashMode.on,
      "auto": AVCaptureDevice.FlashMode.auto
      ][flashMode] ?? AVCaptureDevice.FlashMode.off
  }
  
  // Action outlet for the capture button
  @IBAction func takePicture(_ sender: Any) {
    let settings = AVCapturePhotoSettings.init(format: [AVVideoCodecKey: AVVideoCodecType.jpeg])
    settings.isAutoStillImageStabilizationEnabled = true
    settings.flashMode = getFlashMode()
    stillImageOutput?.capturePhoto(with: settings, delegate: self)
  }

  public func photoOutput(_ output: AVCapturePhotoOutput,
                            didFinishProcessingPhoto photo: AVCapturePhoto,
                            error: Error?) {
    // Check if there is any error in capturing
    guard error == nil else {
      print("Fail to capture photo: \(String(describing: error))")
      return
    }
    
    // Check if the pixel buffer could be converted to image data
    guard let imageData = photo.fileDataRepresentation() else {
      print("Fail to convert pixel buffer")
      return
    }
    
    // Check if UIImage could be initialized with image data
    guard let capturedImage = UIImage.init(data: imageData , scale: 1.0) else {
      print("Fail to convert image data to UIImage")
      return
    }
    
    // Grab options
    let saveToAlbum = self.call?.options["saveToPhotos"] as? Bool ?? false
    let quality = self.call?.options["quality"] as? Float ?? 100
    
    // Get original image width/height
    let imgWidth = capturedImage.size.width
    let imgHeight = capturedImage.size.height
    // Get origin of cropped image
    let imgOrigin = CGPoint(x: (imgWidth - imgHeight)/2, y: (imgHeight - imgHeight)/2)
    // Get size of cropped image
    let imgSize = CGSize(width: imgHeight, height: imgHeight)
    
    // Check if image could be cropped successfully
    guard let imageRef = capturedImage.cgImage?.cropping(to: CGRect(origin: imgOrigin, size: imgSize)) else {
      print("Fail to crop image")
      return
    }
    
    // Convert cropped image ref to UIImage
    let imageToSave = UIImage(cgImage: imageRef, scale: 1.0, orientation: .down)
    
    if saveToAlbum {
      UIImageWriteToSavedPhotosAlbum(imageToSave, nil, nil, nil)
    }
    
    lastImageView.image = imageToSave
    
    guard let jpeg = UIImageJPEGRepresentation(imageToSave, CGFloat(quality/100)) else {
      print("Unable to convert image to jpeg")
      call?.error("Unable to convert image to jpeg")
      return
    }
    
    let base64String = jpeg.base64EncodedString()
    
    call?.success([
      "base64_data": base64String,
      "format": "jpeg"
    ])
    
    // Stop video capturing session (Freeze preview)
    session.stopRunning()
  }
  
  override public func viewDidLoad() {
    super.viewDidLoad()
  }
  
  override public func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    
    session.sessionPreset = AVCaptureSession.Preset.photo
    
    guard let backCamera = AVCaptureDevice.default(for: AVMediaType.video) else {
      print("Unable to get capture device")
      return
    }
    
    var error: NSError?
    var input: AVCaptureDeviceInput!
    
    do {
      input = try AVCaptureDeviceInput(device: backCamera)
    } catch {
      print(error.localizedDescription)
      return
    }
    
    if session.canAddInput(input) {
      session.addInput(input)
      stillImageOutput = AVCapturePhotoOutput()
      
      //stillImageOutput?. = [AVVideoCodecKey: AVVideoCodecJPEG]
      if session.canAddOutput(stillImageOutput!) {
        session.addOutput(stillImageOutput!)
        videoPreviewLayer = AVCaptureVideoPreviewLayer(session: session)
        videoPreviewLayer!.videoGravity = AVLayerVideoGravity.resizeAspect
        videoPreviewLayer!.connection?.videoOrientation = AVCaptureVideoOrientation.portrait
        previewView.layer.addSublayer(videoPreviewLayer!)
        session.startRunning()
      }
    }
  }
  
  override public func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    
    guard let previewLayer = videoPreviewLayer else {
      print("No preview layer available on camera appear")
      return
    }
    
    previewLayer.frame = previewView.bounds
  }
  
}
