#import <Foundation/Foundation.h>
#import <WebKit/WebKit.h>

@class CAPPluginCall;

@interface CAPPlugin : NSObject

@property (nonatomic, weak, nullable) WKWebView *webView;
// Untyped backing storage for the bridge. The typed `bridge` accessor (`id<CAPBridgeProtocol>`) is
// vended from Swift, so this target never has to reference the Swift-defined CAPBridgeProtocol.
@property (nonatomic, weak, nullable) NSObject *bridgeRef;
@property (nonatomic, strong, nonnull) NSString *pluginId;
@property (nonatomic, strong, nonnull) NSString *pluginName;
@property (nonatomic, strong, nullable) NSMutableDictionary<NSString *, NSMutableArray<CAPPluginCall *>*> *eventListeners;
@property (nonatomic, strong, nullable) NSMutableDictionary<NSString *, NSMutableArray<id> *> *retainedEventArguments;
@property (nonatomic, assign) BOOL shouldStringifyDatesInCalls;

- (void)addEventListener:(NSString* _Nonnull)eventName listener:(CAPPluginCall* _Nonnull)listener;
- (void)removeEventListener:(NSString* _Nonnull)eventName listener:(CAPPluginCall* _Nonnull)listener;
- (NSArray<CAPPluginCall *>* _Nullable)getListeners:(NSString* _Nonnull)eventName;
- (BOOL)hasListeners:(NSString* _Nonnull)eventName;
- (void)addListener:(CAPPluginCall* _Nonnull)call;
/**
 * Give the plugins a chance to take control when a URL is about to be loaded in the WebView.
 * Returning true causes the WebView to abort loading the URL.
 * Returning false causes the WebView to continue loading the URL.
 * Returning nil will defer to the default Capacitor policy
 */
- (NSNumber* _Nullable)shouldOverrideLoad:(WKNavigationAction* _Nonnull)navigationAction;
/**
 * Allows plugins to hook into and respond to the WebView's URL authentication challenge.
 * Returning false will defer to the default response of [.rejectProtectionSpace](https://developer.apple.com/documentation/Foundation/URLSession/AuthChallengeDisposition/rejectProtectionSpace).
 */
- (BOOL)handleWKWebViewURLAuthenticationChallenge:(NSURLAuthenticationChallenge* _Nonnull)challenge completionHandler:(void (^_Nonnull)(NSURLSessionAuthChallengeDisposition disposition, NSURLCredential * _Nullable credential))completionHandler;

// Called after init if the plugin wants to do
// some loading so the plugin author doesn't
// need to override init()
-(void)load;
-(NSString* _Nonnull)getId;
-(BOOL)supportsPopover DEPRECATED_MSG_ATTRIBUTE("All iOS 13+ devices support popover");

@end
