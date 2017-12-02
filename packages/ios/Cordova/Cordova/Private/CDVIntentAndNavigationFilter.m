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

#import "CDVIntentAndNavigationFilter.h"
#import <Cordova/CDV.h>

@interface CDVIntentAndNavigationFilter ()

@property (nonatomic, readwrite) NSMutableArray* allowIntents;
@property (nonatomic, readwrite) NSMutableArray* allowNavigations;
@property (nonatomic, readwrite) CDVWhitelist* allowIntentsWhitelist;
@property (nonatomic, readwrite) CDVWhitelist* allowNavigationsWhitelist;

@end

@implementation CDVIntentAndNavigationFilter

#pragma mark NSXMLParserDelegate

- (void)parser:(NSXMLParser*)parser didStartElement:(NSString*)elementName namespaceURI:(NSString*)namespaceURI qualifiedName:(NSString*)qualifiedName attributes:(NSDictionary*)attributeDict
{
    if ([elementName isEqualToString:@"allow-navigation"]) {
        [self.allowNavigations addObject:attributeDict[@"href"]];
    }
    if ([elementName isEqualToString:@"allow-intent"]) {
        [self.allowIntents addObject:attributeDict[@"href"]];
    }
}

- (void)parserDidStartDocument:(NSXMLParser*)parser
{
    // file: url <allow-navigations> are added by default
    self.allowNavigations = [[NSMutableArray alloc] initWithArray:@[ @"file://" ]];
    // no intents are added by default
    self.allowIntents = [[NSMutableArray alloc] init];
}

- (void)parserDidEndDocument:(NSXMLParser*)parser
{
    self.allowIntentsWhitelist = [[CDVWhitelist alloc] initWithArray:self.allowIntents];
    self.allowNavigationsWhitelist = [[CDVWhitelist alloc] initWithArray:self.allowNavigations];
}

- (void)parser:(NSXMLParser*)parser parseErrorOccurred:(NSError*)parseError
{
    NSAssert(NO, @"config.xml parse error line %ld col %ld", (long)[parser lineNumber], (long)[parser columnNumber]);
}

#pragma mark CDVPlugin

- (void)pluginInitialize
{
    if ([self.viewController isKindOfClass:[CDVViewController class]]) {
        [(CDVViewController*)self.viewController parseSettingsWithParser:self];
    }
}

+ (CDVIntentAndNavigationFilterValue) filterUrl:(NSURL*)url intentsWhitelist:(CDVWhitelist*)intentsWhitelist navigationsWhitelist:(CDVWhitelist*)navigationsWhitelist
{
    // a URL can only allow-intent OR allow-navigation, if both are specified,
    // only allow-navigation is allowed
    
    BOOL allowNavigationsPass = [navigationsWhitelist URLIsAllowed:url logFailure:NO];
    BOOL allowIntentPass = [intentsWhitelist URLIsAllowed:url logFailure:NO];
    
    if (allowNavigationsPass && allowIntentPass) {
        return CDVIntentAndNavigationFilterValueNavigationAllowed;
    } else if (allowNavigationsPass) {
        return CDVIntentAndNavigationFilterValueNavigationAllowed;
    } else if (allowIntentPass) {
        return CDVIntentAndNavigationFilterValueIntentAllowed;
    }
    
    return CDVIntentAndNavigationFilterValueNoneAllowed;
}

- (CDVIntentAndNavigationFilterValue) filterUrl:(NSURL*)url
{
    return [[self class] filterUrl:url intentsWhitelist:self.allowIntentsWhitelist navigationsWhitelist:self.allowNavigationsWhitelist];
}

+ (BOOL)shouldOpenURLRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType
{
    return (UIWebViewNavigationTypeLinkClicked == navigationType ||
        (UIWebViewNavigationTypeOther == navigationType &&
         [[request.mainDocumentURL absoluteString] isEqualToString:[request.URL absoluteString]]
         )
        );
}

+ (BOOL)shouldOverrideLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType filterValue:(CDVIntentAndNavigationFilterValue)filterValue
{
    NSString* allowIntents_whitelistRejectionFormatString = @"ERROR External navigation rejected - <allow-intent> not set for url='%@'";
    NSString* allowNavigations_whitelistRejectionFormatString = @"ERROR Internal navigation rejected - <allow-navigation> not set for url='%@'";
    
    NSURL* url = [request URL];
    
    switch (filterValue) {
        case CDVIntentAndNavigationFilterValueNavigationAllowed:
            return YES;
        case CDVIntentAndNavigationFilterValueIntentAllowed:
            // only allow-intent if it's a UIWebViewNavigationTypeLinkClicked (anchor tag) OR
            // it's a UIWebViewNavigationTypeOther, and it's an internal link
            if ([[self class] shouldOpenURLRequest:request navigationType:navigationType]){
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 100000
                // CB-11895; openURL with a single parameter is deprecated in iOS 10
                // see https://useyourloaf.com/blog/openurl-deprecated-in-ios10
                if ([[UIApplication sharedApplication] respondsToSelector:@selector(openURL:options:completionHandler:)]) {
                    [[UIApplication sharedApplication] openURL:url options:@{} completionHandler:nil];
                } else {
                    [[UIApplication sharedApplication] openURL:url];
                }
#else
                // fall back if on older SDK
                [[UIApplication sharedApplication] openURL:url];
#endif
            }
            
            // consume the request (i.e. no error) if it wasn't handled above
            return NO;
        case CDVIntentAndNavigationFilterValueNoneAllowed:
            // allow-navigation attempt failed for sure
            NSLog(@"%@", [NSString stringWithFormat:allowNavigations_whitelistRejectionFormatString, [url absoluteString]]);
            // anchor tag link means it was an allow-intent attempt that failed as well
            if (UIWebViewNavigationTypeLinkClicked == navigationType) {
                NSLog(@"%@", [NSString stringWithFormat:allowIntents_whitelistRejectionFormatString, [url absoluteString]]);
            }
            return NO;
    }
}

- (BOOL)shouldOverrideLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType
{
    return [[self class] shouldOverrideLoadWithRequest:request navigationType:navigationType filterValue:[self filterUrl:request.URL]];
}

@end
