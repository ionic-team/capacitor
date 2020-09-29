package com.getcapacitor;

import com.getcapacitor.annotation.CapacitorPlugin;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * Base annotation for all Plugins
 * @deprecated
 * <p> Use {@link CapacitorPlugin} instead
 */
@Retention(RetentionPolicy.RUNTIME)
@Deprecated
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
    int permissionRequestCode() default 9000;

    /**
     * A custom name for the plugin, otherwise uses the
     * simple class name.
     */
    String name() default "";
}
