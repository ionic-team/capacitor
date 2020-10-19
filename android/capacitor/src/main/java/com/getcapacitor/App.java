package com.getcapacitor;

import androidx.annotation.Nullable;

public class App {

    /**
     * Interface for callbacks when app status changes.
     */
    public interface AppStatusChangeListener {
        void onAppStatusChanged(Boolean isActive);
    }

    /**
     * Interface for callbacks when back button is pressed.
     */
    public interface BackButtonListener {
        void onBackButton();
    }

    /**
     * Interface for callbacks when app is restored with pending plugin call.
     */
    public interface AppRestoredListener {
        void onAppRestored(PluginResult result);
    }

    @Nullable
    private AppStatusChangeListener statusChangeListener;

    @Nullable
    private BackButtonListener backButtonListener;

    @Nullable
    private AppRestoredListener appRestoredListener;

    private boolean isActive = false;

    public boolean isActive() {
        return isActive;
    }

    /**
     * Set the object to receive callbacks.
     * @param listener
     */
    public void setStatusChangeListener(@Nullable AppStatusChangeListener listener) {
        this.statusChangeListener = listener;
    }

    /**
     * Set the object to receive callbacks.
     * @param listener
     */
    public void setBackButtonListener(@Nullable BackButtonListener listener) {
        this.backButtonListener = listener;
    }

    /**
     * Set the object to receive callbacks.
     * @param listener
     */
    public void setAppRestoredListener(@Nullable AppRestoredListener listener) {
        this.appRestoredListener = listener;
    }

    protected void fireRestoredResult(PluginResult result) {
        if (appRestoredListener != null) {
            appRestoredListener.onAppRestored(result);
        }
    }

    public void fireStatusChange(boolean isActive) {
        this.isActive = isActive;
        if (statusChangeListener != null) {
            statusChangeListener.onAppStatusChanged(isActive);
        }
    }

    public void fireBackButton() {
        if (backButtonListener != null) {
            backButtonListener.onBackButton();
        }
    }

    public boolean hasBackButtonListeners() {
        return backButtonListener != null;
    }
}
