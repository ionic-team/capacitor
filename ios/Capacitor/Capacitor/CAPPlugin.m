#import "CAPPlugin.h"
#import <Avocado/Avocado-Swift.h>

#import <Foundation/Foundation.h>

@implementation CAPPlugin

-(instancetype) initWithBridge:(CAPBridge *)bridge pluginId:(NSString *)pluginId {
  self.bridge = bridge;
  self.pluginId = pluginId;
  self.eventListeners = [[NSMutableDictionary alloc] init];
  return self;
}

-(NSString *) getId {
  return self.pluginId;
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

-(void)load {}

- (void)addEventListener:(NSString *)eventName listener:(CAPPluginCall *)listener {
  NSMutableArray *listenersForEvent = [self.eventListeners objectForKey:eventName];
  if(!listenersForEvent) {
    listenersForEvent = [[NSMutableArray alloc] initWithObjects:listener, nil];
    [self.eventListeners setValue:listenersForEvent forKey:eventName];
  } else {
    [listenersForEvent addObject:listener];
  }
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
  NSArray<CAPPluginCall *> *listenersForEvent = [self.eventListeners objectForKey:eventName];
  if(listenersForEvent == nil) {
    return;
  }
  
  for(CAPPluginCall *call in listenersForEvent) {
    CAPPluginCallResult *result = [[CAPPluginCallResult alloc] init:data];
    call.successHandler(result);
  }
}


- (void)addListener:(CAPPluginCall *)call {
  NSString *eventName = [call.options objectForKey:@"eventName"];
  [self addEventListener:eventName listener:call];
  [call setSave:TRUE];
}

- (void)removeListener:(CAPPluginCall *)call {
  NSString *eventName = [call.options objectForKey:@"eventName"];
  NSString *callbackId = [call.options objectForKey:@"callbackId"];
  CAPPluginCall *storedCall = [self.bridge getSavedCallWithCallbackId:callbackId];
  [self removeEventListener:eventName listener:storedCall];
  [self.bridge removeSavedCallWithCallbackId:callbackId];
}
/*
 -(BOOL) getBool:(CAPPluginCall *)call field:(NSString *)field defaultValue:(BOOL)defaultValue {
 NSNumber *value = [call getBool:field defaultValue:nil];
 if(value == nil) {
 return defaultValue;
 }
 if(value.integerValue == 0) {
 return FALSE;
 }
 return TRUE;
 }*/

/**
 * Configure popover sourceRect, sourceView and permittedArrowDirections to show it centered
 */
-(void)setCenteredPopover:(UIViewController *) vc {
  vc.popoverPresentationController.sourceRect = CGRectMake(self.bridge.viewController.view.center.x, self.bridge.viewController.view.center.y, 0, 0);
  vc.popoverPresentationController.sourceView = self.bridge.viewController.view;
  vc.popoverPresentationController.permittedArrowDirections = 0;
}

@end

