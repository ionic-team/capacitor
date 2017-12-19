#import <Foundation/Foundation.h>

#import "AVCPluginCall.h"

@implementation AVCPluginCallResult
- (instancetype)init:(NSDictionary<NSString *, id>*)data {
  self.data = data;
  return self;
}
@end

@implementation AVCPluginCallError

- (instancetype)initWithMessage:(NSString *)message error:(NSError *)error data:(NSDictionary<NSString *,id> *)data {
  self.message = message;
  self.error = error;
  self.data = data;
  return self;
}

@end

@implementation AVCPluginCall

- (instancetype)initWithCallbackId:(NSString *)callbackId options:(NSDictionary *)options success:(AVCPluginCallSuccessHandler) success error:(AVCPluginCallErrorHandler) error {
  self.callbackId = callbackId;
  self.options = options;
  self.successHandler = success;
  self.errorHandler = error;
  return self;
}

@end
