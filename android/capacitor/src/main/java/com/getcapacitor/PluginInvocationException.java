package com.getcapacitor;

class PluginInvocationException extends Exception {

    public PluginInvocationException(String s) {
        super(s);
    }

    public PluginInvocationException(Throwable t) {
        super(t);
    }

    public PluginInvocationException(String s, Throwable t) {
        super(s, t);
    }
}
