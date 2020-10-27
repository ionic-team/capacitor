
#import "JSONSerializationWrapper.h"

@implementation JSONSerializationWrapper

- (instancetype)initWithDictionary:(NSDictionary *)dictionary {
    self = [super init];
    if (self != nil) {
        _dictionary = dictionary;
    }
    return self;
}

- (NSDictionary *)unwrappedResult {
    NSError* error = nil;
    NSData* serializedData = [NSJSONSerialization dataWithJSONObject:[self dictionary] options:NSJSONWritingPrettyPrinted error:&error];
    if (serializedData != nil) {
        NSDictionary* result = [NSJSONSerialization JSONObjectWithData:serializedData options:0 error:&error];
        return result;
    }
    return nil;
}

@end
