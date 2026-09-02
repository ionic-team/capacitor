// The Objective-C base classes (CAPPlugin, CAPPluginCall, CAPPluginMethod, CAPBridgedPlugin,
// CAPInstanceDescriptor, CAPInstanceConfiguration) live in the CapacitorObjC target so that they
// compile before the Swift module that subclasses and extends them. Re-export them so the rest of
// this module — and downstream `import Capacitor` consumers — keep seeing these symbols without an
// explicit `import CapacitorObjC`.
//
// Under CocoaPods all of these sources are compiled into a single Capacitor module, so there is no
// CapacitorObjC module to import and the re-export is unnecessary.
#if SWIFT_PACKAGE
@_exported import CapacitorObjC
#endif
