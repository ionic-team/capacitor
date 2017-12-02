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

#import <objc/message.h>
#import "CDV.h"
#import "CDVPlugin+Private.h"
#import "CDVConfigParser.h"
#import "CDVUserAgentUtil.h"
#import <AVFoundation/AVFoundation.h>
#import "NSDictionary+CordovaPreferences.h"
#import "CDVLocalStorage.h"
#import "CDVCommandDelegateImpl.h"
#import <Foundation/NSCharacterSet.h>

@interface CDVViewController () {
    NSInteger _userAgentLockToken;
}

@property (nonatomic, readwrite, strong) NSXMLParser* configParser;
@property (nonatomic, readwrite, strong) NSMutableDictionary* settings;
@property (nonatomic, readwrite, strong) NSMutableDictionary* pluginObjects;
@property (nonatomic, readwrite, strong) NSMutableArray* startupPluginNames;
@property (nonatomic, readwrite, strong) NSDictionary* pluginsMap;
@property (nonatomic, readwrite, strong) id <CDVWebViewEngineProtocol> webViewEngine;

@property (readwrite, assign) BOOL initialized;

@property (atomic, strong) NSURL* openURL;

@end

@implementation CDVViewController

@synthesize supportedOrientations;
@synthesize pluginObjects, pluginsMap, startupPluginNames;
@synthesize configParser, settings;
@synthesize wwwFolderName, startPage, initialized, openURL, baseUserAgent;
@synthesize commandDelegate = _commandDelegate;
@synthesize commandQueue = _commandQueue;
@synthesize webViewEngine = _webViewEngine;
@dynamic webView;

- (void)__init
{
    if ((self != nil) && !self.initialized) {
        _commandQueue = [[CDVCommandQueue alloc] initWithViewController:self];
        _commandDelegate = [[CDVCommandDelegateImpl alloc] initWithViewController:self];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onAppWillTerminate:)
                                                     name:UIApplicationWillTerminateNotification object:nil];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onAppWillResignActive:)
                                                     name:UIApplicationWillResignActiveNotification object:nil];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onAppDidBecomeActive:)
                                                     name:UIApplicationDidBecomeActiveNotification object:nil];

        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onAppWillEnterForeground:)
                                                     name:UIApplicationWillEnterForegroundNotification object:nil];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onAppDidEnterBackground:)
                                                     name:UIApplicationDidEnterBackgroundNotification object:nil];

        // read from UISupportedInterfaceOrientations (or UISupportedInterfaceOrientations~iPad, if its iPad) from -Info.plist
        self.supportedOrientations = [self parseInterfaceOrientations:
            [[[NSBundle mainBundle] infoDictionary] objectForKey:@"UISupportedInterfaceOrientations"]];

        [self printVersion];
        [self printMultitaskingInfo];
        [self printPlatformVersionWarning];
        self.initialized = YES;
    }
}

- (id)initWithNibName:(NSString*)nibNameOrNil bundle:(NSBundle*)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    [self __init];
    return self;
}

- (id)initWithCoder:(NSCoder*)aDecoder
{
    self = [super initWithCoder:aDecoder];
    [self __init];
    return self;
}

- (id)init
{
    self = [super init];
    [self __init];
    return self;
}

- (void)printVersion
{
    NSLog(@"Apache Cordova native platform version %@ is starting.", CDV_VERSION);
}

- (void)printPlatformVersionWarning
{
    if (!IsAtLeastiOSVersion(@"8.0")) {
        NSLog(@"CRITICAL: For Cordova 4.0.0 and above, you will need to upgrade to at least iOS 8.0 or greater. Your current version of iOS is %@.",
            [[UIDevice currentDevice] systemVersion]
            );
    }
}

- (void)printMultitaskingInfo
{
    UIDevice* device = [UIDevice currentDevice];
    BOOL backgroundSupported = NO;

    if ([device respondsToSelector:@selector(isMultitaskingSupported)]) {
        backgroundSupported = device.multitaskingSupported;
    }

    NSNumber* exitsOnSuspend = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"UIApplicationExitsOnSuspend"];
    if (exitsOnSuspend == nil) { // if it's missing, it should be NO (i.e. multi-tasking on by default)
        exitsOnSuspend = [NSNumber numberWithBool:NO];
    }

    NSLog(@"Multi-tasking -> Device: %@, App: %@", (backgroundSupported ? @"YES" : @"NO"), (![exitsOnSuspend intValue]) ? @"YES" : @"NO");
}

