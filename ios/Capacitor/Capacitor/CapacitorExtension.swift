import Foundation

public protocol CapacitorExtension {
    associatedtype T
    var capacitor: T { get }
    static var capacitor: T.Type { get }
}

public extension CapacitorExtension {
    var capacitor: CapacitorExtensionTypeWrapper<Self> {
        return CapacitorExtensionTypeWrapper(self)
    }

    static var capacitor: CapacitorExtensionTypeWrapper<Self>.Type {
        return CapacitorExtensionTypeWrapper.self
    }
}

public struct CapacitorExtensionTypeWrapper<T> {
    var baseType: T
    init(_ baseType: T) {
        self.baseType = baseType
    }
}
