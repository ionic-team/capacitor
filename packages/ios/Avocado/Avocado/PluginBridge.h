#ifndef PluginBridge_h
#define PluginBridge_h


#if defined(__cplusplus)
#define AVC_EXTERN extern "C" __attribute__((visibility("default")))
#else
#define AVC_EXTERN extern __attribute__((visibility("default")))
#endif


@protocol AvocadoBridgePlugin <NSObject>

#define AVOCADO_EXPORT_PLUGIN(plugin_id) \
AVC_EXTERN void AvocadoRegisterPlugin(Class); \
+ (NSString *)pluginId { return @plugin_id; } \
+ (void)load { AvocadoRegisterPlugin(self); }

+ (NSString *)pluginId;

@optional

#define AVOCADO_PLUGIN_DEFINE(plugin_id, objc_name) \
objc_name : NSObject \
@end \
@interface objc_name (AvocadoExternPlugin) <AvocadoBridgePlugin> \
@end \
@implementation objc_name (AvocadoExternPlugin) \
AVOCADO_EXPORT_PLUGIN(plugin_id)

#define AVOCADO_PLUGIN(plugin_id, objc_name) \
@interface objc_name : NSObject \
@end \
@interface objc_name (AvocadoExternPlugin) <AvocadoBridgePlugin> \
@end \
@implementation objc_name (AvocadoExternPlugin) \
AVOCADO_EXPORT_PLUGIN(plugin_id) \
@end

@end

#endif /* PluginBridge_h */
