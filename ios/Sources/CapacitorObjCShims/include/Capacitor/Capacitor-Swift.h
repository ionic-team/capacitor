// SPM shim. When Capacitor is built from source via SPM, the Swift module's generated
// `Capacitor-Swift.h` is not exposed to external consumers at `<Capacitor/Capacitor-Swift.h>`.
// This shim provides that import path and surfaces the Swift Objective-C interface via a module
// import. Under CocoaPods the real generated header is used instead, so this file is excluded
// from the pod (see Capacitor.podspec).
#if !__building_module(Capacitor)
@import Capacitor;
#endif
