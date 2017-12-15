#import <Foundation/Foundation.h>
#import <WebKit/WebKit.h>

@class Bridge;
@class AVCPluginCall;

@interface AVCPlugin : NSObject

@property (nonatomic, strong) WKWebView *webView;
@property (nonatomic, strong) NSString *pluginId;
@property (nonatomic, strong) Bridge *bridge;
@property (nonatomic, strong) NSDictionary<NSString *, NSMutableArray<AVCPluginCall *>*> *eventListeners;

- (instancetype) initWithBridge:(Bridge*) bridge pluginId:(NSString*) pluginId;
- (void)addEventListener:(NSString *) eventName listener:(AVCPluginCall *)listener;
- (void)removeEventListener:(NSString *) eventName listener:(AVCPluginCall *)listener;
- (void)notifyListeners:(NSString *) eventName data:(NSDictionary<NSString *, id>*)data;

// Called after init if the plugin wants to do
// some loading so the plugin author doesn't
// need to override init()
-(void) load;
-(NSString *)getId;
-(BOOL)getBool:(PluginCall*) call field:(NSString *)field defaultValue:(BOOL)defaultValue;

@end
