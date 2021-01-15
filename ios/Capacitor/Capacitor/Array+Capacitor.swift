// convenience wrappers to transform Arrays between NSNull and Optional values, for interoperability with Obj-C
extension Array: CapacitorExtension {}
extension CapacitorExtensionTypeWrapper where T == Array<JSValue> {
    public func replacingNullValues() -> Array<JSValue?> {
        return baseType.map({ (value) -> JSValue? in
            if value is NSNull {
                return nil
            }
            return value
        })
    }
    
    public func replacingOptionalValues() -> Array<JSValue> {
        return baseType
    }
}

extension CapacitorExtensionTypeWrapper where T == Array<JSValue?> {
    public func replacingNullValues() -> Array<JSValue?> {
        return baseType
    }
    
    public func replacingOptionalValues() -> Array<JSValue> {
        return baseType.map({ (value) -> JSValue in
            if let value = value {
                return value
            }
            return NSNull()
        })
    }
}
