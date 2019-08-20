/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

#import "CDVCommandDelegateImpl.h"
#import "CDVPluginResult.h"
#import <WebKit/WebKit.h>

@implementation CDVCommandDelegateImpl

@synthesize urlTransformer;

- (id)initWithWebView:(WKWebView*)webView pluginManager:(CDVPluginManager *)manager
{
    self = [super init];
    if (self != nil) {
        _webView = webView;
        _manager = manager;
        NSError* err = nil;
        _callbackIdPattern = [NSRegularExpression regularExpressionWithPattern:@"[^A-Za-z0-9._-]" options:0 error:&err];
        if (err != nil) {
            // Couldn't initialize Regex
            NSLog(@"Error: Couldn't initialize regex");
            _callbackIdPattern = nil;
        }
    }
    return self;
}

- (NSString*)pathForResource:(NSString*)resourcepath
{
    NSBundle* mainBundle = [NSBundle mainBundle];
    NSMutableArray* directoryParts = [NSMutableArray arrayWithArray:[resourcepath componentsSeparatedByString:@"/"]];
    NSString* filename = [directoryParts lastObject];

    [directoryParts removeLastObject];

    NSString* directoryPartsJoined = [directoryParts componentsJoinedByString:@"/"];
    NSString* baseFolder = @"public";
    NSString* directoryStr = baseFolder;

    if ([directoryPartsJoined length] > 0) {
        directoryStr = [NSString stringWithFormat:@"%@/%@", baseFolder, [directoryParts componentsJoinedByString:@"/"]];
    }

    return [mainBundle pathForResource:filename ofType:@"" inDirectory:directoryStr];
}

- (void)flushCommandQueueWithDelayedJs
{
    _delayResponses = YES;
    _delayResponses = NO;
}

- (void)evalJsHelper2:(NSString*)js
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [_webView evaluateJavaScript:js completionHandler:^(id obj, NSError* error) {
        // TODO: obj can be something other than string
        if ([obj isKindOfClass:[NSString class]]) {
            NSString* commandsJSON = (NSString*)obj;
            if ([commandsJSON length] > 0) {
                NSLog(@"Exec: Retrieved new exec messages by chaining.");
            }
        }
        }];
    });
}

- (BOOL)isValidCallbackId:(NSString*)callbackId
{
    if ((callbackId == nil) || (_callbackIdPattern == nil)) {
        return NO;
    }

    // Disallow if too long or if any invalid characters were found.
    if (([callbackId length] > 100) || [_callbackIdPattern firstMatchInString:callbackId options:0 range:NSMakeRange(0, [callbackId length])]) {
        return NO;
    }
    return YES;
}

- (void)sendPluginResult:(CDVPluginResult*)result callbackId:(NSString*)callbackId
{
    // This occurs when there is are no win/fail callbacks for the call.
    if ([@"INVALID" isEqualToString:callbackId]) {
        return;
    }
    // This occurs when the callback id is malformed.
    if (![self isValidCallbackId:callbackId]) {
        NSLog(@"Invalid callback id received by sendPluginResult");
        return;
    }
    int status = [result.status intValue];
    BOOL keepCallback = [result.keepCallback boolValue];
    NSString* argumentsAsJSON = [result argumentsAsJSON];
    BOOL debug = NO;
    
#ifdef DEBUG
    debug = YES;
#endif

    NSString* js = [NSString stringWithFormat:@"cordova.require('cordova/exec').nativeCallback('%@',%d,%@,%d, %d)", callbackId, status, argumentsAsJSON, keepCallback, debug];

    [self evalJsHelper2:js];
}

- (void)evalJs:(NSString*)js
{
    [self evalJs:js scheduledOnRunLoop:YES];
}

- (void)evalJs:(NSString*)js scheduledOnRunLoop:(BOOL)scheduledOnRunLoop
{
    js = [NSString stringWithFormat:@"try{cordova.require('cordova/exec').nativeEvalAndFetch(function(){%@})}catch(e){console.log('exception nativeEvalAndFetch : '+e);};", js];
     [self evalJsHelper2:js];
}

- (id)getCommandInstance:(NSString*)pluginName
{
    return [_manager getCommandInstance:pluginName];
}

- (void)runInBackground:(void (^)())block
{
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), block);
}

- (NSString*)userAgent
{
    return nil;
}

- (NSDictionary*)settings
{
    return _manager.settings;
}

@end
