import AVFoundation
import UIKit

public class CameraViewController : UIViewController, AVCapturePhotoCaptureDelegate {
  public enum CameraOrientation {
    case fron
    case rear
  }
  
  public enum FlashMode {
    case on
    case auto
    case off
  }
  
  public enum VideoQuality {
    case high
    case medium
    case low
    case r352x288
    case r640x480
    case r1280x720
    case r1920x1080
    case r3840x2160
    case i960x540
    case i1280x720
  }
  
  var videoQuality : VideoQuality = .high
  var cameraOrientation: CameraOrientation = .rear
  var flashMode: FlashMode = .auto
  
  var session = AVCaptureSession()
  var stillImageOutput: AVCapturePhotoOutput?
  var videoPreviewLayer: AVCaptureVideoPreviewLayer?
  
  
  @IBOutlet weak var previewView: UIView!
  @IBOutlet weak var captureButton: UIButton!
  @IBOutlet weak var lastImageView: UIImageView!
  
  @IBAction func takePicture(_ sender: Any) {
    print("Taking picture")
    let settings = AVCapturePhotoSettings()
    
    stillImageOutput?.capturePhoto(with: settings, delegate: self)
  }

  public func photoOutput(_ output: AVCapturePhotoOutput,
                            didFinishProcessingPhoto photo: AVCapturePhoto,
                            error: Error?) {
    print("Captured", output)
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
