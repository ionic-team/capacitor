package com.getcapacitor;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
public @interface PluginMethod {
    String RETURN_PROMISE = "promise";

    String RETURN_CALLBACK = "callback";

    String RETURN_NONE = "none";

    String returnType() default RETURN_PROMISE;

    /**
     * The name of a method that should be called on the result of a permission request. This method
     * should be defined in the class with the parameters (PluginCall, Map<String, PermissionState>).
     */
    String permissionCallback() default "";
}
