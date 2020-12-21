#ifndef CAPInstanceDescriptor_h
#define CAPInstanceDescriptor_h

@import UIKit;
@import Cordova;

typedef NS_ENUM(NSInteger, CAPInstanceType) {
    CAPInstanceTypeFixed NS_SWIFT_NAME(fixed),
    CAPInstanceTypeVariable NS_SWIFT_NAME(variable)
} NS_SWIFT_NAME(InstanceType);

typedef NS_OPTIONS(NSUInteger, CAPInstanceWarning) {
    CAPInstanceWarningMissingAppDir       NS_SWIFT_NAME(missingAppDir)      = 1 << 0,
    CAPInstanceWarningMissingFile         NS_SWIFT_NAME(missingFile)        = 1 << 1,
    CAPInstanceWarningInvalidFile         NS_SWIFT_NAME(invalidFile)        = 1 << 2,
    CAPInstanceWarningMissingCordovaFile  NS_SWIFT_NAME(missingCordovaFile) = 1 << 3,
    CAPInstanceWarningInvalidCordovaFile  NS_SWIFT_NAME(invalidCordovaFile) = 1 << 4
} NS_SWIFT_NAME(InstanceWarning);

extern NSString * _Nonnull const CAPInstanceDescriptorDefaultScheme NS_SWIFT_UNAVAILABLE("Use InstanceDescriptorDefaults");
extern NSString * _Nonnull const CAPInstanceDescriptorDefaultHostname NS_SWIFT_UNAVAILABLE("Use InstanceDescriptorDefaults");

NS_SWIFT_NAME(InstanceDescriptor)
@interface CAPInstanceDescriptor : NSObject

@property (nonatomic, copy, nullable) NSString *appendedUserAgentString;
@property (nonatomic, copy, nullable) NSString *overridenUserAgentString;
@property (nonatomic, retain, nullable) UIColor *backgroundColor;
@property (nonatomic, copy, nonnull) NSArray<NSString*> *allowedNavigationHostnames;
@property (nonatomic, copy, nullable) NSString *urlScheme;
@property (nonatomic, copy, nullable) NSString *urlHostname;
@property (nonatomic, copy, nullable) NSString *serverURL;
@property (nonatomic, retain, nonnull) NSDictionary *pluginConfigurations;
@property (nonatomic, assign) BOOL enableLogging;
@property (nonatomic, assign) BOOL enableScrolling;
@property (nonatomic, assign) BOOL allowLinkPreviews;
@property (nonatomic, assign) BOOL handleApplicationNotifications;
@property (nonatomic, assign) UIScrollViewContentInsetAdjustmentBehavior contentInsetAdjustmentBehavior;
@property (nonatomic, copy, nonnull) NSURL *appLocation;
@property (nonatomic, copy, nullable) NSString *appStartPath;
@property (nonatomic, copy, nonnull) CDVConfigParser *cordovaConfiguration;
@property (nonatomic, assign) CAPInstanceWarning warnings;
@property (nonatomic, readonly) CAPInstanceType instanceType;
@property (nonatomic, retain, nonnull) NSDictionary *legacyConfig;

/**
 Initialize the descriptor with the default environment. This assumes that the application was built with the help of the Capacitor CLI
 and that that the web app is located inside the application bundle at `public/`.
 */
- (instancetype _Nonnull)initAsDefault NS_SWIFT_NAME(init());

/**
 Initialize the descriptor for use in other contexts. The app location is the one required parameter.
 
 @param appURL The location of the folder containing the web app.
 @param configURL The location of the Capacitor configuration file.
 @param cordovaURL The location of the Cordova configuration file.
 */
- (instancetype _Nonnull)initAtLocation:(NSURL* _Nonnull)appURL configuration:(NSURL* _Nullable)configURL cordovaConfiguration:(NSURL* _Nullable)cordovaURL NS_SWIFT_NAME(init(at:configuration:cordovaConfiguration:));
@end

#endif /* CAPInstanceDescriptor_h */
