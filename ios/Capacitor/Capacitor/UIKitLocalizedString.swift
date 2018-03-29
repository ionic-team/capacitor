import Foundation

public struct UIKitLocalizedString {
    
    public static func forKey(_ key: String) -> String {
        
        guard let bundle = Bundle(identifier: "com.apple.UIKit") else { return key}
        
        let localizedString = bundle.localizedString(forKey: key, value: nil, table: nil)
        
        return localizedString
        
    }
    
}

extension UIKitLocalizedString {
    
    public static var ok: String {
        return UIKitLocalizedString.forKey("OK")
    }
    
    public static var cancel: String {
        return UIKitLocalizedString.forKey("Cancel")
    }
    
    public static var camera: String {
        return UIKitLocalizedString.forKey("Camera")
    }
    
    public static var photoLibrary: String {
        return UIKitLocalizedString.forKey("Photo Library")
    }

}
