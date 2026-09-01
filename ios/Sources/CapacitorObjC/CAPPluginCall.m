#import <Capacitor/CAPPluginCall.h>

@implementation CAPPluginCall

@dynamic isSaved;

- (instancetype)initWithCallbackId:(NSString *)callbackId
                        methodName:(NSString *)methodName
                           options:(NSDictionary<NSString *, id> *)options
                           success:(CAPPluginCallSuccessHandler)success
                             error:(CAPPluginCallErrorHandler)error {
    if ((self = [super init])) {
        _callbackId = callbackId;
        _methodName = methodName;
        _options = options;
        _successHandler = success;
        _errorHandler = error;
        _keepAlive = NO;
    }
    return self;
}

- (instancetype)initWithCallbackId:(NSString *)callbackId
                           options:(NSDictionary<NSString *, id> *)options
                           success:(CAPPluginCallSuccessHandler)success
                             error:(CAPPluginCallErrorHandler)error {
    return [self initWithCallbackId:callbackId methodName:@"" options:options success:success error:error];
}

- (BOOL)isSaved {
    return self.keepAlive;
}

- (void)setIsSaved:(BOOL)isSaved {
    self.keepAlive = isSaved;
}

- (void)save {
    self.keepAlive = YES;
}

@end
