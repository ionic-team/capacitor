package com.getcapacitor.annotation;

import android.content.Intent;
import com.getcapacitor.PluginCall;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * Base annotation for all Plugins
 */
@Retention(RetentionPolicy.RUNTIME)
public @interface CapacitorPlugin {
    /**
     * A custom name for the plugin, otherwise uses the
     * simple class name.
     */
    String name() default "";

    /**
     * Request codes this plugin uses and responds to, in order to tie
     * Android events back the plugin to handle.
     *
     * NOTE: This is a legacy option provided to support third party libraries
     * not currently implementing the new AndroidX Activity Results API. Plugins
     * without this limitation should use a registered callback with
     * {@link com.getcapacitor.Plugin#startActivityForResult(PluginCall, Intent, String)}
     */
    int[] requestCodes() default {};

    /**
     * Permissions this plugin needs, in order to make permission requests
     * easy if the plugin only needs basic permission prompting
     */
    Permission[] permissions() default {};
}
