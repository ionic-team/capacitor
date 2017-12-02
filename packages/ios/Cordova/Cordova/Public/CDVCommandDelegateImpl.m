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
#import "CDVJSON_private.h"
#import "CDVCommandQueue.h"
#import "CDVPluginResult.h"
#import "CDVViewController.h"

@implementation CDVCommandDelegateImpl

@synthesize urlTransformer;

- (id)initWithViewController:(CDVViewController*)viewController
{
    self = [super init];
    if (self != nil) {
        _viewController = viewController;
        _commandQueue = _viewController.commandQueue;

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
    NSString* directoryStr = _viewController.wwwFolderName;

    if ([directoryPartsJoined length] > 0) {
        directoryStr = [NSString stringWithFormat:@"%@/%@", _viewController.wwwFolderName, [directoryParts componentsJoinedByString:@"/"]];
    }

    return [mainBundle pathForResource:filename ofType:@"" inDirectory:directoryStr];
}

- (void)flushCommandQueueWithDelayedJs
{
    _delayResponses = YES;
    [_commandQueue executePending];
    _delayResponses = NO;
}

- (void)evalJsHelper2:(NSString*)js
{
    CDV_EXEC_LOG(@"Exec: evalling: %@", [js substringToIndex:MIN([js length], 160)]);
    [_viewController.webViewEngine evaluateJavaScript:js completionHandler:^(id obj, NSError* error) {
        // TODO: obj can be something other than string
        if ([obj isKindOfClass:[NSString class]]) {
            NSString* commandsJSON = (NSString*)obj;
            if ([commandsJSON length] > 0) {
                CDV_EXEC_LOG(@"Exec: Retrieved new exec messages by chaining.");
            }

            [_commandQueue enqueueCommandBatch:commandsJSON];
            [_commandQueue executePending];
        }
    }];
}

- (void)evalJsHelper:(NSString*)js
{
    // Cycle the run-loop before executing the JS.
    // For _delayResponses -
    //    This ensures that we don't eval JS during the middle of an existing JS
    //    function (possible since UIWebViewDelegate callbacks can be synchronous).
    // For !isMainThread -
    //    It's a hard error to eval on the non-UI thread.
    // For !_commandQueue.currentlyExecuting -
    //     This works around a bug where sometimes alerts() within callbacks can cause
    //     dead-lock.
    //     If the commandQueue is currently executing, then we know that it is safe to
    //     execute the callback immediately.
    // Using    (dispatch_get_main_queue()) does *not* fix deadlocks for some reason,
    // but performSelectorOnMainThread: does.
    if (_delayResponses || ![NSThread isMainThread] || !_commandQueue.currentlyExecuting) {
        [self performSelectorOnMainThread:@selector(evalJsHelper2:) withObject:js waitUntilDone:NO];
    } else {
        [self evalJsHelper2:js];
    }
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
    CDV_EXEC_LOG(@"Exec(%@): Sending result. Status=%@", callbackId, result.status);
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

    [self evalJsHelper:js];
}

- (void)evalJs:(NSString*)js
{
    [self evalJs:js scheduledOnRunLoop:YES];
}

- (void)evalJs:(NSString*)js scheduledOnRunLoop:(BOOL)scheduledOnRunLoop
{
    js = [NSString stringWithFormat:@"try{cordova.require('cordova/exec').nativeEvalAndFetch(function(){%@})}catch(e){console.log('exception nativeEvalAndFetch : '+e);};", js];
    if (scheduledOnRunLoop) {
        [self evalJsHelper:js];
    } else {
        [self evalJsHelper2:js];
    }
}

- (id)getCommandInstance:(NSString*)pluginName
{
    return [_viewController getCommandInstance:pluginName];
}

- (void)runInBackground:(void (^)())block
{
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), block);
}

- (NSString*)userAgent
{
    return [_viewController userAgent];
}

- (NSDictionary*)settings
{
    return _viewController.settings;
}

@end
