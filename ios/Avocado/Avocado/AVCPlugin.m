#import "AVCPlugin.h"
#import <Avocado/Avocado-Swift.h>

#import <Foundation/Foundation.h>

@implementation AVCPlugin

-(instancetype) initWithBridge:(Bridge *)bridge pluginId:(NSString *)pluginId {
  self.bridge = bridge;
  self.pluginId = pluginId;
  self.eventListeners = [[NSMutableDictionary alloc] init];
  return self;
}

-(NSString *) getId {
  return self.pluginId;
}

-(BOOL) getBool:(AVCPluginCall *)call field:(NSString *)field defaultValue:(BOOL)defaultValue {
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

- (void)addEventListener:(NSString *)eventName listener:(AVCPluginCall *)listener {
  NSMutableArray *listenersForEvent = [self.eventListeners objectForKey:eventName];
  if(!listenersForEvent) {
    listenersForEvent = [[NSMutableArray alloc] initWithObjects:listener, nil];
    [self.eventListeners setValue:listenersForEvent forKey:eventName];
  } else {
    [listenersForEvent addObject:listener];
  }
}

- (void)removeEventListener:(NSString *)eventName listener:(AVCPluginCall *)listener {
  NSMutableArray *listenersForEvent = [self.eventListeners objectForKey:eventName];
  if(!listenersForEvent) { return; }
  NSUInteger listenerIndex = [listenersForEvent indexOfObject:listener];
  if(listenerIndex == NSNotFound) {
    return;
  }
  [listenersForEvent removeObjectAtIndex:listenerIndex];
}

- (void)notifyListeners:(NSString *)eventName data:(NSDictionary<NSString *,id> *)data {
  NSArray<AVCPluginCall *> *listenersForEvent = [self.eventListeners objectForKey:eventName];
  if(listenersForEvent == nil) {
    return;
  }
  
  for(AVCPluginCall *call in listenersForEvent) {
    AVCPluginCallResult *result = [[AVCPluginCallResult alloc] init:data];
    call.successHandler(result);
  }
}


- (void)addListener:(AVCPluginCall *)call {
  NSString *eventName = [call.options objectForKey:@"eventName"];
  [self addEventListener:eventName listener:call];
}

- (void)removeListener:(AVCPluginCall *)call {
  NSString *eventName = [call.options objectForKey:@"eventName"];
  [self removeEventListener:eventName listener:call];
}
/*
 -(BOOL) getBool:(AVCPluginCall *)call field:(NSString *)field defaultValue:(BOOL)defaultValue {
 NSNumber *value = [call getBool:field defaultValue:nil];
 if(value == nil) {
 return defaultValue;
 }
 if(value.integerValue == 0) {
 return FALSE;
 }
 return TRUE;
 }*/


@end

