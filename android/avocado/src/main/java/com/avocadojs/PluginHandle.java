package com.avocadojs;

import android.os.Handler;
import android.os.Message;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

/**
 * PluginHandle is an instance of a plugin that has been registered
 * and indexed.
 */
public class PluginHandle {
  private final Bridge bridge;
  private final Class<? extends Plugin> pluginClass;

  private Map<String, PluginMethodHandle> pluginMethods = new HashMap<>();

  private final String pluginId;

  private Plugin instance;

  public PluginHandle(Bridge bridge, Class<? extends Plugin> pluginClass) throws InvalidPluginException {
    this.bridge = bridge;
    this.pluginClass = pluginClass;

    NativePlugin pluginAnnotation = pluginClass.getAnnotation(NativePlugin.class);
    if(pluginAnnotation == null) {
      throw new InvalidPluginException("No @NativePlugin annotation found for plugin " + pluginClass.getName());
    }

    if(!pluginAnnotation.name().equals("")) {
      this.pluginId = pluginAnnotation.name();
    } else {
      this.pluginId = pluginClass.getSimpleName();
    }

    this.indexMethods(pluginClass);
  }

  public Class<? extends Plugin> getPluginClass() {
    return pluginClass;
  }

  public String getId() {
    return this.pluginId;
  }

  public Plugin getInstance() {
    return this.instance;
  }

  public Collection<PluginMethodHandle> getMethods() {
    return this.pluginMethods.values();
  }

  public Plugin load() throws PluginLoadException {
    if(this.instance != null) {
      return this.instance;
    }

    try {
      this.instance = this.pluginClass.newInstance();
      this.instance.setBridge(this.bridge);
      return this.instance;
    } catch(InstantiationException | IllegalAccessException ex) {
      throw new PluginLoadException("Unable to load plugin instance. Ensure plugin is publicly accessible");
    }
  }

  /**
   * Call a method on a plugin.
   * @param methodName the name of the method to call
   * @param call the constructed PluginCall with parameters from the caller
   * @throws InvalidPluginMethodException if no method was found on that plugin
   */
  public void invoke(String methodName, PluginCall call) throws PluginLoadException,
                                                                InvalidPluginMethodException,
                                                                PluginInvocationException {
    if(this.instance == null) {
      // Can throw PluginLoadException
      this.load();
    }

    PluginMethodHandle methodMeta = pluginMethods.get(methodName);
    if(methodMeta == null) {
      throw new InvalidPluginMethodException("No method " + methodName + " found for plugin " + pluginClass.getName());
    }


    try {
      methodMeta.getMethod().invoke(this.instance, call);
    } catch(InvocationTargetException | IllegalAccessException ex) {
      throw new PluginInvocationException("Unable to invoke method " + methodName + " on plugin " + pluginClass.getName(), ex);
    }
  }

  /**
   * Index all the known callable methods for a plugin for faster
   * invocation later
   */
  private void indexMethods(Class<? extends Plugin> plugin) {
    //Method[] methods = pluginClass.getDeclaredMethods();
    Method[] methods = pluginClass.getMethods();

    for(Method methodReflect: methods) {
      PluginMethod method = methodReflect.getAnnotation(PluginMethod.class);

      if(method == null) {
        continue;
      }

      PluginMethodHandle methodMeta = new PluginMethodHandle(methodReflect, method);
      pluginMethods.put(methodReflect.getName(), methodMeta);
    }
  }

  private class PluginMethodInvocationHandler extends Handler {

    @Override
    public void dispatchMessage(Message msg) {

    }
  }
}
