import Foundation
import Photos

@objc(Photos)
public class Photos : AVCPlugin {
  static let DEFAULT_QUANTITY = 25
  static let DEFAULT_TYPES = "photos"
  static let DEFAULT_THUMBNAIL_WIDTH = 256
  static let DEFAULT_THUMBNAIL_HEIGHT = 256
  
  var imageManager = PHCachingImageManager()
  
  func fetchResultAssetsToJs(_ call: AVCPluginCall, result: PHFetchResult<PHAsset>) {
    var assets: [JSObject] = []
    
    //let after = call.getString("after")
    let types = call.getString("types") ?? Photos.DEFAULT_TYPES
    let thumbnailWidth = call.getInt("thumbnailWidth", defaultValue: Photos.DEFAULT_THUMBNAIL_WIDTH)!
    let thumbnailHeight = call.getInt("thumbnailHeight", defaultValue: Photos.DEFAULT_THUMBNAIL_HEIGHT)!
    let thumbnailSize = CGSize(width: thumbnailWidth, height: thumbnailHeight)
    let thumbnailQuality = call.getInt("thumbnailQuality", defaultValue: 95)!
    
    let requestOptions = PHImageRequestOptions()
    requestOptions.isNetworkAccessAllowed = true
    requestOptions.version = .current
    requestOptions.deliveryMode = .opportunistic
    requestOptions.isSynchronous = true
    
    result.enumerateObjects({ (asset, count: Int, stop: UnsafeMutablePointer<ObjCBool>) in
      
      if asset.mediaType == .image && types == "videos" {
        return
      }
      if asset.mediaType == .video && types == "photos" {
        return
      }
      
      print("Got asset item", asset, count)
      var a = JSObject()

      self.imageManager.requestImage(for: asset, targetSize: thumbnailSize, contentMode: .aspectFill, options: requestOptions, resultHandler: { (fetchedImage, _) in
        guard let image = fetchedImage else {
          return
        }
        
        a["identifier"] = asset.localIdentifier
        
        // TODO: We need to know original type
        a["data"] = UIImageJPEGRepresentation(image, CGFloat(thumbnailQuality) / 100.0)?.base64EncodedString()
        
        if asset.creationDate != nil {
          a["createdAt"] = JSDate.toString(asset.creationDate!)
        }
        a["fullWidth"] = asset.pixelWidth
        a["fullHeight"] = asset.pixelHeight
        a["thumbnailWidth"] = image.size.width
        a["thumbnailHeight"] = image.size.height
        a["location"] = self.makeLocation(asset)

        assets.append(a)
      })
    })
    
    call.success([
      "photos": assets
    ])
  }

  @objc func getFullsizeUrls(_ call: AVCPluginCall) {
    /*
    guard let identifiers = call.getArray("identifiers") else {
      call.error("Must provide identifiers array")
      return
    }
    
    let fetchResult = PHAsset.fetchAssets(withLocalIdentifiers: identifiers, options: <#T##PHFetchOptions?#>)
    asset.requestContentEditingInput(with: PHContentEditingInputRequestOptions(), completionHandler: { (contentEditingInput, _) in
      a["url"] = contentEditingInput?.fullSizeImageURL ?? ""
    */
  }
  
  @objc func getPhotos(_ call: AVCPluginCall) {
    let quantity = call.getInt("quantity", defaultValue: Photos.DEFAULT_QUANTITY)!
    checkAuthorization(allowed: {
      var fetchResult: PHFetchResult<PHAsset>!
      let options = PHFetchOptions()
      options.fetchLimit = quantity
      options.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: true)]
      fetchResult = PHAsset.fetchAssets(with: options)
      
      self.fetchResultAssetsToJs(call,
                                 result: fetchResult)
    }, notAllowed: {
      call.error("Access to photos not allowed by user")
    })

  }
  
  @objc func saveToPhotos(_ call: AVCPluginCall) {
    guard let path = call.getString("path") else {
      call.error("Must provide a path")
      return
    }
  }

  func checkAuthorization(allowed: @escaping () -> Void, notAllowed: @escaping () -> Void) {
    let status = PHPhotoLibrary.authorizationStatus()
    if status == PHAuthorizationStatus.authorized {
      allowed()
    } else {
      PHPhotoLibrary.requestAuthorization({ (newStatus) in
        if newStatus == PHAuthorizationStatus.authorized {
          allowed()
        } else {
          notAllowed()
        }
      })
    }
  }
  
  func makeLocation(_ asset: PHAsset) -> JSObject {
    var loc = JSObject()
    guard let location = asset.location else {
      return loc
    }
    
    loc["latitude"] = location.coordinate.latitude
    loc["longitude"] = location.coordinate.longitude
    loc["altitude"] = location.altitude
    loc["heading"] = location.course
    loc["speed"] = location.speed
    return loc
  }
  
  /*
  deinit {
    PHPhotoLibrary.shared().unregisterChangeObserver(self)
  }
 */
}


