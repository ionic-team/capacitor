#import "CAPPlugin.h"
#import "CAPBridgedJSTypes.h"
#import <Capacitor/Capacitor-Swift.h>
#import <Foundation/Foundation.h>
#import <os/lock.h>

@implementation CAPPlugin {
  // Guards eventListeners and retainedEventArguments, which are read and mutated from
  // the plugin's dispatch queue (addListener/removeListener) and from any thread that
  // calls notifyListeners. Zero-initialized memory is a valid unlocked os_unfair_lock,
  // so this works regardless of which initializer created the plugin.
  os_unfair_lock _eventListenersLock;
}

-(instancetype) initWithBridge:(id<CAPBridgeProtocol>)bridge pluginId:(NSString *)pluginId pluginName:(NSString *)pluginName {
  self.bridge = bridge;
  self.webView = bridge.webView;
  self.pluginId = pluginId;
  self.pluginName = pluginName;
  self.eventListeners = [[NSMutableDictionary alloc] init];
  self.retainedEventArguments = [[NSMutableDictionary alloc] init];
  self.shouldStringifyDatesInCalls = true;
  return self;
}

-(NSString *) getId {
  return self.pluginName;
}

- (BOOL)getBool:(CAPPluginCall *)call field:(NSString *)field defaultValue:(BOOL)defaultValue {
  NSNumber* value = [call getNumber:field defaultValue:[NSNumber numberWithBool:defaultValue]];
  return [value boolValue];
}

- (NSString *) getString:(CAPPluginCall *)call field:(NSString *)field defaultValue:(NSString *)defaultValue {
  return [call getString:field defaultValue:defaultValue];
}

-(id)getConfigValue:(NSString *)key __deprecated {
  return [self.bridge.config getPluginConfigValue:self.pluginName :key];
}

-(PluginConfig*)getConfig {
    return [self.bridge.config getPluginConfig:self.pluginName];
}

-(void)load {}

- (void)addEventListener:(NSString *)eventName listener:(CAPPluginCall *)listener {
  NSArray *retained = nil;
  os_unfair_lock_lock(&_eventListenersLock);
  NSMutableArray *listenersForEvent = [self.eventListeners objectForKey:eventName];
  if(listenersForEvent == nil || [listenersForEvent count] == 0) {
    listenersForEvent = [[NSMutableArray alloc] initWithObjects:listener, nil];
    [self.eventListeners setValue:listenersForEvent forKey:eventName];
    retained = [self takeRetainedArgumentsForEvent:eventName];
  } else {
    [listenersForEvent addObject:listener];
  }
  os_unfair_lock_unlock(&_eventListenersLock);

  // Deliver outside of the lock, since listeners may call back into this plugin
  for(id data in retained) {
    [self notifyListeners:eventName data:data];
  }
}

// Must be called while holding _eventListenersLock
- (NSArray *)takeRetainedArgumentsForEvent:(NSString *)eventName {
  NSArray *retained = [self.retainedEventArguments objectForKey:eventName];
  if (retained != nil) {
    [self.retainedEventArguments removeObjectForKey:eventName];
  }
  return retained;
}

- (void)removeEventListener:(NSString *)eventName listener:(CAPPluginCall *)listener {
  os_unfair_lock_lock(&_eventListenersLock);
  NSMutableArray *listenersForEvent = [self.eventListeners objectForKey:eventName];
  NSUInteger listenerIndex = listenersForEvent ? [listenersForEvent indexOfObject:listener] : NSNotFound;
  if(listenerIndex != NSNotFound) {
    [listenersForEvent removeObjectAtIndex:listenerIndex];
  }
  os_unfair_lock_unlock(&_eventListenersLock);
}

- (void)notifyListeners:(NSString *)eventName data:(NSDictionary<NSString *,id> *)data {
  [self notifyListeners:eventName data:data retainUntilConsumed:NO];
}

