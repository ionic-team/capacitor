package com.getcapacitor;

import com.getcapacitor.annotation.CapacitorPlugin;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

/**
 * PluginHandle is an instance of a plugin that has been registered
 * and indexed. Think of it as a Plugin instance with extra metadata goodies
 */
public class PluginHandle {

    private final Bridge bridge;
    private final Class<? extends Plugin> pluginClass;

    private Map<String, PluginMethodHandle> pluginMethods = new HashMap<>();

    private final String pluginId;

    @SuppressWarnings("deprecation")
    private NativePlugin legacyPluginAnnotation;

    private CapacitorPlugin pluginAnnotation;

    private Plugin instance;

    @SuppressWarnings("deprecation")
    public PluginHandle(Bridge bridge, Class<? extends Plugin> pluginClass) throws InvalidPluginException, PluginLoadException {
        this.bridge = bridge;
        this.pluginClass = pluginClass;

        CapacitorPlugin pluginAnnotation = pluginClass.getAnnotation(CapacitorPlugin.class);
        if (pluginAnnotation == null) {
            // Check for legacy plugin annotation, @NativePlugin
            NativePlugin legacyPluginAnnotation = pluginClass.getAnnotation(NativePlugin.class);
            if (legacyPluginAnnotation == null) {
                throw new InvalidPluginException("No @CapacitorPlugin annotation found for plugin " + pluginClass.getName());
            }

            if (!legacyPluginAnnotation.name().equals("")) {
                this.pluginId = legacyPluginAnnotation.name();
            } else {
                this.pluginId = pluginClass.getSimpleName();
            }

            this.legacyPluginAnnotation = legacyPluginAnnotation;
        } else {
            if (!pluginAnnotation.name().equals("")) {
                this.pluginId = pluginAnnotation.name();
            } else {
                this.pluginId = pluginClass.getSimpleName();
            }

            this.pluginAnnotation = pluginAnnotation;
        }

        this.indexMethods(pluginClass);

        this.load();
    }

    public Class<? extends Plugin> getPluginClass() {
        return pluginClass;
    }

    public String getId() {
        return this.pluginId;
    }

    @SuppressWarnings("deprecation")
    public NativePlugin getLegacyPluginAnnotation() {
        return this.legacyPluginAnnotation;
    }

    public CapacitorPlugin getPluginAnnotation() {
        return this.pluginAnnotation;
    }

    public Plugin getInstance() {
        return this.instance;
    }

    public Collection<PluginMethodHandle> getMethods() {
        return this.pluginMethods.values();
    }

    public Plugin load() throws PluginLoadException {
        if (this.instance != null) {
            return this.instance;
        }

        try {
            this.instance = this.pluginClass.newInstance();
            this.instance.setPluginHandle(this);
            this.instance.setBridge(this.bridge);
            this.instance.load();
            this.instance.initializeActivityLaunchers();
            return this.instance;
        } catch (InstantiationException | IllegalAccessException ex) {
            throw new PluginLoadException("Unable to load plugin instance. Ensure plugin is publicly accessible");
        }
    }

    /**
     * Call a method on a plugin.
     * @param methodName the name of the method to call
     * @param call the constructed PluginCall with parameters from the caller
     * @throws InvalidPluginMethodException if no method was found on that plugin
     */
    public void invoke(String methodName, PluginCall call)
        throws PluginLoadException, InvalidPluginMethodException, InvocationTargetException, IllegalAccessException {
        if (this.instance == null) {
            // Can throw PluginLoadException
            this.load();
        }

        PluginMethodHandle methodMeta = pluginMethods.get(methodName);
        if (methodMeta == null) {
            throw new InvalidPluginMethodException("No method " + methodName + " found for plugin " + pluginClass.getName());
        }

        methodMeta.getMethod().invoke(this.instance, call);
    }

    /**
     * Index all the known callable methods for a plugin for faster
     * invocation later
     */
    private void indexMethods(Class<? extends Plugin> plugin) {
        //Method[] methods = pluginClass.getDeclaredMethods();
        Method[] methods = pluginClass.getMethods();

        for (Method methodReflect : methods) {
            PluginMethod method = methodReflect.getAnnotation(PluginMethod.class);

            if (method == null) {
                continue;
            }

            PluginMethodHandle methodMeta = new PluginMethodHandle(methodReflect, method);
            pluginMethods.put(methodReflect.getName(), methodMeta);
        }
    }
}
