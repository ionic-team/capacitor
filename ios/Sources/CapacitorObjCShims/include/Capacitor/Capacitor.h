#import <UIKit/UIKit.h>

//! Project version number for bridge.
FOUNDATION_EXPORT double CapacitorVersionNumber;

//! Project version string for bridge.
FOUNDATION_EXPORT const unsigned char CapacitorVersionString[];

#import <Capacitor/CAPPlugin.h>
#import <Capacitor/CAPPluginCall.h>
#import <Capacitor/CAPBridgedPlugin.h>
#import <Capacitor/CAPPluginMethod.h>
#import <Capacitor/CAPInstanceDescriptor.h>
#import <Capacitor/CAPInstanceConfiguration.h>

// Several CAPPlugin members (bridge, getConfig, notifyListeners:, checkPermissions:, ...) are vended
// from Swift, so importing the module here keeps the umbrella a complete view of CAPPlugin for
// Objective-C plugin authors. Skipped while the module itself is being built, which is the only
// case where this would be circular.
#if !__building_module(Capacitor)
@import Capacitor;
#endif

