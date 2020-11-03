#ifndef CAPInstanceConfiguration_h
#define CAPInstanceConfiguration_h

@import UIKit;

@class CAPInstanceDescriptor;

NS_SWIFT_NAME(InstanceConfiguration)
@interface CAPInstanceConfiguration: NSObject
@property (nonatomic, readonly, nullable) NSString *appendedUserAgentString;
@property (nonatomic, readonly, nullable) NSString *overridenUserAgentString;
@property (nonatomic, readonly, nullable) UIColor *backgroundColor;
@property (nonatomic, readonly, nonnull) NSArray<NSString*> *allowedNavigationHostnames;
@property (nonatomic, readonly, nonnull) NSURL *localURL;
@property (nonatomic, readonly, nonnull) NSURL *serverURL;
@property (nonatomic, readonly, nonnull) NSDictionary *pluginConfigurations;
@property (nonatomic, readonly) BOOL enableLogging;
@property (nonatomic, readonly) BOOL enableScrolling;
@property (nonatomic, readonly) BOOL allowLinkPreviews;
@property (nonatomic, readonly) BOOL cordovaDeployDisabled;
@property (nonatomic, readonly) UIScrollViewContentInsetAdjustmentBehavior contentInsetAdjustmentBehavior;
@property (nonatomic, readonly, nonnull) NSURL *appLocation;

@property (nonatomic, readonly, nonnull) NSDictionary *legacyConfig DEPRECATED_MSG_ATTRIBUTE("Use direct properties instead");

- (instancetype _Nonnull)initWithDescriptor:(CAPInstanceDescriptor* _Nonnull)descriptor NS_SWIFT_NAME(init(with:));
@end

#endif /* CAPInstanceConfiguration_h */