-(NSString*)configFilePath{
    NSString* path = self.configFile ?: @"config.xml";

    // if path is relative, resolve it against the main bundle
    if(![path isAbsolutePath]){
        NSString* absolutePath = [[NSBundle mainBundle] pathForResource:path ofType:nil];
        if(!absolutePath){
            NSAssert(NO, @"ERROR: %@ not found in the main bundle!", path);
        }
        path = absolutePath;
    }

    // Assert file exists
    if (![[NSFileManager defaultManager] fileExistsAtPath:path]) {
        NSAssert(NO, @"ERROR: %@ does not exist. Please run cordova-ios/bin/cordova_plist_to_config_xml path/to/project.", path);
        return nil;
    }

    return path;
}

- (void)parseSettingsWithParser:(NSObject <NSXMLParserDelegate>*)delegate
{
    // read from config.xml in the app bundle
    NSString* path = [self configFilePath];

    NSURL* url = [NSURL fileURLWithPath:path];

    self.configParser = [[NSXMLParser alloc] initWithContentsOfURL:url];
    if (self.configParser == nil) {
        NSLog(@"Failed to initialize XML parser.");
        return;
    }
    [self.configParser setDelegate:((id < NSXMLParserDelegate >)delegate)];
    [self.configParser parse];
}

- (void)loadSettings
{
    CDVConfigParser* delegate = [[CDVConfigParser alloc] init];

    [self parseSettingsWithParser:delegate];

    // Get the plugin dictionary, whitelist and settings from the delegate.
    self.pluginsMap = delegate.pluginsDict;
    self.startupPluginNames = delegate.startupPluginNames;
    self.settings = delegate.settings;

    // And the start folder/page.
    if(self.wwwFolderName == nil){
        self.wwwFolderName = @"www";
    }
    if(delegate.startPage && self.startPage == nil){
        self.startPage = delegate.startPage;
    }
    if (self.startPage == nil) {
        self.startPage = @"index.html";
    }

    // Initialize the plugin objects dict.
    self.pluginObjects = [[NSMutableDictionary alloc] initWithCapacity:20];
}

- (NSURL*)appUrl
{
    NSURL* appURL = nil;

    if ([self.startPage rangeOfString:@"://"].location != NSNotFound) {
        appURL = [NSURL URLWithString:self.startPage];
    } else if ([self.wwwFolderName rangeOfString:@"://"].location != NSNotFound) {
        appURL = [NSURL URLWithString:[NSString stringWithFormat:@"%@/%@", self.wwwFolderName, self.startPage]];
    } else if([self.wwwFolderName rangeOfString:@".bundle"].location != NSNotFound){
        // www folder is actually a bundle
        NSBundle* bundle = [NSBundle bundleWithPath:self.wwwFolderName];
        appURL = [bundle URLForResource:self.startPage withExtension:nil];
    } else if([self.wwwFolderName rangeOfString:@".framework"].location != NSNotFound){
        // www folder is actually a framework
        NSBundle* bundle = [NSBundle bundleWithPath:self.wwwFolderName];
        appURL = [bundle URLForResource:self.startPage withExtension:nil];
    } else {
        // CB-3005 strip parameters from start page to check if page exists in resources
        NSURL* startURL = [NSURL URLWithString:self.startPage];
        NSString* startFilePath = [self.commandDelegate pathForResource:[startURL path]];

        if (startFilePath == nil) {
            appURL = nil;
        } else {
            appURL = [NSURL fileURLWithPath:startFilePath];
            // CB-3005 Add on the query params or fragment.
            NSString* startPageNoParentDirs = self.startPage;
            NSRange r = [startPageNoParentDirs rangeOfCharacterFromSet:[NSCharacterSet characterSetWithCharactersInString:@"?#"] options:0];
            if (r.location != NSNotFound) {
                NSString* queryAndOrFragment = [self.startPage substringFromIndex:r.location];
                appURL = [NSURL URLWithString:queryAndOrFragment relativeToURL:appURL];
            }
        }
    }

    return appURL;
}

