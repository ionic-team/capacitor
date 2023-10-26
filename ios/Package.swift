// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "Capacitor",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "Capacitor",
            targets: ["Capacitor"]
        ),
        .library(
            name: "Cordova",
            targets: ["Cordova"]
        )        
    ],
    targets: [
        .binaryTarget(
            name: "Capacitor",
            path: "./Frameworks/Capacitor.xcframework"
        ),
        .binaryTarget(
            name: "Cordova",
            path: "./Frameworks/Cordova.xcframework"
        )
    ]
)
