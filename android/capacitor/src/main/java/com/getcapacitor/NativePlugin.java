package com.getcapacitor;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * Base annotation for all Plugins
 */
@Retention(RetentionPolicy.RUNTIME)
public @interface NativePlugin {
  /**
   * Request codes this plugin uses and responds to, in order to tie
   * Android events back the plugin to handle
   */
  int[] requestCodes() default {};

  /**
   * Permissions this plugin needs, in order to make permission requests
   * easy if the plugin only needs basic permission prompting
   */
  String[] permissions() default {};

  /**
   * The request code to use when automatically requesting permissions
   */
  int permissionRequestCode() default PluginRequestCodes.DEFAULT_CAPACITOR_REQUEST_PERMISSIONS;

  /**
   * A custom name for the plugin, otherwise uses the
   * simple class name.
   */
  String name() default "";
}