- (NSURL*)errorURL
{
    NSURL* errorUrl = nil;

    id setting = [self.settings cordovaSettingForKey:@"ErrorUrl"];

    if (setting) {
        NSString* errorUrlString = (NSString*)setting;
        if ([errorUrlString rangeOfString:@"://"].location != NSNotFound) {
            errorUrl = [NSURL URLWithString:errorUrlString];
        } else {
            NSURL* url = [NSURL URLWithString:(NSString*)setting];
            NSString* errorFilePath = [self.commandDelegate pathForResource:[url path]];
            if (errorFilePath) {
                errorUrl = [NSURL fileURLWithPath:errorFilePath];
            }
        }
    }

    return errorUrl;
}

- (UIView*)webView
{
    if (self.webViewEngine != nil) {
        return self.webViewEngine.engineWebView;
    }

    return nil;
}

// Implement viewDidLoad to do additional setup after loading the view, typically from a nib.
- (void)viewDidLoad
{
    [super viewDidLoad];

    // Load settings
    [self loadSettings];

    NSString* backupWebStorageType = @"cloud"; // default value

    id backupWebStorage = [self.settings cordovaSettingForKey:@"BackupWebStorage"];
    if ([backupWebStorage isKindOfClass:[NSString class]]) {
        backupWebStorageType = backupWebStorage;
    }
    [self.settings setCordovaSetting:backupWebStorageType forKey:@"BackupWebStorage"];

    [CDVLocalStorage __fixupDatabaseLocationsWithBackupType:backupWebStorageType];

    // // Instantiate the WebView ///////////////

    if (!self.webView) {
        [self createGapView];
    }

    // /////////////////

    /*
     * Fire up CDVLocalStorage to work-around WebKit storage limitations: on all iOS 5.1+ versions for local-only backups, but only needed on iOS 5.1 for cloud backup.
        With minimum iOS 7/8 supported, only first clause applies.
     */
    if ([backupWebStorageType isEqualToString:@"local"]) {
        NSString* localStorageFeatureName = @"localstorage";
        if ([self.pluginsMap objectForKey:localStorageFeatureName]) { // plugin specified in config
            [self.startupPluginNames addObject:localStorageFeatureName];
        }
    }

    if ([self.startupPluginNames count] > 0) {
        [CDVTimer start:@"TotalPluginStartup"];

        for (NSString* pluginName in self.startupPluginNames) {
            [CDVTimer start:pluginName];
            [self getCommandInstance:pluginName];
            [CDVTimer stop:pluginName];
        }

        [CDVTimer stop:@"TotalPluginStartup"];
    }

    // /////////////////
    NSURL* appURL = [self appUrl];
    __weak __typeof__(self) weakSelf = self;

    [CDVUserAgentUtil acquireLock:^(NSInteger lockToken) {
        // Fix the memory leak caused by the strong reference.
        [weakSelf setLockToken:lockToken];
        if (appURL) {
            NSURLRequest* appReq = [NSURLRequest requestWithURL:appURL cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:20.0];
            [self.webViewEngine loadRequest:appReq];
        } else {
            NSString* loadErr = [NSString stringWithFormat:@"ERROR: Start Page at '%@/%@' was not found.", self.wwwFolderName, self.startPage];
            NSLog(@"%@", loadErr);

            NSURL* errorUrl = [self errorURL];
            if (errorUrl) {
                errorUrl = [NSURL URLWithString:[NSString stringWithFormat:@"?error=%@", [loadErr stringByAddingPercentEncodingWithAllowedCharacters:NSCharacterSet.URLPathAllowedCharacterSet]] relativeToURL:errorUrl];
                NSLog(@"%@", [errorUrl absoluteString]);
                [self.webViewEngine loadRequest:[NSURLRequest requestWithURL:errorUrl]];
            } else {
                NSString* html = [NSString stringWithFormat:@"<html><body> %@ </body></html>", loadErr];
                [self.webViewEngine loadHTMLString:html baseURL:nil];
            }
        }
    }];
    
    // /////////////////
    
    NSString* bgColorString = [self.settings cordovaSettingForKey:@"BackgroundColor"];
    UIColor* bgColor = [self colorFromColorString:bgColorString];
    [self.webView setBackgroundColor:bgColor];
}

