package com.avocadojs.plugin;

import android.content.ClipData;
import android.content.ClipDescription;
import android.content.ClipboardManager;
import android.content.Context;
import android.util.Log;

import com.avocadojs.Bridge;
import com.avocadojs.Plugin;
import com.avocadojs.PluginBase;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;

import org.json.JSONException;
import org.json.JSONObject;

@Plugin(id="com.avocadojs.plugin.clipboard")
public class Clipboard extends PluginBase {

  @PluginMethod()
  public void set(PluginCall call) {
    String strVal = call.getString("string");
    String imageVal = call.getString("image");
    String urlVal = call.getString("url");
    String label = call.getString("label");

    Context c = getContext();
    ClipboardManager clipboard = (ClipboardManager)
        c.getSystemService(Context.CLIPBOARD_SERVICE);

    ClipData data = null;
    if(strVal != null) {
      data = ClipData.newPlainText(label, strVal);
    } else if(imageVal != null) {
      // Does nothing
    } else if(urlVal != null) {
      data = ClipData.newPlainText(label, urlVal);
    }

    if(data != null) {
      clipboard.setPrimaryClip(data);
    }

    call.success();
  }

  @PluginMethod()
  public void get(PluginCall call) {
    Context c = this.getContext();

    String type = call.getString("type");
    ClipboardManager clipboard = (ClipboardManager)
        c.getSystemService(Context.CLIPBOARD_SERVICE);

    if(clipboard.getPrimaryClipDescription().hasMimeType(ClipDescription.MIMETYPE_TEXT_PLAIN)) {
      Log.d(Bridge.TAG, "Got plaintxt");
      ClipData.Item item = clipboard.getPrimaryClip().getItemAt(0);
      try {
        JSONObject ret = new JSONObject();
        ret.put("value", item.getText());
        call.success(ret);
      } catch(JSONException ex) {
        call.error("Unable to get clipboard data", ex);
      }
    } else {
      Log.d(Bridge.TAG, "Not plaintext!");
      ClipData.Item item = clipboard.getPrimaryClip().getItemAt(0);
      String value = item.coerceToText(this.getContext()).toString();
      JSONObject ret = new JSONObject();
      try {
        ret.put("value", value);
        call.success(ret);
      } catch(JSONException ex) {
        call.error("Unable to get clipboard data", ex);
      }
    }
  }
}
