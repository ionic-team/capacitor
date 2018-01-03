package com.avocadojs;

import android.util.Log;

import java.lang.reflect.Method;
import java.lang.reflect.Type;

public class PluginMethodHandle {
  public static String RETURN_PROMISE = "promise";
  public static String RETURN_CALLBACK = "callback";
  private static String RETURN_NONE = "none";

  // Synchronous return not yet supported (if ever, tbqh)
  private static String RETURN_SYNC = "sync";


  public Method method;
  public String name;
  public String type;
  public String returnType;

  public PluginMethodHandle(Method method) {
    this.method = method;

    this.name = method.getName();

    /*

    String methodToString = method.toString();
    Log.d("METHOD", methodToString);

    Class<?>[] pType  = method.getParameterTypes();
    Type[] gpType = method.getGenericParameterTypes();
    for (int i = 0; i < pType.length; i++) {
      Log.d("ParameterType ", pType[i].toString());
      Log.d("GenericParameterType ", gpType[i].toString());
    }
    */
  }

  public String getReturnType() {
    return returnType;
  }

}
