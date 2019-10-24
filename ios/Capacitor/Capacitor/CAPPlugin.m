#import "CAPPlugin.h"
#import <Capacitor/Capacitor-Swift.h>

#import <Foundation/Foundation.h>

@implementation CAPPlugin

-(instancetype) initWithBridge:(CAPBridge *)bridge pluginId:(NSString *)pluginId pluginName:(NSString *)pluginName {
  self.bridge = bridge;
  self.webView = bridge.getWebView;
  self.pluginId = pluginId;
  self.pluginName = pluginName;
  self.eventListeners = [[NSMutableDictionary alloc] init];
  self.retainedEventArguments = [[NSMutableDictionary alloc] init];
  return self;
}

-(NSString *) getId {
  return self.pluginName;
}

-(BOOL) getBool:(CAPPluginCall *)call field:(NSString *)field defaultValue:(BOOL)defaultValue {
  id idVal = [call.options objectForKey:field];
  
  if(![idVal isKindOfClass:[NSNumber class]]) {
    return defaultValue;
  }
  
  NSNumber *value = (NSNumber *)idVal;
  if(value == nil) {
    return defaultValue;
  }
  if(value.integerValue == 0) {
    return FALSE;
  }
  return TRUE;
}

-(NSString *) getString:(CAPPluginCall *)call field:(NSString *)field defaultValue:(NSString *)defaultValue
{
  id idVal = [call.options objectForKey:field];
  if(![idVal isKindOfClass:[NSString class]]) {
    return defaultValue;
  }
  NSString *value = (NSString *)idVal;
  if(value == nil) {
    return defaultValue;
  }
  return value;
}

-(id)getConfigValue:(NSString *)key {
  return [self.bridge.config getPluginConfigValue:self.pluginName :key];
}

-(void)load {}

- (void)addEventListener:(NSString *)eventName listener:(CAPPluginCall *)listener {
  NSMutableArray *listenersForEvent = [self.eventListeners objectForKey:eventName];
  if(!listenersForEvent) {
    listenersForEvent = [[NSMutableArray alloc] initWithObjects:listener, nil];
    [self.eventListeners setValue:listenersForEvent forKey:eventName];
    
    [self sendRetainedArgumentsForEvent:eventName];
  } else {
    [listenersForEvent addObject:listener];
  }
}

- (void)sendRetainedArgumentsForEvent:(NSString *)eventName {
  id retained = [self.retainedEventArguments objectForKey:eventName];
  if (retained == nil) {
    return;
  }
  
  [self notifyListeners:eventName data:retained];
  [self.retainedEventArguments removeObjectForKey:eventName];
}

- (void)removeEventListener:(NSString *)eventName listener:(CAPPluginCall *)listener {
  NSMutableArray *listenersForEvent = [self.eventListeners objectForKey:eventName];
  if(!listenersForEvent) { return; }
  NSUInteger listenerIndex = [listenersForEvent indexOfObject:listener];
  if(listenerIndex == NSNotFound) {
    return;
  }
  [listenersForEvent removeObjectAtIndex:listenerIndex];
}

- (void)notifyListeners:(NSString *)eventName data:(NSDictionary<NSString *,id> *)data {
  [self notifyListeners:eventName data:data retainUntilConsumed:NO];
}

- (void)notifyListeners:(NSString *)eventName data:(NSDictionary<NSString *,id> *)data retainUntilConsumed:(BOOL)retain {
  NSArray<CAPPluginCall *> *listenersForEvent = [self.eventListeners objectForKey:eventName];
  if(listenersForEvent == nil || [listenersForEvent count] == 0) {
    if (retain == YES) {
      [self.retainedEventArguments setObject:data forKey:eventName];
    }
    return;
  }
  
  for(CAPPluginCall *call in listenersForEvent) {
    CAPPluginCallResult *result = [[CAPPluginCallResult alloc] init:data];
    call.successHandler(result, call);
  }
}

- (void)addListener:(CAPPluginCall *)call {
  NSString *eventName = [call.options objectForKey:@"eventName"];
  [call setIsSaved:TRUE];
  [self addEventListener:eventName listener:call];
}

- (void)removeListener:(CAPPluginCall *)call {
  NSString *eventName = [call.options objectForKey:@"eventName"];
  NSString *callbackId = [call.options objectForKey:@"callbackId"];
  CAPPluginCall *storedCall = [self.bridge getSavedCall:callbackId];
  [self removeEventListener:eventName listener:storedCall];
  [self.bridge releaseCallWithCallbackId:callbackId];
}

- (NSArray<CAPPluginCall *>*)getListeners:(NSString *)eventName {
  NSArray<CAPPluginCall *>* listeners = [self.eventListeners objectForKey:eventName];
  return listeners;
}

- (BOOL)hasListeners:(NSString *)eventName {
  NSArray<CAPPluginCall *>* listeners = [self.eventListeners objectForKey:eventName];
  
  if (listeners == nil) {
    return false;
  }
  return [listeners count] > 0;
}

/**
 * Configure popover sourceRect, sourceView and permittedArrowDirections to show it centered
 */
-(void)setCenteredPopover:(UIViewController *) vc {
  vc.popoverPresentationController.sourceRect = CGRectMake(self.bridge.viewController.view.center.x, self.bridge.viewController.view.center.y, 0, 0);
  vc.popoverPresentationController.sourceView = self.bridge.viewController.view;
  vc.popoverPresentationController.permittedArrowDirections = 0;
}

@end

