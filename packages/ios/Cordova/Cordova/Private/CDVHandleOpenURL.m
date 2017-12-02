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

#import "CDVHandleOpenURL.h"
#import "CDV.h"

@implementation CDVHandleOpenURL

- (void)pluginInitialize
{
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(applicationLaunchedWithUrl:) name:CDVPluginHandleOpenURLNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(applicationPageDidLoad:) name:CDVPageDidLoadNotification object:nil];
}

- (void)applicationLaunchedWithUrl:(NSNotification*)notification
{
    NSURL* url = [notification object];

    self.url = url;

    // warm-start handler
    if (self.pageLoaded) {
        [self processOpenUrl:self.url pageLoaded:YES];
        self.url = nil;
    }
}

- (void)applicationPageDidLoad:(NSNotification*)notification
{
    // cold-start handler

    self.pageLoaded = YES;

    if (self.url) {
        [self processOpenUrl:self.url pageLoaded:YES];
        self.url = nil;
    }
}

- (void)processOpenUrl:(NSURL*)url pageLoaded:(BOOL)pageLoaded
{
    __weak __typeof(self) weakSelf = self;

    dispatch_block_t handleOpenUrl = ^(void) {
        // calls into javascript global function 'handleOpenURL'
        NSString* jsString = [NSString stringWithFormat:@"document.addEventListener('deviceready',function(){if (typeof handleOpenURL === 'function') { handleOpenURL(\"%@\");}});", url.absoluteString];

        [weakSelf.webViewEngine evaluateJavaScript:jsString completionHandler:nil];
    };

    if (!pageLoaded) {
        NSString* jsString = @"document.readystate";
        [self.webViewEngine evaluateJavaScript:jsString
                             completionHandler:^(id object, NSError* error) {
            if ((error == nil) && [object isKindOfClass:[NSString class]]) {
                NSString* readyState = (NSString*)object;
                BOOL ready = [readyState isEqualToString:@"loaded"] || [readyState isEqualToString:@"complete"];
                if (ready) {
                    handleOpenUrl();
                } else {
                    self.url = url;
                }
            }
        }];
    } else {
        handleOpenUrl();
    }
}

@end
