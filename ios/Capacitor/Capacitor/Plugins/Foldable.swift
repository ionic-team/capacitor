import Foundation
import ObjectiveC
import UIKit

@objc(CAPFoldablePlugin)
public class CAPFoldablePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CAPFoldablePlugin"
    public let jsName = "Foldable"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isFoldable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getFoldState", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getHingeAngle", returnType: CAPPluginReturnPromise)
    ]

    private lazy var source: HingeSource = MainActor.assumeIsolated { HingeSource() }
    private var lastFoldState: NSDictionary?
    private var lastAngle: Double?

    @objc override public func load() {
        DispatchQueue.main.async { [weak self] in
            guard let self = self, let view = self.bridge?.viewController?.view else { return }
            MainActor.assumeIsolated {
                self.source.observe(view) { [weak self] in
                    self?.notifyFoldStateIfChanged()
                    self?.notifyAngleIfChanged()
                }
            }
        }
    }

    @objc func isFoldable(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            MainActor.assumeIsolated {
                call.resolve(["foldable": self?.source.isFoldable(in: self?.bridge?.viewController?.view) ?? false])
            }
        }
    }

    @objc func getFoldState(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            MainActor.assumeIsolated {
                call.resolve(self?.source.foldState(in: self?.bridge?.viewController?.view) ?? HingeSource.flatState)
            }
        }
    }

    @objc func getHingeAngle(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            MainActor.assumeIsolated {
                call.resolve(["angle": self?.source.angle as Any? ?? NSNull()])
            }
        }
    }

    @MainActor
    private func notifyFoldStateIfChanged() {
        let state = source.foldState(in: bridge?.viewController?.view) as NSDictionary
        guard state != lastFoldState else { return }

        lastFoldState = state
        notifyListeners("foldStateChange", data: state as? [String: Any] ?? [:])
    }

    @MainActor
    private func notifyAngleIfChanged() {
        let angle = source.angle
        guard angle != lastAngle else { return }

        lastAngle = angle
        notifyListeners("hingeAngleChange", data: ["angle": angle as Any? ?? NSNull()])
    }
}

/// Reads the fold from UIKit.
///
/// The hinge and reserved-region APIs arrived in the iOS 27.1 SDK. An app built
/// against an older SDK cannot name those symbols at compile time, so they are
/// reached through the Objective-C runtime instead. They are the same public
/// APIs either way, and an app built with 27.1 or later takes the typed path.
@MainActor
final class HingeSource {
    static let flatState: [String: Any] = ["state": "flat", "isSeparating": false, "posture": "flat"]

    /// UIKit reports `closed` while the device is already opening, so the angle
    /// decides whenever it is known.
    private static let foldedAngles = 20.0...160.0

    private weak var view: UIView?
    private var interaction: NSObject?
    private var status: Int?
    private var radians: Double?

    private struct Region {
        let kind: String
        let frame: CGRect
        let isActive: Bool
    }

    var angle: Double? {
        guard let radians = radians, let status = status, status != 0 else { return nil }
        return radians * 180 / .pi
    }

    func isFoldable(in view: UIView?) -> Bool {
        if let status = status, status != 0 { return true }
        guard let view = view else { return false }
        return !regions(in: view).filter { $0.kind == "division" }.isEmpty
    }

    func foldState(in view: UIView?) -> [String: Any] {
        guard let view = view, isFoldable(in: view) else { return HingeSource.flatState }

        let regions = regions(in: view)
        let closed = angle.map { $0 < HingeSource.foldedAngles.lowerBound } ?? (status == 1)
        let divisions = closed ? [] : regions.filter { $0.kind == "division" }
        let division = divisions.first { $0.isActive } ?? divisions.first

        let folded: Bool
        if let angle = angle, division != nil {
            folded = HingeSource.foldedAngles.contains(angle)
        } else if status == 2 {
            folded = division != nil
        } else if status == 3 {
            folded = false
        } else {
            folded = division?.isActive == true
        }

        var state: [String: Any] = [
            "state": folded ? "half-opened" : "flat",
            "isSeparating": folded,
            "posture": "flat"
        ]

        if folded, let division = division {
            let vertical = division.frame.height >= division.frame.width
            state["posture"] = vertical ? "book" : "tabletop"
            state["hingeOrientation"] = vertical ? "vertical" : "horizontal"
            state["hingeBounds"] = [
                "x": Double(division.frame.minX),
                "y": Double(division.frame.minY),
                "width": Double(division.frame.width),
                "height": Double(division.frame.height)
            ]
        }

        if status != nil {
            let onInner = regions.contains { $0.kind == "division" }
            state["activeDisplay"] = (closed || !onInner) ? "outer" : "inner"
        }

        return state
    }

    func observe(_ view: UIView, onChange: @escaping () -> Void) {
        self.view = view
        guard let interactionClass = NSClassFromString("UIHingeInteraction") as? NSObject.Type else { return }

        let handler: @convention(block) (AnyObject?, AnyObject?) -> Void = { [weak self] _, update in
            MainActor.assumeIsolated {
                self?.read(update)
                onChange()
            }
        }
        let interaction = interactionClass
            .perform(Selector(("alloc")))?
            .takeUnretainedValue()
            .perform(Selector(("initWithUpdateHandler:")), with: handler)?
            .takeUnretainedValue() as? NSObject
        guard let interaction = interaction else { return }

        view.perform(Selector(("addInteraction:")), with: interaction)
        self.interaction = interaction
    }

    private func read(_ update: AnyObject?) {
        guard let hinge = update?.value(forKey: "hinge") as AnyObject? else {
            status = nil
            radians = nil
            return
        }
        status = (hinge.value(forKey: "status") as? NSNumber)?.intValue
        radians = (hinge.value(forKey: "angle") as? NSNumber)?.doubleValue
    }

    /// A flat device reports its fold as inactive, so inactive regions are kept.
    private func regions(in view: UIView) -> [Region] {
        let selector = Selector(("reservedRegionsOfKind:options:"))
        guard view.responds(to: selector),
              let kindClass: AnyClass = NSClassFromString("UIViewReservedRegionKind"),
              let method = view.method(for: selector) else { return [] }

        typealias Call = @convention(c) (AnyObject, Selector, AnyObject, UInt) -> AnyObject?
        let call = unsafeBitCast(method, to: Call.self)

        return ["division", "occlusion"].flatMap { name -> [Region] in
            guard let kind = HingeSource.kind(kindClass, "\(name)RegionKind"),
                  let found = call(view, selector, kind, 1) as? [AnyObject] else { return [] }

            return found.map { region in
                Region(
                    kind: name,
                    frame: (region.value(forKey: "frame") as? NSValue)?.cgRectValue ?? .zero,
                    isActive: (region.value(forKey: "isActive") as? NSNumber)?.boolValue ?? false
                )
            }
        }
    }

    nonisolated private static func kind(_ owner: AnyClass, _ name: String) -> AnyObject? {
        let selector = Selector((name))
        guard owner.responds(to: selector) else { return nil }
        return (owner as AnyObject).perform(selector)?.takeUnretainedValue()
    }
}
