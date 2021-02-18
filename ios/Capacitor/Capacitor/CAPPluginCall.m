#import <Foundation/Foundation.h>
#import "CAPPluginCall.h"

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
