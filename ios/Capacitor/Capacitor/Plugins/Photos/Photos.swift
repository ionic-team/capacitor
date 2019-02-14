import Foundation
import Photos

@objc(CAPPhotosPlugin)
public class CAPPhotosPlugin : CAPPlugin {
  static let DEFAULT_QUANTITY = 25
  static let DEFAULT_TYPES = "photos"
  static let DEFAULT_THUMBNAIL_WIDTH = 256
  static let DEFAULT_THUMBNAIL_HEIGHT = 256
  
  // Must be lazy here because it will prompt for permissions on instantiation without it
  lazy var imageManager = PHCachingImageManager()
  
  @objc func getAlbums(_ call: CAPPluginCall) {
    checkAuthorization(allowed: {
      self.fetchAlbumsToJs(call)
    }, notAllowed: {
      call.error("Access to photos not allowed by user")
    })
  }
  
  @objc func getPhotos(_ call: CAPPluginCall) {
    checkAuthorization(allowed: {
      self.fetchResultAssetsToJs(call)
    }, notAllowed: {
      call.error("Access to photos not allowed by user")
    })
  }
  
  @objc func createAlbum(_ call: CAPPluginCall) {
    guard let name = call.getString("name") else {
      call.error("Must provide a name")
      return
    }
    
    checkAuthorization(allowed: {
      PHPhotoLibrary.shared().performChanges({
        PHAssetCollectionChangeRequest.creationRequestForAssetCollection(withTitle: name)
      }, completionHandler: { success, error in
        if !success {
          call.error("Unable to create album", error)
          return
        }
        call.success()
      })
    }, notAllowed: {
      call.error("Access to photos not allowed by user")
    })
  }
  
  @objc func savePhoto(_ call: CAPPluginCall) {
    guard let data = call.getString("data") else {
      call.error("Must provide data as base64 encoded string")
      return
    }
    
    let albumId = call.getString("albumIdentifier")
    
    let dataDecoded : Data = Data(base64Encoded: data, options: .ignoreUnknownCharacters)!
    guard let image = UIImage(data: dataDecoded) else {
      call.error("Unable to load image from base64 data")
      return
    }

    var targetCollection: PHAssetCollection?

    if albumId != nil {
      let albumFetchResult = PHAssetCollection.fetchAssetCollections(withLocalIdentifiers: [albumId!], options: nil)
      albumFetchResult.enumerateObjects({ (collection, count, _) in
        targetCollection = collection
      })
      if targetCollection == nil {
        call.error("Unable to find that album")
        return
      }
      if !targetCollection!.canPerform(.addContent) {
        call.error("Album doesn't support adding content (is this a smart album?)")
        return
      }
    }
    
    checkAuthorization(allowed: {
      // Add it to the photo library.
      PHPhotoLibrary.shared().performChanges({
        let creationRequest = PHAssetChangeRequest.creationRequestForAsset(from: image)
        
        if let collection = targetCollection {
          let addAssetRequest = PHAssetCollectionChangeRequest(for: collection)
          addAssetRequest?.addAssets([creationRequest.placeholderForCreatedAsset!] as NSArray)
        }
      }, completionHandler: {success, error in
        if !success {
          call.error("Unable to save image to album", error)
        } else {
          call.success()
        }
      })
    }, notAllowed: {
      call.error("Access to photos not allowed by user")
    })
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
  
  func fetchAlbumsToJs(_ call: CAPPluginCall) {
    var albums = [JSObject]()
    
    let loadSharedAlbums = call.getBool("loadShared", false)!
    
    // Load our smart albums
    var fetchResult = PHAssetCollection.fetchAssetCollections(with: .smartAlbum, subtype: .albumRegular, options: nil)
    fetchResult.enumerateObjects({ (collection, count, stop: UnsafeMutablePointer<ObjCBool>) in
      var o = JSObject()
      o["name"] = collection.localizedTitle
      o["identifier"] = collection.localIdentifier
      o["type"] = "smart"
      albums.append(o)
    })
    
    if loadSharedAlbums {
      fetchResult = PHAssetCollection.fetchAssetCollections(with: .album, subtype: .albumCloudShared, options: nil)
      fetchResult.enumerateObjects({ (collection, count, stop: UnsafeMutablePointer<ObjCBool>) in
        var o = JSObject()
        o["name"] = collection.localizedTitle
        o["identifier"] = collection.localIdentifier
        o["type"] = "shared"
        albums.append(o)
      })
    }
    
    // Load our user albums
    PHCollectionList.fetchTopLevelUserCollections(with: nil).enumerateObjects({ (collection, count, stop: UnsafeMutablePointer<ObjCBool>) in
      var o = JSObject()
      o["name"] = collection.localizedTitle
      o["identifier"] = collection.localIdentifier
      o["type"] = "user"
      albums.append(o)
    })
    
    call.success([
      "albums": albums
    ])
  }
  
  func fetchResultAssetsToJs(_ call: CAPPluginCall) {
    var assets: [JSObject] = []
    
    let albumId = call.getString("albumIdentifier")

    let quantity = call.getInt("quantity", CAPPhotosPlugin.DEFAULT_QUANTITY)!
    
    var targetCollection: PHAssetCollection?
    
    let options = PHFetchOptions()
    options.fetchLimit = quantity
    options.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: true)]
    
    if albumId != nil {
      let albumFetchResult = PHAssetCollection.fetchAssetCollections(withLocalIdentifiers: [albumId!], options: nil)
      albumFetchResult.enumerateObjects({ (collection, count, _) in
        targetCollection = collection
      })
    }
    
    var fetchResult: PHFetchResult<PHAsset>;
    if targetCollection != nil {
      fetchResult = PHAsset.fetchAssets(in: targetCollection!, options: options)
    } else {
      fetchResult = PHAsset.fetchAssets(with: options)
    }
    
    //let after = call.getString("after")

    let types = call.getString("types") ?? CAPPhotosPlugin.DEFAULT_TYPES
    let thumbnailWidth = call.getInt("thumbnailWidth", CAPPhotosPlugin.DEFAULT_THUMBNAIL_WIDTH)!
    let thumbnailHeight = call.getInt("thumbnailHeight", CAPPhotosPlugin.DEFAULT_THUMBNAIL_HEIGHT)!
    let thumbnailSize = CGSize(width: thumbnailWidth, height: thumbnailHeight)
    let thumbnailQuality = call.getInt("thumbnailQuality", 95)!
    
    let requestOptions = PHImageRequestOptions()
    requestOptions.isNetworkAccessAllowed = true
    requestOptions.version = .current
    requestOptions.deliveryMode = .opportunistic
    requestOptions.isSynchronous = true
    
    fetchResult.enumerateObjects({ (asset, count: Int, stop: UnsafeMutablePointer<ObjCBool>) in
      
      if asset.mediaType == .image && types == "videos" {
        return
      }
      if asset.mediaType == .video && types == "photos" {
        return
      }
      
      var a = JSObject()
      
      self.imageManager.requestImage(for: asset, targetSize: thumbnailSize, contentMode: .aspectFill, options: requestOptions, resultHandler: { (fetchedImage, _) in
        guard let image = fetchedImage else {
          return
        }
        
        a["identifier"] = asset.localIdentifier
        
        // TODO: We need to know original type
        a["data"] = image.jpegData(compressionQuality: CGFloat(thumbnailQuality) / 100.0)?.base64EncodedString()
        
        if asset.creationDate != nil {
          a["creationDate"] = JSDate.toString(asset.creationDate!)
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


