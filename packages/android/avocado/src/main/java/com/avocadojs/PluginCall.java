package com.avocadojs;

import android.util.Log;

import org.json.JSONObject;


public class PluginCall {
  private MessageHandler msgHandler;
  private String callbackId;
  public JSONObject data;


  public PluginCall(MessageHandler msgHandler, String callbackId, JSONObject data) {
    this.msgHandler = msgHandler;
    this.callbackId = callbackId;
    this.data = data;
  }

  public void successCallback(PluginResult successResult) {
    if (this.callbackId != "-1") {
      // don't bother sending back response if the callbackId was "-1"
      this.msgHandler.responseMessage(this.callbackId, successResult, null);
    }
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

