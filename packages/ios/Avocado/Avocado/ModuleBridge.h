#ifndef ModuleBridge_h
#define ModuleBridge_h


#if defined(__cplusplus)
#define AVC_EXTERN extern "C" __attribute__((visibility("default")))
#else
#define AVC_EXTERN extern __attribute__((visibility("default")))
#endif


@protocol AvocadoBridgeModule <NSObject>

#define AVOCADO_EXPORT_PLUGIN(plugin_id) \
AVC_EXTERN void AvocadoRegisterModule(Class); \
+ (NSString *)pluginId { return @plugin_id; } \
+ (void)load { AvocadoRegisterModule(self); }

+ (NSString *)pluginId;

@optional

#define AVOCADO_PLUGIN(plugin_id, objc_name) \
objc_name : NSObject \
@end \
@interface objc_name (AvocadoExternModule) <AvocadoBridgeModule> \
@end \
@implementation objc_name (AvocadoExternModule) \
AVOCADO_EXPORT_PLUGIN(plugin_id)

@end

#endif /* ModuleBridge_h */
