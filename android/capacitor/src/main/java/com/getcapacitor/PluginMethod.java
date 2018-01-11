package com.getcapacitor;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
public @interface PluginMethod {
  public static String RETURN_PROMISE = "promise";
  public static String RETURN_CALLBACK = "callback";
  public static String RETURN_NONE = "none";

  String returnType() default RETURN_PROMISE;
}

