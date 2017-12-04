package com.avocadojs;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * Base annotation for all Plugins
 */
@Retention(RetentionPolicy.RUNTIME)
public @interface NativePlugin {
  String id();
}
