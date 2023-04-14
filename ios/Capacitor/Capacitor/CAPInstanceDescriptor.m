#import "CAPInstanceDescriptor.h"
#import <Capacitor/Capacitor-Swift.h>

// Swift extensions marked as @objc and internal are available to the Obj-C runtime but are not available at compile time.
// so we need this declaration to avoid compiler complaints
@interface CAPInstanceDescriptor (InternalSwiftExtension)
- (void)_parseConfigurationAt:(NSURL *)configURL cordovaConfiguration:(NSURL *)cordovaURL;
@end

NSString* const CAPInstanceDescriptorDefaultScheme = @"capacitor";
NSString* const CAPInstanceDescriptorDefaultHostname = @"localhost";

@implementation CAPInstanceDescriptor
- (instancetype)initAsDefault {
    if (self = [super init]) {
        _instanceType = CAPInstanceTypeFixed;
        [self _setDefaultsWithAppLocation:[[NSBundle mainBundle] URLForResource:@"public" withExtension:nil]];
        [self _parseConfigurationAt:[[NSBundle mainBundle] URLForResource:@"capacitor.config" withExtension:@"json"] cordovaConfiguration:[[NSBundle mainBundle] URLForResource:@"config" withExtension:@"xml"]];
    }
    return self;
}

- (instancetype)initAtLocation:(NSURL*)appURL configuration:(NSURL*)configURL cordovaConfiguration:(NSURL*)cordovaURL {
    if (self = [super init]) {
        _instanceType = CAPInstanceTypeVariable;
        [self _setDefaultsWithAppLocation:appURL];
        [self _parseConfigurationAt:configURL cordovaConfiguration:cordovaURL];
    }
    return self;
}

- (void)_setDefaultsWithAppLocation:(NSURL*)location {
    _allowedNavigationHostnames = @[];
    _urlScheme = CAPInstanceDescriptorDefaultScheme;
    _urlHostname = CAPInstanceDescriptorDefaultHostname;
    _pluginConfigurations = @{};
    _legacyConfig = @{};
    _loggingBehavior = CAPInstanceLoggingBehaviorDebug;
    _scrollingEnabled = YES;
    _allowLinkPreviews = YES;
    _handleApplicationNotifications = YES;
    _isWebDebuggable = NO;
    _contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever;
    _appLocation = location;
    _limitsNavigationsToAppBoundDomains = FALSE;
    _cordovaConfiguration = [[CDVConfigParser alloc] init];
    _warnings = 0;
    if (location == nil) {
        _warnings |= CAPInstanceWarningMissingAppDir;
        // location is nil so assume it was supposed to be the default
        _appLocation = [[[NSBundle mainBundle] resourceURL] URLByAppendingPathComponent:@"public"];
    }
}
@end
