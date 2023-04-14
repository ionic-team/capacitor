@import UIKit;
@import WebKit;

#ifndef WKWebView_Capacitor_h
#define WKWebView_Capacitor_h

@interface WKWebView (CapacitorInspectablity)
- (void)setInspectableIfRequired: (BOOL)shouldInspect;
@end

#endif /* WKWebView_Capacitor_h */
