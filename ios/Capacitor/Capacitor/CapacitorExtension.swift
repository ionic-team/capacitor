import Foundation

public protocol CapacitorExtension {
    associatedtype CapacitorType
    var capacitor: CapacitorType { get }
    static var capacitor: CapacitorType.Type { get }
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
