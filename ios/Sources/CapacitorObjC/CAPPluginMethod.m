#import <Capacitor/CAPPluginMethod.h>

CAPPluginReturnType const CAPPluginReturnNone = @"none";
CAPPluginReturnType const CAPPluginReturnCallback = @"callback";
CAPPluginReturnType const CAPPluginReturnPromise = @"promise";

@implementation CAPPluginMethodArgument

- (instancetype)initWithName:(NSString *)name
                 nullability:(CAPPluginMethodArgumentNullability)nullability
                        type:(NSString *)type {
    if ((self = [super init])) {
        _name = name;
        _nullability = nullability;
        _type = type;
    }
    return self;
}

@end

@implementation CAPPluginMethod

- (instancetype)initWithName:(NSString *)name returnType:(CAPPluginReturnType)returnType {
    if ((self = [super init])) {
        _name = name;
        _selector = NSSelectorFromString([name stringByAppendingString:@":"]);
        _returnType = returnType;
    }
    return self;
}

- (instancetype)initWithSelector:(SEL)selector returnType:(CAPPluginReturnType)returnType {
    if ((self = [super init])) {
        NSString *selectorString = NSStringFromSelector(selector);
        _name = [selectorString substringToIndex:selectorString.length - 1];
        _selector = selector;
        _returnType = returnType;
    }
    return self;
}

@end