- (void)setLockToken:(NSInteger)lockToken
{
	_userAgentLockToken = lockToken;
	[CDVUserAgentUtil setUserAgent:self.userAgent lockToken:lockToken];
}

-(void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVViewWillAppearNotification object:nil]];
}

-(void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVViewDidAppearNotification object:nil]];
}

-(void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];
    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVViewWillDisappearNotification object:nil]];
}

-(void)viewDidDisappear:(BOOL)animated
{
    [super viewDidDisappear:animated];
    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVViewDidDisappearNotification object:nil]];
}

-(void)viewWillLayoutSubviews
{
    [super viewWillLayoutSubviews];
    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVViewWillLayoutSubviewsNotification object:nil]];
}

-(void)viewDidLayoutSubviews
{
    [super viewDidLayoutSubviews];
    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVViewDidLayoutSubviewsNotification object:nil]];
}

-(void)viewWillTransitionToSize:(CGSize)size withTransitionCoordinator:(id<UIViewControllerTransitionCoordinator>)coordinator
{
    [super viewWillTransitionToSize:size withTransitionCoordinator:coordinator];
    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVViewWillTransitionToSizeNotification object:[NSValue valueWithCGSize:size]]];
}

- (UIColor*)colorFromColorString:(NSString*)colorString
{
    // No value, nothing to do
    if (!colorString) {
        return nil;
    }
    
    // Validate format
    NSError* error = NULL;
    NSRegularExpression* regex = [NSRegularExpression regularExpressionWithPattern:@"^(#[0-9A-F]{3}|(0x|#)([0-9A-F]{2})?[0-9A-F]{6})$" options:NSRegularExpressionCaseInsensitive error:&error];
    NSUInteger countMatches = [regex numberOfMatchesInString:colorString options:0 range:NSMakeRange(0, [colorString length])];
    
    if (!countMatches) {
        return nil;
    }
    
    // #FAB to #FFAABB
    if ([colorString hasPrefix:@"#"] && [colorString length] == 4) {
        NSString* r = [colorString substringWithRange:NSMakeRange(1, 1)];
        NSString* g = [colorString substringWithRange:NSMakeRange(2, 1)];
        NSString* b = [colorString substringWithRange:NSMakeRange(3, 1)];
        colorString = [NSString stringWithFormat:@"#%@%@%@%@%@%@", r, r, g, g, b, b];
    }
    
    // #RRGGBB to 0xRRGGBB
    colorString = [colorString stringByReplacingOccurrencesOfString:@"#" withString:@"0x"];
    
    // 0xRRGGBB to 0xAARRGGBB
    if ([colorString hasPrefix:@"0x"] && [colorString length] == 8) {
        colorString = [@"0xFF" stringByAppendingString:[colorString substringFromIndex:2]];
    }
    
    // 0xAARRGGBB to int
    unsigned colorValue = 0;
    NSScanner *scanner = [NSScanner scannerWithString:colorString];
    if (![scanner scanHexInt:&colorValue]) {
        return nil;
    }
    
    // int to UIColor
    return [UIColor colorWithRed:((float)((colorValue & 0x00FF0000) >> 16))/255.0
                           green:((float)((colorValue & 0x0000FF00) >>  8))/255.0
                            blue:((float)((colorValue & 0x000000FF) >>  0))/255.0
                           alpha:((float)((colorValue & 0xFF000000) >> 24))/255.0];
}

