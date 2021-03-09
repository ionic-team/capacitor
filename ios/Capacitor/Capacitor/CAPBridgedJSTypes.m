#import <Foundation/Foundation.h>
#import "CAPBridgedJSTypes.h"

@implementation CAPPluginCall (BridgedJSProtocol)
- (NSString * _Nullable)getString:(NSString * _Nonnull)key defaultValue:(NSString * _Nullable)defaultValue {
    id value = [[self dictionaryRepresentation] objectForKey:key];
    if (value != nil && [value isKindOfClass:[NSString class]]) {
        return value;
    }
    return defaultValue;
}

- (NSDate * _Nullable)getDate:(NSString * _Nonnull)key defaultValue:(NSDate * _Nullable)defaultValue {
    id value = [[self dictionaryRepresentation] objectForKey:key];
    if (value != nil && [value isKindOfClass:[NSDate class]]) {
        return value;
    }
    else if (value != nil && [value isKindOfClass:[NSString class]]) {
        return [[[self class] jsDateFormatter] dateFromString:value];
    }
    return defaultValue;
}

- (NSDictionary * _Nullable)getObject:(NSString * _Nonnull)key defaultValue:(NSDictionary * _Nullable)defaultValue {
    id value = [[self dictionaryRepresentation] objectForKey:key];
    if (value != nil && [value isKindOfClass:[NSDictionary class]]) {
        return value;
    }
    return defaultValue;
}

- (NSNumber * _Nullable)getNumber:(NSString * _Nonnull)key defaultValue:(NSNumber * _Nullable)defaultValue {
    id value = [[self dictionaryRepresentation] objectForKey:key];
    if (value != nil && [value isKindOfClass:[NSNumber class]]) {
        return value;
    }
    return defaultValue;
}

- (BOOL)getBool:(NSString * _Nonnull)key defaultValue:(BOOL)defaultValue {
    return [[self getNumber:key defaultValue:[NSNumber numberWithBool:defaultValue]] boolValue];
}
@end
