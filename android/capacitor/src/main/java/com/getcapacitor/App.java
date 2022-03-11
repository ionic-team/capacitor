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
     * Interface for callbacks when app is restored with pending plugin call.
     */
    public interface AppRestoredListener {
        void onAppRestored(PluginResult result);
    }

    public enum DownloadStatus { STARTED, COMPLETED, FAILED }

    /**
     * Interface for callbacks when app is receives download request from webview.
     */
    public interface AppDownloadListener {
        void onAppDownloadUpdate(String operationID, DownloadStatus operationStatus, @Nullable String error);
    }

    @Nullable
    private AppStatusChangeListener statusChangeListener;

    @Nullable
    private AppRestoredListener appRestoredListener;

    @Nullable
    private AppDownloadListener appDownloadListener;

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
    public void setAppRestoredListener(@Nullable AppRestoredListener listener) {
        this.appRestoredListener = listener;
    }

    /**
     * Set the object to receive callbacks.
     * @param listener
     */
    public void setAppDownloadListener(@Nullable AppDownloadListener listener) {
        this.appDownloadListener = listener;
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

    public void fireDownloadUpdate(String operationID, DownloadStatus operationStatus, @Nullable String error) {
        if (appDownloadListener != null) {
            appDownloadListener.onAppDownloadUpdate(operationID, operationStatus, error);
        }
    }
}
