#import "CAPInstanceConfiguration.h"
#import <Capacitor/Capacitor-Swift.h>

@implementation CAPInstanceConfiguration

- (instancetype)initWithDescriptor:(CAPInstanceDescriptor *)descriptor {
    if (self = [super init]) {
        // first, give the descriptor a chance to make itself internally consistent
        [descriptor normalize];
        // now copy the simple properties
        _appendedUserAgentString = descriptor.appendedUserAgentString;
        _overridenUserAgentString = descriptor.overridenUserAgentString;
        _backgroundColor = descriptor.backgroundColor;
        _allowedNavigationHostnames = descriptor.allowedNavigationHostnames;
        _enableLogging = descriptor.enableLogging;
        _enableScrolling = descriptor.enableScrolling;
        _allowLinkPreviews = descriptor.allowLinkPreviews;
        _handleApplicationNotifications = descriptor.handleApplicationNotifications;
        _contentInsetAdjustmentBehavior = descriptor.contentInsetAdjustmentBehavior;
        _appLocation = descriptor.appLocation;
        _pluginConfigurations = descriptor.pluginConfigurations;
        _legacyConfig = descriptor.legacyConfig;
        // construct the necessary URLs
        _localURL = [[NSURL alloc] initWithString:[NSString stringWithFormat:@"%@://%@", descriptor.urlScheme, descriptor.urlHostname]];
        if (descriptor.serverURL != nil) {
            _serverURL = [[NSURL alloc] initWithString:(descriptor.serverURL)];
        }
        else {
            _serverURL = _localURL;
        }
        // extract the one value we care about from the cordova configuration
        id value = [descriptor.cordovaConfiguration.settings objectForKey:[@"DisableDeploy" lowercaseString]];
        if (value != nil && [value isKindOfClass:[NSString class]]) {
            _cordovaDeployDisabled = [(NSString*)value boolValue];
        }
        else {
            _cordovaDeployDisabled = false;
        }
    }
    return self;
}

@end
