package com.getcapacitor;

class InvalidPluginMethodException extends Exception {

    public InvalidPluginMethodException(String s) {
        super(s);
    }

    public InvalidPluginMethodException(Throwable t) {
        super(t);
    }

    public InvalidPluginMethodException(String s, Throwable t) {
        super(s, t);
    }
}
