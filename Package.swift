// swift-tools-version: 6.3
import PackageDescription
import CompilerPluginSupport

let package = Package(
  name: "Capacitor",
  platforms: [.iOS(.v16), .macOS(.v10_15)],
  products: [
    .library(
      name: "Capacitor",
      targets: ["Capacitor", "CapacitorObjC", "CapacitorObjCShims"]
    ),
    .library(
      name: "Cordova",
      targets: ["Cordova"]
    ),
    .library(
      name: "CapacitorCordova",
      targets: ["Cordova", "CapacitorCordova"]
    )
  ],
  dependencies: [
    .package(url: "https://github.com/swiftlang/swift-syntax.git", "600.0.0"..<"700.0.0")
  ],
  targets: [
    .target(
      name: "Capacitor",
      dependencies: ["CapacitorMacrosImpl", "CapacitorObjC"],
      path: "ios/Sources/Capacitor",
      resources: [.copy("assets")],
      swiftSettings: [
        .swiftLanguageMode(.v5)
      ],

    ),
    .macro(
      name: "CapacitorMacrosImpl",
      dependencies: [
        .product(name: "SwiftSyntax", package: "swift-syntax"),
        .product(name: "SwiftSyntaxMacros", package: "swift-syntax"),
        .product(name: "SwiftSyntaxBuilder", package: "swift-syntax"),
        .product(name: "SwiftCompilerPlugin", package: "swift-syntax")
      ],
      path: "ios/Sources/CapacitorMacrosImpl"
    ),
    .target(
      name: "CapacitorObjC",
      path: "ios/Sources/CapacitorObjC",
      publicHeadersPath: "include"
    ),
    .target(
      name: "CapacitorObjCShims",
      dependencies: ["Capacitor"],
      path: "ios/Sources/CapacitorObjCShims",
      publicHeadersPath: "include"
    ),
    .target(
      name: "Cordova",
      path: "ios/Sources/Cordova",
      publicHeadersPath: "include",
      cSettings: [
        .headerSearchPath("include"),
        .headerSearchPath("include/Cordova"),
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
      dependencies: ["Capacitor", "Cordova"],
      path: "ios/Sources/CapacitorCordova",
    ),
    .testTarget(
      name: "CapacitorTests",
      dependencies: [
        "Capacitor"
      ],
      path: "ios/Tests/CapacitorTests",
      resources: [
        .copy("Resources/configurations")
      ]
    )
  ],
  swiftLanguageModes: [.v5]
)
