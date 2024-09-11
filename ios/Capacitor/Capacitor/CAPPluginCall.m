#import <Foundation/Foundation.h>
#import "CAPPluginCall.h"

@implementation CAPPluginCall

- (instancetype)initWithCallbackId:(NSString *)callbackId options:(NSDictionary *)options success:(CAPPluginCallSuccessHandler) success error:(CAPPluginCallErrorHandler) error __deprecated {
  self.callbackId = callbackId;
  self.methodName = @"";
  self.options = options;
  self.successHandler = success;
  self.errorHandler = error;
  return self;
}

- (instancetype)initWithCallbackId:(NSString *)callbackId methodName:(NSString *)methodName options:(NSDictionary *)options success:(CAPPluginCallSuccessHandler) success error:(CAPPluginCallErrorHandler) error {
  self.callbackId = callbackId;
  self.methodName = methodName;
  self.options = options;
  self.successHandler = success;
  self.errorHandler = error;
  return self;
}

- (BOOL)isSaved {
    return self.keepAlive;
}

- (void)setIsSaved:(BOOL)saved {
    self.keepAlive = saved;
}

- (void)save {
  self.keepAlive = true;
}

@end
