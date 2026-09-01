// Forward declaration only. The full `CAPBridgeProtocol` is defined in the Swift `Capacitor`
// module (surfaced to Objective-C via `Capacitor-Swift.h` / `@import Capacitor`). Declaring it
// here lets `CAPPlugin`'s `bridge` property be typed `id<CAPBridgeProtocol>` without the
// `CapacitorObjC` target having to depend on Swift.
@protocol CAPBridgeProtocol;
