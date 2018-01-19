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

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "CDVPluginResult.h"
#import "CDVCommandDelegate.h"
#import "CDVAvailability.h"

@interface UIView (org_apache_cordova_UIView_Extension)

@property (nonatomic, weak) UIScrollView* scrollView;

@end

extern NSString* const CDVPageDidLoadNotification;
extern NSString* const CDVPluginHandleOpenURLNotification;
extern NSString* const CDVPluginResetNotification;
extern NSString* const CDVViewWillAppearNotification;
extern NSString* const CDVViewDidAppearNotification;
extern NSString* const CDVViewWillDisappearNotification;
extern NSString* const CDVViewDidDisappearNotification;
extern NSString* const CDVViewWillLayoutSubviewsNotification;
extern NSString* const CDVViewDidLayoutSubviewsNotification;
extern NSString* const CDVViewWillTransitionToSizeNotification;

/*
 * The local and remote push notification functionality has been removed from the core in cordova-ios 4.x,
 * but these constants have unfortunately have not been removed, but will be removed in 5.x.
 * 
 * To have the same functionality as 3.x, use a third-party plugin or the experimental
 * https://github.com/apache/cordova-plugins/tree/master/notification-rebroadcast
 */


@interface CDVPlugin : NSObject {}

@property (nonatomic, weak) UIView* webView;
@property (nonatomic, weak) id webViewEngine;

@property (nonatomic, weak) UIViewController* viewController;
@property (nonatomic, strong) id <CDVCommandDelegate> commandDelegate;

- (void)pluginInitialize;

- (void)handleOpenURL:(NSNotification*)notification;
- (void)onAppTerminate;
- (void)onMemoryWarning;
- (void)onReset;
- (void)dispose;

/*
 // see initWithWebView implementation
 - (void) onPause {}
 - (void) onResume {}
 - (void) onOrientationWillChange {}
 - (void) onOrientationDidChange {}
 */

- (id)appDelegate;

@end
