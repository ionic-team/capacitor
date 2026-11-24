import UIKit

// Deliberately empty. SwiftUI owns the window, and a scene delegate that implements
// scene(_:openURLContexts:) would take URL delivery away from App.swift's .onOpenURL.
// This exists so per-scene UIKit APIs that SwiftUI does not surface have somewhere to go.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {}