- (NSArray*)parseInterfaceOrientations:(NSArray*)orientations
{
    NSMutableArray* result = [[NSMutableArray alloc] init];

    if (orientations != nil) {
        NSEnumerator* enumerator = [orientations objectEnumerator];
        NSString* orientationString;

        while (orientationString = [enumerator nextObject]) {
            if ([orientationString isEqualToString:@"UIInterfaceOrientationPortrait"]) {
                [result addObject:[NSNumber numberWithInt:UIInterfaceOrientationPortrait]];
            } else if ([orientationString isEqualToString:@"UIInterfaceOrientationPortraitUpsideDown"]) {
                [result addObject:[NSNumber numberWithInt:UIInterfaceOrientationPortraitUpsideDown]];
            } else if ([orientationString isEqualToString:@"UIInterfaceOrientationLandscapeLeft"]) {
                [result addObject:[NSNumber numberWithInt:UIInterfaceOrientationLandscapeLeft]];
            } else if ([orientationString isEqualToString:@"UIInterfaceOrientationLandscapeRight"]) {
                [result addObject:[NSNumber numberWithInt:UIInterfaceOrientationLandscapeRight]];
            }
        }
    }

    // default
    if ([result count] == 0) {
        [result addObject:[NSNumber numberWithInt:UIInterfaceOrientationPortrait]];
    }

    return result;
}

- (BOOL)shouldAutorotate
{
    return YES;
}

// CB-12098
#if __IPHONE_OS_VERSION_MAX_ALLOWED < 90000  
- (NSUInteger)supportedInterfaceOrientations  
#else  
- (UIInterfaceOrientationMask)supportedInterfaceOrientations
#endif
{
    NSUInteger ret = 0;

    if ([self supportsOrientation:UIInterfaceOrientationPortrait]) {
        ret = ret | (1 << UIInterfaceOrientationPortrait);
    }
    if ([self supportsOrientation:UIInterfaceOrientationPortraitUpsideDown]) {
        ret = ret | (1 << UIInterfaceOrientationPortraitUpsideDown);
    }
    if ([self supportsOrientation:UIInterfaceOrientationLandscapeRight]) {
        ret = ret | (1 << UIInterfaceOrientationLandscapeRight);
    }
    if ([self supportsOrientation:UIInterfaceOrientationLandscapeLeft]) {
        ret = ret | (1 << UIInterfaceOrientationLandscapeLeft);
    }

    return ret;
}

- (BOOL)supportsOrientation:(UIInterfaceOrientation)orientation
{
    return [self.supportedOrientations containsObject:[NSNumber numberWithInt:orientation]];
}

- (UIView*)newCordovaViewWithFrame:(CGRect)bounds
{
    NSString* defaultWebViewEngineClass = [self.settings cordovaSettingForKey:@"CordovaDefaultWebViewEngine"];
    NSString* webViewEngineClass = [self.settings cordovaSettingForKey:@"CordovaWebViewEngine"];

    if (!defaultWebViewEngineClass) {
        defaultWebViewEngineClass = @"CDVUIWebViewEngine";
    }
    if (!webViewEngineClass) {
        webViewEngineClass = defaultWebViewEngineClass;
    }

    // Find webViewEngine
    if (NSClassFromString(webViewEngineClass)) {
        self.webViewEngine = [[NSClassFromString(webViewEngineClass) alloc] initWithFrame:bounds];
        // if a webView engine returns nil (not supported by the current iOS version) or doesn't conform to the protocol, or can't load the request, we use UIWebView
        if (!self.webViewEngine || ![self.webViewEngine conformsToProtocol:@protocol(CDVWebViewEngineProtocol)] || ![self.webViewEngine canLoadRequest:[NSURLRequest requestWithURL:self.appUrl]]) {
            self.webViewEngine = [[NSClassFromString(defaultWebViewEngineClass) alloc] initWithFrame:bounds];
        }
    } else {
        self.webViewEngine = [[NSClassFromString(defaultWebViewEngineClass) alloc] initWithFrame:bounds];
    }

    if ([self.webViewEngine isKindOfClass:[CDVPlugin class]]) {
        [self registerPlugin:(CDVPlugin*)self.webViewEngine withClassName:webViewEngineClass];
    }

    return self.webViewEngine.engineWebView;
}

