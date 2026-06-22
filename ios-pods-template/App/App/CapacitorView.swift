import SwiftUI
import Capacitor

public struct CapacitorView: UIViewControllerRepresentable {
    public func makeUIViewController(context: Context) -> CAPBridgeViewController {
        CAPBridgeViewController()
    }
  
    public func updateUIViewController(_ vc: CAPBridgeViewController, context: Context) {}
}
