
@interface AVCPluginCallResult : NSObject

@property (nonatomic, strong) NSDictionary<NSString *, id>* data;

- (instancetype)init:(NSDictionary<NSString *, id>*)data;

@end

@interface AVCPluginCallError : NSObject

@property (nonatomic, strong) NSString *message;
@property (nonatomic, strong) NSError *error;
@property (nonatomic, strong) NSDictionary<NSString *, id> *data;

- (instancetype)initWithMessage:(NSString *)message error:(NSError *)error data:(NSDictionary<NSString *, id>*)data;

@end

typedef void(^AVCPluginCallSuccessHandler)(AVCPluginCallResult *result);
typedef void(^AVCPluginCallErrorHandler)(AVCPluginCallError *error);

@interface AVCPluginCall : NSObject

@property (nonatomic, assign) BOOL save;
@property (nonatomic, strong) NSString *callbackId;
@property (nonatomic, strong) NSDictionary *options;
@property (nonatomic, copy) AVCPluginCallSuccessHandler successHandler;
@property (nonatomic, copy) AVCPluginCallErrorHandler errorHandler;

- (instancetype)initWithCallbackId:(NSString *)callbackId options:(NSDictionary *)options success:(AVCPluginCallSuccessHandler)success error:(AVCPluginCallErrorHandler)error;

@end


