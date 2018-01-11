package com.getcapacitor;

import java.lang.reflect.Method;

public class PluginMethodHandle {
  // The reflect method reference
  private final Method method;
  // The name of the method
  private final String name;
  // The return type of the method (see PluginMethod for constants)
  private final String returnType;

  public PluginMethodHandle(Method method, PluginMethod methodDecorator) {
    this.method = method;

    this.name = method.getName();

    this.returnType = methodDecorator.returnType();
  }

  public String getReturnType() {
    return returnType;
  }

  public String getName() {
    return name;
  }

  public Method getMethod() {
    return method;
  }
}