- (void)notifyListeners:(NSString *)eventName data:(NSDictionary<NSString *,id> *)data retainUntilConsumed:(BOOL)retain {
  NSArray<CAPPluginCall *> *listenersForEvent = nil;
  os_unfair_lock_lock(&_eventListenersLock);
  NSArray<CAPPluginCall *> *currentListeners = [self.eventListeners objectForKey:eventName];
  if(currentListeners == nil || [currentListeners count] == 0) {
    if (retain == YES && data != nil) {
      NSMutableArray *retained = [self.retainedEventArguments objectForKey:eventName];
      if (retained == nil) {
        retained = [[NSMutableArray alloc] init];
        [self.retainedEventArguments setObject:retained forKey:eventName];
      }
      [retained addObject:data];
    }
  } else {
    // Snapshot the listeners so they can be called without holding the lock
    listenersForEvent = [currentListeners copy];
  }
  os_unfair_lock_unlock(&_eventListenersLock);

  for (CAPPluginCall *call in listenersForEvent) {
    CAPPluginCallResult *result = [[CAPPluginCallResult alloc] init:data];
    call.successHandler(result, call);
  }
}

- (void)addListener:(CAPPluginCall *)call {
  NSString *eventName = [call.options objectForKey:@"eventName"];
  [call setKeepAlive:TRUE];
  [self addEventListener:eventName listener:call];
}

- (void)removeListener:(CAPPluginCall *)call {
  NSString *eventName = [call.options objectForKey:@"eventName"];
  NSString *callbackId = [call.options objectForKey:@"callbackId"];
  CAPPluginCall *storedCall = [self.bridge savedCallWithID:callbackId];
  [self removeEventListener:eventName listener:storedCall];
  [self.bridge releaseCallWithID:callbackId];
}

- (void)removeAllListeners:(CAPPluginCall *)call {
  os_unfair_lock_lock(&_eventListenersLock);
  [self.eventListeners removeAllObjects];
  os_unfair_lock_unlock(&_eventListenersLock);
  [call resolve];
}

- (NSArray<CAPPluginCall *>*)getListeners:(NSString *)eventName {
  os_unfair_lock_lock(&_eventListenersLock);
  NSArray<CAPPluginCall *>* listeners = [[self.eventListeners objectForKey:eventName] copy];
  os_unfair_lock_unlock(&_eventListenersLock);
  return listeners;
}

- (BOOL)hasListeners:(NSString *)eventName {
  os_unfair_lock_lock(&_eventListenersLock);
  BOOL hasListeners = [[self.eventListeners objectForKey:eventName] count] > 0;
  os_unfair_lock_unlock(&_eventListenersLock);
  return hasListeners;
}

- (void)checkPermissions:(CAPPluginCall *)call {
  [call resolve];
}

- (void)requestPermissions:(CAPPluginCall *)call {
  [call resolve];
}

/**
 * Configure popover sourceRect, sourceView and permittedArrowDirections to show it centered
 */
-(void)setCenteredPopover:(UIViewController *) vc {
  if (self.bridge.viewController != nil) {
    vc.popoverPresentationController.sourceRect = CGRectMake(self.bridge.viewController.view.center.x, self.bridge.viewController.view.center.y, 0, 0);
    vc.popoverPresentationController.sourceView = self.bridge.viewController.view;
    vc.popoverPresentationController.permittedArrowDirections = 0;
  }
}

-(void)setCenteredPopover:(UIViewController* _Nonnull) vc size:(CGSize) size {
    if (self.bridge.viewController != nil) {
      vc.popoverPresentationController.sourceRect = CGRectMake(self.bridge.viewController.view.center.x, self.bridge.viewController.view.center.y, 0, 0);
      vc.preferredContentSize = size;
      vc.popoverPresentationController.sourceView = self.bridge.viewController.view;
      vc.popoverPresentationController.permittedArrowDirections = 0;
    }
}

-(BOOL)supportsPopover {
    return YES;
}

- (NSNumber*)shouldOverrideLoad:(WKNavigationAction*)navigationAction {
    return nil;
}

- (BOOL)handleWKWebViewURLAuthenticationChallenge:(NSURLAuthenticationChallenge* _Nonnull)challenge completionHandler:(void (^_Nonnull)(NSURLSessionAuthChallengeDisposition disposition, NSURLCredential * _Nullable credential))completionHandler {
    return NO;
}


@end

