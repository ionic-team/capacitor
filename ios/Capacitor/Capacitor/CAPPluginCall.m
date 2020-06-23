#import <Foundation/Foundation.h>

#import "CAPPluginCall.h"

@implementation CAPPluginCallResult
- (instancetype)init:(NSDictionary<NSString *, id>*)data {
  self.data = data;
  return self;
}
@end

@implementation CAPPluginCallError

- (instancetype)initWithMessage:(NSString *)message code:(NSString *) code error:(NSError *)error data:(NSDictionary<NSString *,id> *)data {
  self.message = message;
  self.code = code;
  self.error = error;
  self.data = data;
  return self;
}

@end

@implementation CAPPluginCall

- (instancetype)initWithCallbackId:(NSString *)callbackId options:(NSDictionary *)options success:(CAPPluginCallSuccessHandler) success error:(CAPPluginCallErrorHandler) error {
  self.callbackId = callbackId;
  self.options = options;
  self.successHandler = success;
  self.errorHandler = error;
  return self;
}

- (void)save {
  self.isSaved = true;
}

@end
