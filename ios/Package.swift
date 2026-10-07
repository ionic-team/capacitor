// swift-tools-version: 6.0
import PackageDescription

// Ships inside the @capacitor/ios npm package so apps can resolve Capacitor from node_modules.
// Mirrors the manifest at the repository root, minus the test targets: Tests/ is not published.
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
            path: "Sources/CapacitorObjC",
            publicHeadersPath: "include",
            cSettings: [
                .headerSearchPath("include"),
                .headerSearchPath("include/Capacitor")
            ]
        ),
        .target(
            name: "Capacitor",
            dependencies: ["CapacitorObjC"],
            path: "Sources/Capacitor",
            resources: [
                .copy("assets"),
                .copy("PrivacyInfo.xcprivacy")
            ],
            swiftSettings: [.swiftLanguageMode(.v5)]
        ),
        .target(
            name: "CapacitorObjCShims",
            dependencies: ["Capacitor"],
            path: "Sources/CapacitorObjCShims",
            exclude: ["Capacitor.modulemap"],
            publicHeadersPath: "include",
            cSettings: [
                .headerSearchPath("include"),
                .headerSearchPath("include/Capacitor")
            ]
        ),
        .target(
            name: "Cordova",
            path: "Sources/Cordova",
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
            path: "Sources/CapacitorCordova",
            swiftSettings: [.swiftLanguageMode(.v5)]
        )
    ],
    swiftLanguageModes: [.v5]
)
