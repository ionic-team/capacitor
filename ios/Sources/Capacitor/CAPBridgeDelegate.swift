import Foundation
import WebKit

public protocol CAPBridgeDelegate: AnyObject {
    var bridgedWebView: WKWebView? { get }
    var bridgedViewController: UIViewController? { get }
}
