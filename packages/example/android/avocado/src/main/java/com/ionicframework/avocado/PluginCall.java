package com.ionicframework.avocado;

import android.util.Log;
import org.json.JSONObject;


public class PluginCall {
    private MessageHandler msgHandler;
    private int callbackId;
    JSONObject data;


    public PluginCall(MessageHandler msgHandler, int callbackId, JSONObject data) {
        this.msgHandler = msgHandler;
        this.callbackId = callbackId;
        this.data = data;
    }

    public void successCallback(PluginResult successResult) {
        this.msgHandler.responseMessage(this.callbackId, successResult, null);
    }

    public void errorCallback(String msg) {
        PluginResult errorResult = new PluginResult();
        try {
            errorResult.put("message", msg);

        } catch (Exception jsonEx) {
            Log.e("errorCallback", jsonEx.toString());
        }

        this.msgHandler.responseMessage(this.callbackId, null, errorResult);
    }
}

