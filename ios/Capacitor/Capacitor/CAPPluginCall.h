#import <Foundation/Foundation.h>

@class CAPPluginCall;
@class CAPPluginCallResult;
@class CAPPluginCallError;

typedef void(^CAPPluginCallSuccessHandler)(CAPPluginCallResult *result, CAPPluginCall* call);
typedef void(^CAPPluginCallErrorHandler)(CAPPluginCallError *error);

@interface CAPPluginCall : NSObject

@property (nonatomic, assign) BOOL isSaved;
@property (nonatomic, strong) NSString *callbackId;
@property (nonatomic, strong) NSDictionary *options;
@property (nonatomic, copy) CAPPluginCallSuccessHandler successHandler;
@property (nonatomic, copy) CAPPluginCallErrorHandler errorHandler;

- (instancetype)initWithCallbackId:(NSString *)callbackId options:(NSDictionary *)options success:(CAPPluginCallSuccessHandler)success error:(CAPPluginCallErrorHandler)error;

- (void)save;
@end
