# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Rules for Capacitor v3 plugins and annotations
 -keep @com.getcapacitor.annotation.CapacitorPlugin public class * {
     @com.getcapacitor.annotation.PermissionCallback <methods>;
     @com.getcapacitor.annotation.ActivityCallback <methods>;
     @com.getcapacitor.annotation.Permission <methods>;
     @com.getcapacitor.PluginMethod public <methods>;
 }

 -keep public class * extends com.getcapacitor.Plugin { *; }

# Rules for Capacitor v2 plugins and annotations
# These are deprecated but can still be used with Capacitor for now
-keep @com.getcapacitor.NativePlugin public class * {
  @com.getcapacitor.PluginMethod public <methods>;
}

# Rules for Cordova plugins
-keep public class * extends org.apache.cordova.* {
  public <methods>;
  public <fields>;
}