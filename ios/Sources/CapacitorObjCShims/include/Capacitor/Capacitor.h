#import <UIKit/UIKit.h>

//! Project version number for Capacitor.
FOUNDATION_EXPORT double CapacitorVersionNumber;

//! Project version string for Capacitor.
FOUNDATION_EXPORT const unsigned char CapacitorVersionString[];

#import <Capacitor/CAPPlugin.h>
#import <Capacitor/CAPPluginCall.h>
#import <Capacitor/CAPPluginCallResult.h>
#import <Capacitor/CAPBridgedPlugin.h>
#import <Capacitor/CAPPluginMethod.h>
#import <Capacitor/CAPBridgeProtocol.h>
#import <Capacitor/CAPBridgedJSTypes.h>

#if !__building_module(Capacitor)
@import Capacitor;
#endif
