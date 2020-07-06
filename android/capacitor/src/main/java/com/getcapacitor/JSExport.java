package com.getcapacitor;

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

  public static String getGlobalJS(Context context, boolean isDebug) {
    return "window.Capacitor = { DEBUG: " + isDebug + " };";
  }

  public static String getCoreJS(Context context) throws JSExportException {
    try {
      return getJS(context, "public/native-bridge.js");
    } catch(IOException ex) {
      throw new JSExportException("Unable to load native-bridge.js. Capacitor will not function!", ex);
    }
  }

  private static String getJS(Context context, String fileName) throws IOException {
    try {
      BufferedReader br = new BufferedReader(new InputStreamReader(context.getAssets().open(fileName)));

      StringBuffer b = new StringBuffer();
      String line;
      while ((line = br.readLine()) != null) {
        b.append(line + "\n");
      }

      return b.toString();
    } catch(IOException ex) {
      throw ex;
    }
  }

  public static String getCordovaJS(Context context) {
    String fileContent = "";
    try {
      fileContent = getJS(context, "public/cordova.js");
    } catch(IOException ex) {
      Logger.error("Unable to read public/cordova.js file, Cordova plugins will not work");
    }
    return fileContent;
  }

  public static String getCordovaPluginsFileJS(Context context) {
    String fileContent = "";
    try {
      fileContent = getJS(context, "public/cordova_plugins.js");
    } catch(IOException ex) {
      Logger.error("Unable to read public/cordova_plugins.js file, Cordova plugins will not work");
    }
    return fileContent;
  }

  public static String getPluginJS(Collection<PluginHandle> plugins) {
    List<String> lines = new ArrayList<String>();

    lines.add("// Begin: Capacitor Plugin JS");

    for(PluginHandle plugin : plugins) {
      lines.add("(function(w) {\n" +
          "var a = w.Capacitor; var p = a.Plugins;\n" +
          "var t = p['" + plugin.getId() + "'] = {};\n" +
          "t.addListener = function(eventName, callback) {\n" +
          "  return w.Capacitor.addListener('" + plugin.getId() + "', eventName, callback);\n" +
          "}");


      Collection<PluginMethodHandle> methods = plugin.getMethods();

      for(PluginMethodHandle method : methods) {
        if (method.getName().equals("addListener") || method.getName().equals("removeListener")) {
          // Don't export add/remove listener, we do that automatically above as they are "special snowflakes"
          continue;
        }

        lines.add(generateMethodJS(plugin, method));
      }
      lines.add("})(window);\n");
    }

    return TextUtils.join("\n", lines);
  }

  public static String getCordovaPluginJS(Context context) {
    return getFilesContent(context, "public/plugins");
  }

  public static String getFilesContent(Context context, String path) {
    StringBuilder builder = new StringBuilder();
    try {
      String[] content = context.getAssets().list(path);
      if (content.length  > 0) {
        for (String file: content) {
          builder.append(getFilesContent(context, path + "/" + file));
        }
      } else {
        return getJS(context, path);
      }
    } catch(IOException ex) {
      Logger.error("Unable to read file at path " + path);
    }
    return builder.toString();
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
        lines.add("return w.Capacitor.nativeCallback('" + plugin.getId() + "', '" + method.getName() + "', " + CATCHALL_OPTIONS_PARAM + ")");
        break;
      case PluginMethod.RETURN_PROMISE:
        lines.add("return w.Capacitor.nativePromise('" + plugin.getId() + "', '" + method.getName() + "', " + CATCHALL_OPTIONS_PARAM + ")");
        break;
      case PluginMethod.RETURN_CALLBACK:
        lines.add("return w.Capacitor.nativeCallback('" + plugin.getId() + "', '" +
            method.getName() + "', " + CATCHALL_OPTIONS_PARAM + ", " + CALLBACK_PARAM + ")");
        break;
      default:
        // TODO: Do something here?
    }

    lines.add("}");

    return TextUtils.join("\n", lines);
  }



}
