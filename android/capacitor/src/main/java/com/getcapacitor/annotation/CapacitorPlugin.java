package com.getcapacitor.annotation;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * Base annotation for all Plugins
 */
@Retention(RetentionPolicy.RUNTIME)
public @interface CapacitorPlugin {
    /**
     * Request codes this plugin uses and responds to, in order to tie
     * Android events back the plugin to handle
     */
    int[] requestCodes() default {};

    /**
     * Permissions this plugin needs, in order to make permission requests
     * easy if the plugin only needs basic permission prompting
     */
    Permission[] permissions() default {};

    /**
     * The request code to use when automatically requesting permissions
     */
    int permissionRequestCode() default 9000;

    /**
     * A custom name for the plugin, otherwise uses the
     * simple class name.
     */
    String name() default "";
}
