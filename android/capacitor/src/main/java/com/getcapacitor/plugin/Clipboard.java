package com.getcapacitor.plugin;

import android.content.ClipData;
import android.content.ClipDescription;
import android.content.ClipboardManager;
import android.content.Context;
import com.getcapacitor.JSObject;
import com.getcapacitor.Logger;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

@NativePlugin()
public class Clipboard extends Plugin {

  @PluginMethod()
  public void write(PluginCall call) {
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
      data = ClipData.newPlainText(label, imageVal);
    } else if(urlVal != null) {
      data = ClipData.newPlainText(label, urlVal);
    }

    if(data != null) {
      clipboard.setPrimaryClip(data);
    }

    call.success();
  }

  @PluginMethod()
  public void read(PluginCall call) {
    Context c = this.getContext();

    ClipboardManager clipboard = (ClipboardManager)
        c.getSystemService(Context.CLIPBOARD_SERVICE);

    CharSequence value = null;

    if (clipboard.hasPrimaryClip()) {
      if(clipboard.getPrimaryClipDescription().hasMimeType(ClipDescription.MIMETYPE_TEXT_PLAIN)) {
        Logger.debug(getLogTag(), "Got plaintxt");
        ClipData.Item item = clipboard.getPrimaryClip().getItemAt(0);
        value = item.getText();
      } else {
        Logger.debug(getLogTag(), "Not plaintext!");
        ClipData.Item item = clipboard.getPrimaryClip().getItemAt(0);
        value = item.coerceToText(this.getContext()).toString();
      }
    }

    JSObject ret = new JSObject();
    String type = "text/plain";
    ret.put("value", value != null ? value : "");
    if (value != null && value.toString().startsWith("data:")) {
      type = value.toString().split(";")[0].split(":")[1];
    }
    ret.put("type", type);

    call.success(ret);
  }
}
