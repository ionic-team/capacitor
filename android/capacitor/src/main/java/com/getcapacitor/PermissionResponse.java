package com.getcapacitor;

import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;

/**
 * Flags a method as the permission callback to a specified plugin method.
 */
@Target(METHOD)
@Retention(RUNTIME)
public @interface PermissionResponse {
    /**
     * The name of a PluginMethod that requests permissions.
     */
    String value() default "";
}
