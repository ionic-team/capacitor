// The Objective-C base classes (`CAPPlugin`, `CAPPluginCall`, `CAPPluginMethod`,
// `CAPBridgedPlugin`, `CAPPluginCallResult`/`CAPPluginCallError`) live in the `CapacitorObjC` target
// so that unmodified Objective-C plugins can subclass them across SPM source modules. Re-export them
// so the rest of the `Capacitor` module — and downstream `import Capacitor` consumers — keep seeing
// these symbols without an explicit `import CapacitorObjC`.
//
// Under CocoaPods the same sources are compiled into a single `Capacitor` module (there is no
// separate `CapacitorObjC` module), so the import is only needed for the SPM build.
#if SWIFT_PACKAGE
@_exported import CapacitorObjC
#endif

public typealias PluginCallResultData = [String: Any]