- (NSString*)userAgent
{
    if (_userAgent != nil) {
        return _userAgent;
    }

    NSString* localBaseUserAgent;
    if (self.baseUserAgent != nil) {
        localBaseUserAgent = self.baseUserAgent;
    } else if ([self.settings cordovaSettingForKey:@"OverrideUserAgent"] != nil) {
        localBaseUserAgent = [self.settings cordovaSettingForKey:@"OverrideUserAgent"];
    } else {
        localBaseUserAgent = [CDVUserAgentUtil originalUserAgent];
    }
    NSString* appendUserAgent = [self.settings cordovaSettingForKey:@"AppendUserAgent"];
    if (appendUserAgent) {
        _userAgent = [NSString stringWithFormat:@"%@ %@", localBaseUserAgent, appendUserAgent];
    } else {
        // Use our address as a unique number to append to the User-Agent.
        _userAgent = localBaseUserAgent;
    }
    return _userAgent;
}

- (void)createGapView
{
    CGRect webViewBounds = self.view.bounds;

    webViewBounds.origin = self.view.bounds.origin;

    UIView* view = [self newCordovaViewWithFrame:webViewBounds];

    view.autoresizingMask = (UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight);
    [self.view addSubview:view];
    [self.view sendSubviewToBack:view];
}

- (void)didReceiveMemoryWarning
{
    // iterate through all the plugin objects, and call hasPendingOperation
    // if at least one has a pending operation, we don't call [super didReceiveMemoryWarning]

    NSEnumerator* enumerator = [self.pluginObjects objectEnumerator];
    CDVPlugin* plugin;

    BOOL doPurge = YES;

    while ((plugin = [enumerator nextObject])) {
        if (plugin.hasPendingOperation) {
            NSLog(@"Plugin '%@' has a pending operation, memory purge is delayed for didReceiveMemoryWarning.", NSStringFromClass([plugin class]));
            doPurge = NO;
        }
    }

    if (doPurge) {
        // Releases the view if it doesn't have a superview.
        [super didReceiveMemoryWarning];
    }

    // Release any cached data, images, etc. that aren't in use.
}

- (void)viewDidUnload
{
    // Release any retained subviews of the main view.
    // e.g. self.myOutlet = nil;

    [CDVUserAgentUtil releaseLock:&_userAgentLockToken];

    [super viewDidUnload];
}

#pragma mark CordovaCommands

- (void)registerPlugin:(CDVPlugin*)plugin withClassName:(NSString*)className
{
    if ([plugin respondsToSelector:@selector(setViewController:)]) {
        [plugin setViewController:self];
    }

    if ([plugin respondsToSelector:@selector(setCommandDelegate:)]) {
        [plugin setCommandDelegate:_commandDelegate];
    }

    [self.pluginObjects setObject:plugin forKey:className];
    [plugin pluginInitialize];
}

- (void)registerPlugin:(CDVPlugin*)plugin withPluginName:(NSString*)pluginName
{
    if ([plugin respondsToSelector:@selector(setViewController:)]) {
        [plugin setViewController:self];
    }

    if ([plugin respondsToSelector:@selector(setCommandDelegate:)]) {
        [plugin setCommandDelegate:_commandDelegate];
    }

    NSString* className = NSStringFromClass([plugin class]);
    [self.pluginObjects setObject:plugin forKey:className];
    [self.pluginsMap setValue:className forKey:[pluginName lowercaseString]];
    [plugin pluginInitialize];
}

/**
 Returns an instance of a CordovaCommand object, based on its name.  If one exists already, it is returned.
 */
- (id)getCommandInstance:(NSString*)pluginName
{
    // first, we try to find the pluginName in the pluginsMap
    // (acts as a whitelist as well) if it does not exist, we return nil
    // NOTE: plugin names are matched as lowercase to avoid problems - however, a
    // possible issue is there can be duplicates possible if you had:
    // "org.apache.cordova.Foo" and "org.apache.cordova.foo" - only the lower-cased entry will match
    NSString* className = [self.pluginsMap objectForKey:[pluginName lowercaseString]];

    if (className == nil) {
        return nil;
    }

    id obj = [self.pluginObjects objectForKey:className];
    if (!obj) {
        obj = [[NSClassFromString(className)alloc] initWithWebViewEngine:_webViewEngine];

        if (obj != nil) {
            [self registerPlugin:obj withClassName:className];
        } else {
            NSLog(@"CDVPlugin class %@ (pluginName: %@) does not exist.", className, pluginName);
        }
    }
    return obj;
}

