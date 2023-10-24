// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "Capacitor",
    platforms: [
        .iOS(.v13)
    ],
    products: [
        .library(
            name: "Capacitor",
            targets: ["Capacitor", "Cordova"])
    ],
    targets: [
        .binaryTarget(
            name: "Capacitor",
            path: "ios/Frameworks/Capacitor.xcframework"
        )
        .binaryTarget(
            name: "Cordova",
            path: "ios/Frameworks/Cordova.xcframework"
        )
    ]
)
