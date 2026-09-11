import Foundation
import UIKit
import WebKit

/**
 Exposes native display metadata that web content cannot read from CSS alone.

 WKWebView already gives web content `env(safe-area-inset-*)` and resizes with
 the window, so basic layout adaptation on iPhone Duo does NOT require this
 plugin. What CSS cannot express is *why* the layout changed: which size class
 is active (the HIG's primary signal for the outer vs. inner display), whether
 the device is partially folded, and where the folding region or an active
 camera region sits. This plugin exposes that data and emits
 `displayFeaturesChanged` when it changes.

 Pose and reserved-region values come from a `DisplayFeaturesProvider`. The
 default provider reports `supported == false` because the iOS 27.1 SDK that
 ships the iPhone Duo reserved-region APIs is not public yet (Apple's developer
 page lists the Xcode 27.1 beta as "coming later this month", September 2026).
 Size classes, safe-area insets and bounds are real values on every iOS device.
 */
@objc(CAPDisplayFeaturesPlugin)
public class CAPDisplayFeaturesPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CAPDisplayFeaturesPlugin"
    public let jsName = "DisplayFeatures"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getDisplayFeatures", returnType: CAPPluginReturnPromise)
    ]

    static let changedEvent = "displayFeaturesChanged"

    /// Source of pose / reserved-region data. Replace with a provider backed by
    /// the iOS 27.1 SDK once its headers are available; see the note above.
    var provider: DisplayFeaturesProvider = UnsupportedDisplayFeaturesProvider()

    private var lastSnapshot: [String: Any]?
    private var orientationObserver: NSObjectProtocol?
    private var unregisterTraitChanges: (() -> Void)?

    @objc override public func load() {
        DispatchQueue.main.async { [weak self] in
            self?.startObserving()
        }
    }

    deinit {
        stopObserving()
    }

    @objc func getDisplayFeatures(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                return
            }

            let snapshot = self.snapshot()
            self.lastSnapshot = snapshot
            call.resolve(snapshot)
        }
    }

    // MARK: - Change observation

    private func startObserving() {
        guard let view = observedView else {
            return
        }

        // Size classes are the HIG's primary signal for which iPhone Duo display
        // is active (compact width = outer, regular width = inner), so a trait
        // change is the closest existing hook for fold / unfold.
        if #available(iOS 17.0, *) {
            let traits: [UITrait] = [UITraitHorizontalSizeClass.self, UITraitVerticalSizeClass.self]
            let registration = view.registerForTraitChanges(traits) { [weak self] (_: UIView, _: UITraitCollection) in
                self?.notifyIfChanged()
            }
            unregisterTraitChanges = { [weak view] in
                view?.unregisterForTraitChanges(registration)
            }
        }

        UIDevice.current.beginGeneratingDeviceOrientationNotifications()
        orientationObserver = NotificationCenter.default.addObserver(
            forName: UIDevice.orientationDidChangeNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.notifyIfChanged()
        }

        lastSnapshot = snapshot()
    }

    private func stopObserving() {
        if let observer = orientationObserver {
            NotificationCenter.default.removeObserver(observer)
            orientationObserver = nil
            UIDevice.current.endGeneratingDeviceOrientationNotifications()
        }

        // `deinit` may run off the main thread; never capture `self` here.
        let unregister = unregisterTraitChanges
        unregisterTraitChanges = nil
        if Thread.isMainThread {
            unregister?()
        } else {
            DispatchQueue.main.async {
                unregister?()
            }
        }
    }

    private func notifyIfChanged() {
        let current = snapshot()
        let previous = lastSnapshot
        lastSnapshot = current

        if let previous = previous, (previous as NSDictionary).isEqual(to: current) {
            return
        }

        if hasListeners(CAPDisplayFeaturesPlugin.changedEvent) {
            notifyListeners(CAPDisplayFeaturesPlugin.changedEvent, data: current)
        }
    }

    // MARK: - Snapshot

    private var observedView: UIView? {
        return bridge?.webView ?? bridge?.viewController?.view
    }

    private func snapshot() -> [String: Any] {
        let view = observedView
        let traits = view?.traitCollection ?? UITraitCollection.current
        let insets = view?.safeAreaInsets ?? .zero
        let size = view?.bounds.size ?? .zero
        let native = provider.currentFeatures(for: view)

        return [
            "supported": native.supported,
            "pose": native.pose.rawValue,
            "activeDisplay": native.activeDisplay.rawValue,
            "horizontalSizeClass": sizeClassName(traits.horizontalSizeClass),
            "verticalSizeClass": sizeClassName(traits.verticalSizeClass),
            "reservedRegions": native.reservedRegions.map { region -> [String: Any] in
                return [
                    "type": region.type.rawValue,
                    "rect": [
                        "x": Double(region.rect.origin.x),
                        "y": Double(region.rect.origin.y),
                        "width": Double(region.rect.size.width),
                        "height": Double(region.rect.size.height)
                    ]
                ]
            },
            "safeAreaInsets": [
                "top": Double(insets.top),
                "left": Double(insets.left),
                "bottom": Double(insets.bottom),
                "right": Double(insets.right)
            ],
            "bounds": [
                "width": Double(size.width),
                "height": Double(size.height)
            ]
        ]
    }

    private func sizeClassName(_ sizeClass: UIUserInterfaceSizeClass) -> String {
        switch sizeClass {
        case .compact:
            return "compact"
        case .regular:
            return "regular"
        case .unspecified:
            return "unspecified"
        @unknown default:
            return "unspecified"
        }
    }
}

// MARK: - Provider

/// The physical pose of a foldable / dual-display device.
enum DisplayPose: String {
    case closed
    case open
    case partiallyOpen
    case unknown
}

/// Which display of a dual-display device is currently presenting the app.
enum ActiveDisplay: String {
    case inner
    case outer
    case unknown
}

/// The reserved regions named in Apple's "Designing for iPhone Duo" HIG.
enum ReservedRegionType: String {
    case outerCamera
    case innerCamera
    case fold
}

struct ReservedRegion {
    let type: ReservedRegionType
    /// In the observed view's coordinate space (points == CSS px).
    let rect: CGRect
}

struct NativeDisplayFeatures {
    let supported: Bool
    let pose: DisplayPose
    let activeDisplay: ActiveDisplay
    let reservedRegions: [ReservedRegion]

    static let unsupported = NativeDisplayFeatures(
        supported: false,
        pose: .unknown,
        activeDisplay: .unknown,
        reservedRegions: []
    )
}

/// Supplies pose and reserved-region data for the current device / OS.
protocol DisplayFeaturesProvider {
    func currentFeatures(for view: UIView?) -> NativeDisplayFeatures
}

/// Default provider for SDKs without reserved-region APIs. It never guesses:
/// `supported` is `false`, the pose is `unknown` and there are no regions.
///
/// TODO(iOS 27.1 SDK): add a provider that reads the reserved-region and pose
/// APIs referenced by the iPhone Duo HIG once the SDK is public, and select it
/// with an `#available` check. Symbol names are deliberately not guessed here.
struct UnsupportedDisplayFeaturesProvider: DisplayFeaturesProvider {
    func currentFeatures(for view: UIView?) -> NativeDisplayFeatures {
        return .unsupported
    }
}
