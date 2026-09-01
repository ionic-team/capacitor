#import <Capacitor/CAPPlugin.h>

@interface CAPPlugin ()
- (void)sendRetainedArgumentsForEvent:(NSString *)eventName;
@end

@implementation CAPPlugin

- (instancetype)init {
    if ((self = [super init])) {
        _bridgeRef = nil;
        _webView = nil;
        _pluginId = @"";
        _pluginName = @"";
        _eventListeners = [NSMutableDictionary new];
        _retainedEventArguments = [NSMutableDictionary new];
        _shouldStringifyDatesInCalls = YES;
    }
    return self;
}

- (NSString *)getId {
    return self.pluginName;
}

- (void)load {
}

- (void)addEventListener:(NSString *)eventName listener:(CAPPluginCall *)listener {
    NSMutableArray *listenersForEvent = self.eventListeners[eventName];

    if (listenersForEvent == nil || listenersForEvent.count == 0) {
        listenersForEvent = [NSMutableArray arrayWithObject:listener];
        self.eventListeners[eventName] = listenersForEvent;
        [self sendRetainedArgumentsForEvent:eventName];
    } else {
        [listenersForEvent addObject:listener];
    }
}

- (void)removeEventListener:(NSString *)eventName listener:(CAPPluginCall *)listener {
    NSMutableArray *listenersForEvent = self.eventListeners[eventName];
    if (listenersForEvent == nil) {
        return;
    }

    NSUInteger listenerIndex = [listenersForEvent indexOfObject:listener];
    if (listenerIndex == NSNotFound) {
        return;
    }

    [listenersForEvent removeObjectAtIndex:listenerIndex];
}

- (void)notifyListeners:(NSString *)eventName data:(NSDictionary<NSString *, id> *)data {
    [self notifyListeners:eventName data:data retainUntilConsumed:NO];
}

- (void)notifyListeners:(NSString *)eventName data:(NSDictionary<NSString *, id> *)data retainUntilConsumed:(BOOL)retainUntilConsumed {
    NSArray<CAPPluginCall *> *listenersForEvent = self.eventListeners[eventName];
    if (listenersForEvent.count == 0) {
        if (retainUntilConsumed) {
            if (self.retainedEventArguments[eventName] == nil) {
                self.retainedEventArguments[eventName] = [NSMutableArray new];
            }
            [self.retainedEventArguments[eventName] addObject:data ?: @{}];
        }
        return;
    }

    for (CAPPluginCall *call in listenersForEvent) {
        CAPPluginCallResult *result = [[CAPPluginCallResult alloc] init:data ?: @{}];
        call.successHandler(result, call);
    }
}

- (void)addListener:(CAPPluginCall *)call {
    id eventNameValue = call.options[@"eventName"];
    if (![eventNameValue isKindOfClass:[NSString class]]) {
        return;
    }
    call.keepAlive = YES;
    [self addEventListener:eventNameValue listener:call];
}

- (void)removeAllListeners:(CAPPluginCall *)call {
    [self.eventListeners removeAllObjects];
    call.successHandler([[CAPPluginCallResult alloc] init:nil], call);
}

- (NSArray<CAPPluginCall *> *)getListeners:(NSString *)eventName {
    return self.eventListeners[eventName];
}

- (BOOL)hasListeners:(NSString *)eventName {
    NSArray *listeners = self.eventListeners[eventName];
    return listeners.count > 0;
}

- (void)checkPermissions:(CAPPluginCall *)call {
    call.successHandler([[CAPPluginCallResult alloc] init:nil], call);
}

- (void)requestPermissions:(CAPPluginCall *)call {
    call.successHandler([[CAPPluginCallResult alloc] init:nil], call);
}

- (BOOL)supportsPopover {
    return YES;
}

- (NSNumber *)shouldOverrideLoad:(WKNavigationAction *)navigationAction {
    return nil;
}

- (BOOL)handleWKWebViewURLAuthenticationChallenge:(NSURLAuthenticationChallenge *)challenge
                                completionHandler:(void (^)(NSURLSessionAuthChallengeDisposition, NSURLCredential * _Nullable))completionHandler {
    return NO;
}

- (void)sendRetainedArgumentsForEvent:(NSString *)eventName {
    NSMutableArray *retained = self.retainedEventArguments[eventName];
    if (retained == nil) {
        return;
    }

    [self.retainedEventArguments removeObjectForKey:eventName];

    for (id data in retained) {
        [self notifyListeners:eventName data:data];
    }
}

@end
