package com.getcapacitor;

public class JSExportException extends Exception {

    public JSExportException(String s) {
        super(s);
    }

    public JSExportException(Throwable t) {
        super(t);
    }

    public JSExportException(String s, Throwable t) {
        super(s, t);
    }
}
