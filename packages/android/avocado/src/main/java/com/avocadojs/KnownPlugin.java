package com.avocadojs;

import android.os.Handler;
import android.os.Message;
import android.util.Log;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

/**
 * KnownPlugin is an instance of a plugin that has been registered
 * and indexed.
 */
public class KnownPlugin {
  private final Bridge bridge;
  private final Class<? extends PluginBase> pluginClass;

  private Map<String, PluginMethodMetadata> pluginMethods = new HashMap<>();

  private final String pluginId;

  private PluginBase instance;

  public KnownPlugin(Bridge bridge, Class<? extends PluginBase> pluginClass) throws InvalidPluginException {
    this.bridge = bridge;
    this.pluginClass = pluginClass;

    Plugin pluginAnnotation = pluginClass.getAnnotation(Plugin.class);
    if(pluginAnnotation == null) {
      throw new InvalidPluginException("No @Plugin annotation found for plugin " + pluginClass.getName());
    }

    this.pluginId = pluginAnnotation.id();

    this.indexMethods(pluginClass);
  }

  public String getId() {
    return this.pluginId;
  }

  public PluginBase load() throws PluginLoadException {
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

    PluginMethodMetadata methodMeta = pluginMethods.get(methodName);
    if(methodMeta == null) {
      throw new InvalidPluginMethodException("No method " + methodName + " found for plugin " + pluginClass.getName());
    }


    try {
      methodMeta.method.invoke(this.instance, call);
    } catch(InvocationTargetException | IllegalAccessException ex) {
      throw new PluginInvocationException("Unable to invoke method " + methodName + " on plugin " + pluginClass.getName(), ex);
    }
  }

  /**
   * Index all the known callable methods for a plugin for faster
   * invocation later
   */
  private void indexMethods(Class<? extends PluginBase> plugin) {
    Method[] methods = pluginClass.getDeclaredMethods();

    for(Method methodReflect: methods) {
      PluginMethod method = methodReflect.getAnnotation(PluginMethod.class);

      if(method == null) {
        continue;
      }

      PluginMethodMetadata methodMeta = new PluginMethodMetadata(methodReflect);
      pluginMethods.put(methodReflect.getName(), methodMeta);
    }
  }

  private class PluginMethodInvocationHandler extends Handler {

    @Override
    public void dispatchMessage(Message msg) {

    }
  }
}