#pragma mark -

- (NSString*)appURLScheme
{
    NSString* URLScheme = nil;

    NSArray* URLTypes = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleURLTypes"];

    if (URLTypes != nil) {
        NSDictionary* dict = [URLTypes objectAtIndex:0];
        if (dict != nil) {
            NSArray* URLSchemes = [dict objectForKey:@"CFBundleURLSchemes"];
            if (URLSchemes != nil) {
                URLScheme = [URLSchemes objectAtIndex:0];
            }
        }
    }

    return URLScheme;
}

#pragma mark -
#pragma mark UIApplicationDelegate impl

/*
 This method lets your application know that it is about to be terminated and purged from memory entirely
 */
- (void)onAppWillTerminate:(NSNotification*)notification
{
    // empty the tmp directory
    NSFileManager* fileMgr = [[NSFileManager alloc] init];
    NSError* __autoreleasing err = nil;

    // clear contents of NSTemporaryDirectory
    NSString* tempDirectoryPath = NSTemporaryDirectory();
    NSDirectoryEnumerator* directoryEnumerator = [fileMgr enumeratorAtPath:tempDirectoryPath];
    NSString* fileName = nil;
    BOOL result;

    while ((fileName = [directoryEnumerator nextObject])) {
        NSString* filePath = [tempDirectoryPath stringByAppendingPathComponent:fileName];
        result = [fileMgr removeItemAtPath:filePath error:&err];
        if (!result && err) {
            NSLog(@"Failed to delete: %@ (error: %@)", filePath, err);
        }
    }
}

/*
 This method is called to let your application know that it is about to move from the active to inactive state.
 You should use this method to pause ongoing tasks, disable timer, ...
 */
- (void)onAppWillResignActive:(NSNotification*)notification
{
    // NSLog(@"%@",@"applicationWillResignActive");
    [self.commandDelegate evalJs:@"cordova.fireDocumentEvent('resign');" scheduledOnRunLoop:NO];
}

/*
 In iOS 4.0 and later, this method is called as part of the transition from the background to the inactive state.
 You can use this method to undo many of the changes you made to your application upon entering the background.
 invariably followed by applicationDidBecomeActive
 */
- (void)onAppWillEnterForeground:(NSNotification*)notification
{
    // NSLog(@"%@",@"applicationWillEnterForeground");
    [self.commandDelegate evalJs:@"cordova.fireDocumentEvent('resume');"];

    /** Clipboard fix **/
    UIPasteboard* pasteboard = [UIPasteboard generalPasteboard];
    NSString* string = pasteboard.string;
    if (string) {
        [pasteboard setValue:string forPasteboardType:@"public.text"];
    }
}

// This method is called to let your application know that it moved from the inactive to active state.
- (void)onAppDidBecomeActive:(NSNotification*)notification
{
    // NSLog(@"%@",@"applicationDidBecomeActive");
    [self.commandDelegate evalJs:@"cordova.fireDocumentEvent('active');"];
}

/*
 In iOS 4.0 and later, this method is called instead of the applicationWillTerminate: method
 when the user quits an application that supports background execution.
 */
- (void)onAppDidEnterBackground:(NSNotification*)notification
{
    // NSLog(@"%@",@"applicationDidEnterBackground");
    [self.commandDelegate evalJs:@"cordova.fireDocumentEvent('pause', null, true);" scheduledOnRunLoop:NO];
}

// ///////////////////////

- (void)dealloc
{
    [[NSNotificationCenter defaultCenter] removeObserver:self];

    [CDVUserAgentUtil releaseLock:&_userAgentLockToken];
    [_commandQueue dispose];
    [[self.pluginObjects allValues] makeObjectsPerformSelector:@selector(dispose)];
}

- (NSInteger*)userAgentLockToken
{
    return &_userAgentLockToken;
}

@end
