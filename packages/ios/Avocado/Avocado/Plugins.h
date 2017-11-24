#ifndef Plugins_h
#define Plugins_h


#if defined(__cplusplus)
#define AVC_EXTERN extern "C" __attribute__((visibility("default")))
#else
#define AVC_EXTERN extern __attribute__((visibility("default")))
#endif


@protocol AvocadoBridgeModule <NSObject>

#define AVOCADO_EXPORT_MODULE(module_id) \
AVC_EXTERN void AvocadoRegisterModule(Class); \
+ (NSString *)moduleId { return @#module_id; } \
+ (void)load { AvocadoRegisterModule(self); }

+ (NSString *)moduleId;

@optional

#define AVOCADO_MODULE(module_id, objc_name, objc_supername) \
objc_name : objc_supername \
@end \
@interface objc_name (AvocadoExternModule) <AvocadoBridgeModule> \
@end \
@implementation objc_name (AvocadoExternModule) \
AVOCADO_EXPORT_MODULE(module_id)

@end

#endif /* Plugins_h */
