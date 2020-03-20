#import <Foundation/Foundation.h>
#import <WebKit/WebKit.h>

@class CAPBridge;
@class CAPPluginCall;
@class CAPConfig;

@interface CAPPlugin : NSObject

@property (nonatomic, strong) WKWebView *webView;
@property (nonatomic, strong) NSString *pluginId;
@property (nonatomic, strong) NSString *pluginName;
@property (nonatomic, strong) CAPBridge *bridge;
@property (nonatomic, strong) NSMutableDictionary<NSString *, NSMutableArray<CAPPluginCall *>*> *eventListeners;
@property (nonatomic, strong) NSMutableDictionary<NSString *, id> *retainedEventArguments;

- (instancetype) initWithBridge:(CAPBridge*) bridge pluginId:(NSString*) pluginId pluginName:(NSString*) pluginName;
- (void)addEventListener:(NSString *) eventName listener:(CAPPluginCall *)listener;
- (void)removeEventListener:(NSString *) eventName listener:(CAPPluginCall *)listener;
- (void)notifyListeners:(NSString *) eventName data:(NSDictionary<NSString *, id>*)data;
- (void)notifyListeners:(NSString *) eventName data:(NSDictionary<NSString *, id>*)data retainUntilConsumed:(BOOL)retain;
- (NSArray<CAPPluginCall *>*)getListeners:(NSString *)eventName;
- (BOOL)hasListeners:(NSString *)eventName;
- (void)addListener:(CAPPluginCall *)call;
- (void)removeListener:(CAPPluginCall *)call;
- (void)removeAllListeners:(CAPPluginCall *)call;

// Called after init if the plugin wants to do
// some loading so the plugin author doesn't
// need to override init()
-(void) load;
-(NSString *)getId;
-(BOOL)getBool:(CAPPluginCall*) call field:(NSString *)field defaultValue:(BOOL)defaultValue;
-(NSString *) getString:(CAPPluginCall *)call field:(NSString *)field defaultValue:(NSString *)defaultValue;
-(id)getConfigValue:(NSString *) key;
-(void)setCenteredPopover:(UIViewController *) vc;

@end
