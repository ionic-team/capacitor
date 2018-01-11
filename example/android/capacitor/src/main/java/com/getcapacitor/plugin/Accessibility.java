package com.getcapacitor.plugin;

import android.speech.tts.TextToSpeech;
import android.util.Log;
import android.view.accessibility.AccessibilityManager;

import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import java.util.Date;
import java.util.Locale;

import static android.content.Context.ACCESSIBILITY_SERVICE;

@NativePlugin()
public class Accessibility extends Plugin {
  TextToSpeech tts;

  @PluginMethod()
  public void isScreenReaderEnabled(PluginCall call) {
    Log.d(Bridge.TAG, "Checking for screen reader");
    AccessibilityManager am = (AccessibilityManager) getContext().getSystemService(ACCESSIBILITY_SERVICE);
    Log.d(Bridge.TAG, "Is it enabled? " + am.isTouchExplorationEnabled());
    JSObject ret = new JSObject();
    ret.put("value", am.isTouchExplorationEnabled());
    call.success(ret);
  }

  @PluginMethod()
  public void speak(PluginCall call) {
    final String value = call.getString("value");
    final String language = call.getString("language", "en");
    final Locale locale = Locale.forLanguageTag(language);

    if (locale == null) {
      call.error("Language was not a valid language tag.");
      return;
    }

    tts = new TextToSpeech(getContext(), new TextToSpeech.OnInitListener() {
      @Override
      public void onInit(int i) {
        tts.setLanguage(locale);
        tts.speak(value, TextToSpeech.QUEUE_FLUSH, null, "capacitoraccessibility" + System.currentTimeMillis());
      }
    });

    // Not yet implemented
    throw new UnsupportedOperationException();
  }

}
