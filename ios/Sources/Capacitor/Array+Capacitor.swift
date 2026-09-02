// convenience wrappers to transform Arrays between NSNull and Optional values, for interoperability with Obj-C
extension Array: CapacitorExtension {}
extension CapacitorExtensionTypeWrapper where T == [JSValue] {
    public func replacingNullValues() -> [JSValue?] {
        return baseType.map({ (value) -> JSValue? in
            if value is NSNull {
                return nil
            }
            return value
        })
    }

    public func replacingOptionalValues() -> [JSValue] {
        return baseType
    }
}

extension CapacitorExtensionTypeWrapper where T == [JSValue?] {
    public func replacingNullValues() -> [JSValue?] {
        return baseType
    }

    public func replacingOptionalValues() -> [JSValue] {
        return baseType.map({ (value) -> JSValue in
            if let value = value {
                return value
            }
            return NSNull()
        })
    }
}
