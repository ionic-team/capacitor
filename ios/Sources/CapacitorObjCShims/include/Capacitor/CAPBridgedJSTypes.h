// Surfaces the Swift-defined `BridgedJSValueContainerImplementation` protocol and the
// CAPPluginCall value accessors (`getString:defaultValue:`, `getBool:defaultValue:`, etc.)
// to Objective-C consumers. The declarations live in the Swift `Capacitor` module as an
// `@objc` protocol and an `@objc` extension on CAPPluginCall; this header just re-exposes
// them at the historical `<Capacitor/CAPBridgedJSTypes.h>` import path.

#import <Foundation/Foundation.h>
#import <Capacitor/CAPPluginCall.h>

#if !__building_module(Capacitor)
@import Capacitor;
#endif
