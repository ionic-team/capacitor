package com.avocadojs;

import java.lang.reflect.Method;

public class PluginMethodMetadata {
  public Method method;
  public String name;
  public String type;

  public PluginMethodMetadata(Method method) {
    this.method = method;

    this.name = method.getName();
  }

}
