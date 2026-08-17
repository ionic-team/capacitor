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
      targets: ["CapacitorCordova"]
    )
  ],
  dependencies: [
    .package(url: "https://github.com/swiftlang/swift-testing.git", from: "0.0.0")
  ],
  targets: [
    .target(
      name: "Capacitor",
      resources: [.copy("assets")],
      swiftSettings: [
        .swiftLanguageMode(.v5)
      ]
    ),
    .target(
      name: "CapacitorCordova",
      dependencies: ["Capacitor"],
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
    .testTarget(
      name: "CapacitorTests",
      dependencies: [
        "Capacitor",
        .product(name: "Testing", package: "swift-testing")
      ],
      resources: [
        .copy("Resources/configurations")
      ]
    )
  ],
  swiftLanguageModes: [.v5]
)
