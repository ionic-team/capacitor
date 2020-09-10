package com.getcapacitor.util;

public interface GeolocationPromptListener {
    boolean hasRequiredPermissions();
    void requestPermissions();
}
