// swift-tools-version: 6.3
import PackageDescription

let package = Package(
  name: "Capacitor",
  platforms: [.iOS(.v16)],
  products: [
    .library(
      name: "Capacitor",
      targets: ["Capacitor", "CapacitorObjC"]
    ),
    .library(
      name: "CapacitorCordova",
      targets: ["CapacitorCordova"]
    )
  ],
  targets: [
    // Pure ObjC core utilities (no dependencies)
    .target(
      name: "CapacitorC",
      publicHeadersPath: "include",
      cSettings: [
        .define("_FORTIFY_SOURCE", to: "2")
      ]
    ),

    // Pure Swift public API (depends on CapacitorC)
    .target(
      name: "Capacitor",
      dependencies: ["CapacitorC"],
      publicHeadersPath: "include"
    ),

    // Objective-C bridge layer (depends on Capacitor to import Swift headers)
    .target(
      name: "CapacitorObjC",
      dependencies: ["Capacitor"],
      publicHeadersPath: "include",
      cSettings: [
        .define("_FORTIFY_SOURCE", to: "2")
      ]
    ),

    // Cordova legacy ObjC target
    .target(
      name: "CapacitorCordova",
      publicHeadersPath: "include",
      cSettings: [
        .headerSearchPath("include"),
        .define("_FORTIFY_SOURCE", to: "2")
      ]
    )
  ],
  swiftLanguageModes: [.v6]
)
