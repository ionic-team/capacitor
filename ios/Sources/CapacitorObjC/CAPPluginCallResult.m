#import <Capacitor/CAPPluginCallResult.h>

@implementation CAPPluginCallResult

- (instancetype)init:(NSDictionary<NSString *, id> *)data {
    if ((self = [super init])) {
        _data = data;
    }
    return self;
}

@end

@implementation CAPPluginCallError

- (instancetype)init:(NSString *)message
                code:(NSString *)code
               error:(NSError *)error
                data:(NSDictionary<NSString *, id> *)data {
    if ((self = [super init])) {
        _message = message;
        _code = code;
        _error = error;
        _data = data ? @{@"data": data} : nil;
    }
    return self;
}

@end
