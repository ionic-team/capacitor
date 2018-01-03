#import "AVCPluginMethod.h"

#if defined(__cplusplus)
#define AVC_EXTERN extern "C" __attribute__((visibility("default")))
#else
#define AVC_EXTERN extern __attribute__((visibility("default")))
#endif

#define AVCPluginReturnNone @"none"
#define AVCPluginReturnCallback @"callback"
#define AVCPluginReturnPromise @"promise"
#define AVCPluginReturnSync @"sync" // not used

@class AVCPluginCall;
@class AVCPlugin;

@protocol AVCBridgedPlugin <NSObject>
+(NSString *)pluginId;
+(NSArray *)pluginMethods;
+(AVCPluginMethod *)getMethod:(NSString *)methodName;
@optional
@end

#define AVC_PLUGIN_CONFIG(plugin_id) \
AVC_EXTERN void AvocadoRegisterPlugin(Class); \
+ (NSString *)pluginId { return @#plugin_id; } \
+ (void)load { AvocadoRegisterPlugin(self); }
#define AVC_PLUGIN_METHOD(method_name, method_return_type) \
[methods addObject:[[AVCPluginMethod alloc] initWithName:@#method_name returnType:method_return_type]]

#define AVC_PLUGIN(objc_name, methods_body) \
@interface objc_name : NSObject \
@end \
@interface objc_name (AVCPluginCategory) <AVCBridgedPlugin> \
@end \
@implementation objc_name (AVCPluginCategory) \
+ (NSArray *)pluginMethods { \
  NSMutableArray *methods = [NSMutableArray new]; \
  methods_body \
  return methods; \
} \
+ (AVCPluginMethod *)getMethod:(NSString *)methodName { \
  NSArray *methods = [self pluginMethods]; \
  for(AVCPluginMethod *method in methods) { \
    if([method.name isEqualToString:methodName]) { \
      return method; \
    } \
  } \
  return nil; \
} \
AVC_PLUGIN_CONFIG(objc_name) \
@end

