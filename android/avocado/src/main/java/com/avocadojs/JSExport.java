package com.avocadojs;

import android.content.Context;
import android.text.TextUtils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class JSExport {
  private static String CATCHALL_OPTIONS_PARAM = "_options";
  private static String CALLBACK_PARAM = "_callback";

  public static String getCoreJS(Context context) throws JSExportException {
    try {
      BufferedReader br = new BufferedReader(
          new InputStreamReader(context.getAssets().open("public/native-bridge.js")));

      StringBuffer b = new StringBuffer();
      String line;
      while ((line = br.readLine()) != null) {
        b.append(line + "\n");
      }

      return b.toString();
    } catch(IOException ex) {
      throw new JSExportException("Unable to load native-bridge.js. Avocado will not function!", ex);
    }
  }

  public static String getPluginJS(Collection<PluginHandle> plugins) {
    List<String> lines = new ArrayList<String>();

    lines.add("// Begin: Avocado Plugin JS");

    for(PluginHandle plugin : plugins) {
      lines.add("(function(w) {\n" +
          "var a = w.Avocado; var p = a.Plugins;\n" +
          "var t = p['" + plugin.getId() + "'] = {};\n" +
          "t.addListener = function(eventName, callback) {\n" +
          "  return w.Avocado.addListener('" + plugin.getId() + "', eventName, callback);\n" +
          "}\n" +
          "t.removeListener = function(eventName, callback) {\n" +
          "  return w.Avocado.removeListener('" + plugin.getId() + "', eventName, callback);\n" +
          "}");


      Collection<PluginMethodHandle> methods = plugin.getMethods();

      for(PluginMethodHandle method : methods) {
        lines.add(generateMethodJS(plugin, method));
      }
      lines.add("})(window);\n");
    }

    return TextUtils.join("\n", lines);
  }

  private static String generateMethodJS(PluginHandle plugin, PluginMethodHandle method) {
    List<String> lines = new ArrayList<String>();

    List<String> args = new ArrayList<String>();
    // Add the catch all param that will take a full javascript object to pass to the plugin
    args.add(CATCHALL_OPTIONS_PARAM);

    String returnType = method.getReturnType();
    if (returnType == PluginMethod.RETURN_CALLBACK) {
      args.add(CALLBACK_PARAM);
    }

    // Create the method function declaration
    lines.add("t['" + method.getName() + "'] = function(" + TextUtils.join(", ", args) + ") {");

    switch(returnType) {
      case PluginMethod.RETURN_NONE:
        lines.add("return w.Avocado.nativeCallback('" + plugin.getId() + "', '" + method.getName() + "', " + CATCHALL_OPTIONS_PARAM + ")");
        break;
      case PluginMethod.RETURN_PROMISE:
        lines.add("return w.Avocado.nativePromise('" + plugin.getId() + "', '" + method.getName() + "', " + CATCHALL_OPTIONS_PARAM + ")");
        break;
      case PluginMethod.RETURN_CALLBACK:
        lines.add("return w.Avocado.nativeCallback('" + plugin.getId() + "', '" +
            method.getName() + "', " + CATCHALL_OPTIONS_PARAM + ", " + CALLBACK_PARAM + ")");
        break;
      default:
        // TODO: Do something here?
    }

    lines.add("}");

    return TextUtils.join("\n", lines);
  }



}
