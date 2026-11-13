// SPM-only shim. Under CocoaPods, Capacitor is one mixed-language module and the compiler
// generates a real <Capacitor/Capacitor-Swift.h> exposing the Swift interface to Objective-C; this
// file is excluded from the pod so it can't clobber it (see Capacitor.podspec).
//
// Under SPM the Swift module is separate and its generated header is not reachable at that path, so
// this shim provides the import path and surfaces the same interface via a module import.
#if !__building_module(Capacitor)
@import Capacitor;
#endif
