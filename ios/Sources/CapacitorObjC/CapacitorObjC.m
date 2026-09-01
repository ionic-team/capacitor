// This target vends Objective-C plugin-authoring macros through its headers and has no other
// implementation. This translation unit exists so the target produces an object file: when the
// Capacitor product is linked into an Xcode app target, the build system expects every member
// target (including CapacitorObjC) to emit a `.o`, and a headers-only target produces none.
#import <Foundation/Foundation.h>
