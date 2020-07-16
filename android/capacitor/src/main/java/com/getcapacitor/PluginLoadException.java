package com.getcapacitor;

/**
 * Thrown when a plugin fails to instantiate
 */
public class PluginLoadException extends Exception {

    public PluginLoadException(String s) {
        super(s);
    }

    public PluginLoadException(Throwable t) {
        super(t);
    }

    public PluginLoadException(String s, Throwable t) {
        super(s, t);
    }
}
