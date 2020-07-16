package com.getcapacitor.plugin;

import static android.content.Context.ACCESSIBILITY_SERVICE;

import android.speech.tts.TextToSpeech;
import android.view.accessibility.AccessibilityManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Logger;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import java.util.Locale;

@NativePlugin
public class Accessibility extends Plugin {
    private static final String EVENT_SCREEN_READER_STATE_CHANGE = "accessibilityScreenReaderStateChange";

    private TextToSpeech tts;
    private AccessibilityManager am;

    @Override
    public void load() {
        am = (AccessibilityManager) getContext().getSystemService(ACCESSIBILITY_SERVICE);

        am.addTouchExplorationStateChangeListener(
            b -> {
                JSObject ret = new JSObject();
                ret.put("value", b);
                notifyListeners(EVENT_SCREEN_READER_STATE_CHANGE, ret);
            }
        );
    }

    @PluginMethod
    public void isScreenReaderEnabled(PluginCall call) {
        Logger.debug(getLogTag(), "Checking for screen reader");
        Logger.debug(getLogTag(), "Is it enabled? " + am.isTouchExplorationEnabled());

        JSObject ret = new JSObject();
        ret.put("value", am.isTouchExplorationEnabled());
        call.success(ret);
    }

    @PluginMethod
    public void speak(PluginCall call) {
        final String value = call.getString("value");
        final String language = call.getString("language", "en");
        final Locale locale = Locale.forLanguageTag(language);

        if (locale == null) {
            call.error("Language was not a valid language tag.");
            return;
        }

        tts =
            new TextToSpeech(
                getContext(),
                i -> {
                    tts.setLanguage(locale);
                    tts.speak(value, TextToSpeech.QUEUE_FLUSH, null, "capacitoraccessibility" + System.currentTimeMillis());
                }
            );
    }
}
