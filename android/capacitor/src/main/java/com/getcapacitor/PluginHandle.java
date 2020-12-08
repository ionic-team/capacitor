package com.getcapacitor;

import androidx.appcompat.app.AppCompatActivity;
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
class PluginHandle {

    private final Class<? extends Plugin> pluginClass;

    private Map<String, PluginMethodHandle> pluginMethods = new HashMap<>();
    private Method initMethod = null;

    private final String pluginId;

    private NativePlugin legacyPluginAnnotation;
    private CapacitorPlugin pluginAnnotation;

    private Plugin instance;

    public PluginHandle(Class<? extends Plugin> pluginClass) throws InvalidPluginException, PluginLoadException {
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

        try {
            this.instance = this.pluginClass.newInstance();
            this.instance.setPluginHandle(this);
        } catch (InstantiationException | IllegalAccessException ex) {
            throw new PluginLoadException("Unable to load plugin instance. Ensure plugin is publicly accessible");
        }
    }

    public Class<? extends Plugin> getPluginClass() {
        return pluginClass;
    }

    public String getId() {
        return this.pluginId;
    }

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

    public void init(Bridge bridge) {
        if (initMethod != null) {
            try {
                initMethod.invoke(null, bridge);
            } catch (IllegalAccessException | InvocationTargetException e) {
                // ignore
            }
        }
    }

    public void load(Bridge bridge) {
        this.instance.setBridge(bridge);
        this.instance.load();
    }

    /**
     * Call a method on a plugin.
     * @param methodName the name of the method to call
     * @param call the constructed PluginCall with parameters from the caller
     * @throws InvalidPluginMethodException if no method was found on that plugin
     */
    public void invoke(String methodName, PluginCall call)
        throws InvalidPluginMethodException, InvocationTargetException, IllegalAccessException {
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
            if (methodReflect.getName().equals("init")) {
                initMethod = methodReflect;
            }

            PluginMethod method = methodReflect.getAnnotation(PluginMethod.class);

            if (method == null) {
                continue;
            }

            PluginMethodHandle methodMeta = new PluginMethodHandle(methodReflect, method);
            pluginMethods.put(methodReflect.getName(), methodMeta);
        }
    }
}
