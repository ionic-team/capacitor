#import "CAPPlugin.h"
#import "CAPPluginCall.h"
#import <Foundation/Foundation.h>

// Implemented in Swift (CAPPlugin+Bridge.swift), which can't be imported here without a circular
// dependency. Declared locally rather than in the header so Swift doesn't see a redeclaration.
@interface CAPPlugin (SwiftVended)
- (void)notifyListeners:(NSString* _Nonnull)eventName data:(NSDictionary<NSString *, id>* _Nullable)data;
@end

@implementation CAPPlugin

- (instancetype)init {
  if ((self = [super init])) {
    _pluginId = @"";
    _pluginName = @"";
    _eventListeners = [[NSMutableDictionary alloc] init];
    _retainedEventArguments = [[NSMutableDictionary alloc] init];
    _shouldStringifyDatesInCalls = YES;
  }
  return self;
}

-(NSString *) getId {
  return self.pluginName;
}

-(void)load {}

- (void)addEventListener:(NSString *)eventName listener:(CAPPluginCall *)listener {
  NSMutableArray *listenersForEvent = [self.eventListeners objectForKey:eventName];
  if(listenersForEvent == nil || [listenersForEvent count] == 0) {
    listenersForEvent = [[NSMutableArray alloc] initWithObjects:listener, nil];
    [self.eventListeners setValue:listenersForEvent forKey:eventName];

    [self sendRetainedArgumentsForEvent:eventName];
  } else {
    [listenersForEvent addObject:listener];
  }
}

- (void)sendRetainedArgumentsForEvent:(NSString *)eventName {
    // copy retained args and null source to prevent potential race conditions
    NSMutableArray *retained = [self.retainedEventArguments objectForKey:eventName];
    if (retained == nil) {
        return;
    }

    [self.retainedEventArguments removeObjectForKey:eventName];

    for(id data in retained) {
        [self notifyListeners:eventName data:data];
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

- (void)addListener:(CAPPluginCall *)call {
  NSString *eventName = [call.options objectForKey:@"eventName"];
  [call setKeepAlive:TRUE];
  [self addEventListener:eventName listener:call];
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

