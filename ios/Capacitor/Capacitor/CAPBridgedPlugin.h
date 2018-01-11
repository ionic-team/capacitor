#import "CAPPluginMethod.h"

#if defined(__cplusplus)
#define CAP_EXTERN extern "C" __attribute__((visibility("default")))
#else
#define CAP_EXTERN extern __attribute__((visibility("default")))
#endif

#define CAPPluginReturnNone @"none"
#define CAPPluginReturnCallback @"callback"
#define CAPPluginReturnPromise @"promise"
#define CAPPluginReturnSync @"sync" // not used

@class CAPPluginCall;
@class CAPPlugin;

@protocol CAPBridgedPlugin <NSObject>
+(NSString *)pluginId;
+(NSArray *)pluginMethods;
+(CAPPluginMethod *)getMethod:(NSString *)methodName;
@optional
@end

#define CAP_PLUGIN_CONFIG(plugin_id) \
CAP_EXTERN void CapacitorRegisterPlugin(Class); \
+ (NSString *)pluginId { return @#plugin_id; } \
+ (void)load { CapacitorRegisterPlugin(self); }
#define CAP_PLUGIN_METHOD(method_name, method_return_type) \
[methods addObject:[[CAPPluginMethod alloc] initWithName:@#method_name returnType:method_return_type]]

#define CAP_PLUGIN(objc_name, methods_body) \
@interface objc_name : NSObject \
@end \
@interface objc_name (CAPPluginCategory) <CAPBridgedPlugin> \
@end \
@implementation objc_name (CAPPluginCategory) \
+ (NSArray *)pluginMethods { \
  NSMutableArray *methods = [NSMutableArray new]; \
  methods_body \
  return methods; \
} \
+ (CAPPluginMethod *)getMethod:(NSString *)methodName { \
  NSArray *methods = [self pluginMethods]; \
  for(CAPPluginMethod *method in methods) { \
    if([method.name isEqualToString:methodName]) { \
      return method; \
    } \
  } \
  return nil; \
} \
CAP_PLUGIN_CONFIG(objc_name) \
@end

