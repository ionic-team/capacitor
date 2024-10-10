package com.getcapacitor;

public interface IMessageHandler {
    /**
     * Posts a message to a JavaScript context. It is expected to be a stringified JSON representation
     *
     * @param message The stringified json to be posted.
     */
    void postMessage(String message);

    /**
     * Sends a response message.
     *
     * @param call the plugin call, which is attached to the communication
     * @param successResult the result of the native execution
     * @param errorResult the error, that might have occured
     *
     */
    void sendResponseMessage(PluginCall call, PluginResult successResult, PluginResult errorResult);
}