// swift-tools-version: 6.3
import PackageDescription

let package = Package(
  name: "Capacitor",
  platforms: [.iOS(.v16)],
  products: [
    .library(
      name: "Capacitor",
      targets: ["Capacitor"]
    ),
    .library(
      name: "CapacitorCordova",
      targets: ["Cordova", "CapacitorCordova"]
    )
  ],
  targets: [
    .target(
      name: "Capacitor",
      resources: [.copy("assets")],
      swiftSettings: [
        .swiftLanguageMode(.v5)
      ],
    ),
    .target(
      name: "Cordova",
      publicHeadersPath: "include",
      cSettings: [
        .headerSearchPath("include"),
      ],
      linkerSettings: [
        .linkedFramework("UIKit"),
        .linkedFramework("WebKit"),
        .linkedFramework("MobileCoreServices"),
        .linkedFramework("CFNetwork")
      ]
    ),
    .target(
      name: "CapacitorCordova",
      dependencies: ["Capacitor", "Cordova"]
    ),
    .testTarget(
      name: "CapacitorTests",
      dependencies: [
        "Capacitor"
      ],
      resources: [
        .copy("Resources/configurations")
      ]
    )
  ],
  swiftLanguageModes: [.v5]
)
