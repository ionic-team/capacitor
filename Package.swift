// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "Capacitor",
    platforms: [.iOS(.v16)],
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
    targets: [
        .target(
            name: "CapacitorObjC",
            path: "ios/Sources/CapacitorObjC",
            publicHeadersPath: "include",
            cSettings: [
                .headerSearchPath("include"),
                .headerSearchPath("include/Capacitor")
            ]
        ),
        .target(
            name: "Capacitor",
            dependencies: ["CapacitorObjC"],
            path: "ios/Sources/Capacitor",
            resources: [
                .copy("assets"),
                .copy("PrivacyInfo.xcprivacy")
            ],
            swiftSettings: [.swiftLanguageMode(.v5)]
        ),
        .target(
            name: "CapacitorObjCShims",
            dependencies: ["Capacitor"],
            path: "ios/Sources/CapacitorObjCShims",
            exclude: ["Capacitor.modulemap"],
            publicHeadersPath: "include",
            cSettings: [
                .headerSearchPath("include"),
                .headerSearchPath("include/Capacitor")
            ]
        ),
        .target(
            name: "Cordova",
            path: "ios/Sources/Cordova",
            exclude: ["CapacitorCordova.modulemap"],
            resources: [.copy("PrivacyInfo.xcprivacy")],
            publicHeadersPath: "include",
            cSettings: [
                .headerSearchPath("include"),
                .headerSearchPath("include/Cordova")
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
            swiftSettings: [.swiftLanguageMode(.v5)]
        ),
        .testTarget(
            name: "CapacitorTests",
            dependencies: ["Capacitor"],
            path: "ios/Tests/CapacitorTests",
            resources: [.copy("Resources/configurations")],
            swiftSettings: [.swiftLanguageMode(.v5)]
        ),
        .testTarget(
            name: "CapacitorObjCTests",
            dependencies: ["CapacitorObjCShims"],
            path: "ios/Tests/CapacitorObjCTests"
        )
    ],
    swiftLanguageModes: [.v5]
)
