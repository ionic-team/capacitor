import Foundation

internal protocol CAPBridgeDelegate: class {
    var bridgedWebView: WKWebView? { get }
    var bridgedViewController: UIViewController? { get }
}
