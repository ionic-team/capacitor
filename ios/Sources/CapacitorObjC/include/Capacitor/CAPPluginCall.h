#import <Foundation/Foundation.h>
#import <Capacitor/CAPPluginCallResult.h>

NS_ASSUME_NONNULL_BEGIN

@class CAPPluginCall;

typedef void (^CAPPluginCallSuccessHandler)(CAPPluginCallResult *result, CAPPluginCall *call);
typedef void (^CAPPluginCallErrorHandler)(CAPPluginCallError *error);

@interface CAPPluginCall : NSObject

@property (nonatomic, copy) NSString *callbackId;
@property (nonatomic, copy) NSString *methodName;
@property (nonatomic, copy) NSDictionary<NSString *, id> *options;
@property (nonatomic, copy) CAPPluginCallSuccessHandler successHandler;
@property (nonatomic, copy) CAPPluginCallErrorHandler errorHandler;
@property (nonatomic, assign) BOOL keepAlive;

/// Deprecated alias for `keepAlive`.
@property (nonatomic, assign) BOOL isSaved;

- (instancetype)initWithCallbackId:(NSString *)callbackId
                        methodName:(NSString *)methodName
                           options:(NSDictionary<NSString *, id> *)options
                           success:(CAPPluginCallSuccessHandler)success
                             error:(CAPPluginCallErrorHandler)error NS_DESIGNATED_INITIALIZER;

- (instancetype)initWithCallbackId:(NSString *)callbackId
                           options:(NSDictionary<NSString *, id> *)options
                           success:(CAPPluginCallSuccessHandler)success
                             error:(CAPPluginCallErrorHandler)error;

- (instancetype)init NS_UNAVAILABLE;

/// Deprecated; sets `keepAlive` to YES.
- (void)save;

@end

NS_ASSUME_NONNULL_END
