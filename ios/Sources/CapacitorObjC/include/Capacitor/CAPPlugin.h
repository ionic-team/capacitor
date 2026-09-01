#import <Foundation/Foundation.h>
#import <WebKit/WebKit.h>
#import <UIKit/UIKit.h>
#import <Capacitor/CAPPluginCall.h>

NS_ASSUME_NONNULL_BEGIN

@interface CAPPlugin : NSObject

@property (nonatomic, weak, nullable) WKWebView *webView;
// Raw, untyped backing storage for the bridge. The strongly-typed `bridge` accessor
// (`id<CAPBridgeProtocol>`) is vended by the Swift `Capacitor` module as a category, so that the
// `CapacitorObjC` target never has to reference the Swift-defined `CAPBridgeProtocol`.
@property (nonatomic, weak, nullable) NSObject *bridgeRef;
@property (nonatomic, copy) NSString *pluginId;
@property (nonatomic, copy) NSString *pluginName;
@property (nonatomic, strong) NSMutableDictionary *eventListeners;
@property (nonatomic, strong) NSMutableDictionary *retainedEventArguments;
@property (nonatomic, assign) BOOL shouldStringifyDatesInCalls;

- (instancetype)init NS_DESIGNATED_INITIALIZER;

- (NSString *)getId;

- (void)load;

- (void)addEventListener:(NSString *)eventName listener:(CAPPluginCall *)listener;
- (void)removeEventListener:(NSString *)eventName listener:(CAPPluginCall *)listener;

- (void)notifyListeners:(NSString *)eventName data:(nullable NSDictionary<NSString *, id> *)data;
- (void)notifyListeners:(NSString *)eventName data:(nullable NSDictionary<NSString *, id> *)data retainUntilConsumed:(BOOL)retainUntilConsumed;

- (void)addListener:(CAPPluginCall *)call;
- (void)removeAllListeners:(CAPPluginCall *)call;

- (nullable NSArray<CAPPluginCall *> *)getListeners:(NSString *)eventName;
- (BOOL)hasListeners:(NSString *)eventName;

- (void)checkPermissions:(CAPPluginCall *)call;
- (void)requestPermissions:(CAPPluginCall *)call;

- (BOOL)supportsPopover;

- (nullable NSNumber *)shouldOverrideLoad:(WKNavigationAction *)navigationAction;
- (BOOL)handleWKWebViewURLAuthenticationChallenge:(NSURLAuthenticationChallenge *)challenge
                                completionHandler:(void (^)(NSURLSessionAuthChallengeDisposition, NSURLCredential * _Nullable))completionHandler;

@end

NS_ASSUME_NONNULL_END
