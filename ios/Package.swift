// swift-tools-version: 6.3
import PackageDescription

let package = Package(
  name: "Capacitor",
  platforms: [.iOS(.v16)],
  products: [
    .library(
      name:"Capacitor",
      targets: ["Capacitor"]
    ),
    .library(
      name: "CapacitorCordova",
      targets: ["CapacitorCordova"]
    )
  ],
  dependencies: [],
  targets: [
    .target(
      name: "Capacitor",
      path: "Capacitor/Capacitor"
    ),
    .target(
      name: "CapacitorCordova",
      path: "CapacitorCordova/CapacitorCordova"
    ),
  ],
  swiftLanguageModes: [.v6]
)
