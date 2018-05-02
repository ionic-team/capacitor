//
//  CDVPluginManager.h
//  CapacitorCordova
//
//  Created by Julio Cesar Sanchez Hernandez on 26/2/18.
//

#import <Foundation/Foundation.h>
#import "CDVPlugin.h"

@interface CDVPluginManager : NSObject

@property (nonatomic, strong) NSMutableDictionary * pluginsMap;
@property (nonatomic, strong) NSMutableDictionary * pluginObjects;
@property (nonatomic, strong) UIViewController * viewController;
@property (nonatomic, strong) WKWebView * webView;

- (id)initWithMapping:(NSMutableDictionary*)mapping viewController:(UIViewController*)viewController webView:(WKWebView *)webview;
- (CDVPlugin *)getCommandInstance:(NSString*)pluginName;

@end
