package com.getcapacitor.plugin;

import android.speech.tts.TextToSpeech;
import android.view.accessibility.AccessibilityManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Logger;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import java.util.Locale;

import static android.content.Context.ACCESSIBILITY_SERVICE;

@NativePlugin()
public class Accessibility extends Plugin {
  private static final String EVENT_SCREEN_READER_STATE_CHANGE = "accessibilityScreenReaderStateChange";

  private TextToSpeech tts;
  private AccessibilityManager am;

  public void load() {
    am = (AccessibilityManager) getContext().getSystemService(ACCESSIBILITY_SERVICE);

    am.addTouchExplorationStateChangeListener(new AccessibilityManager.TouchExplorationStateChangeListener() {
      @Override
      public void onTouchExplorationStateChanged(boolean b) {
        JSObject ret = new JSObject();
        ret.put("value", b);
        notifyListeners(EVENT_SCREEN_READER_STATE_CHANGE, ret);
      }
    });
  }

  @PluginMethod()
  public void isScreenReaderEnabled(PluginCall call) {
    Logger.debug(getLogTag(), "Checking for screen reader");
    Logger.debug(getLogTag(), "Is it enabled? " + am.isTouchExplorationEnabled());

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
  }

}
