package com.getcapacitor;

import static com.getcapacitor.FileUtils.readFile;

import android.content.Context;
import android.text.TextUtils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class JSExport {

    private static String CATCHALL_OPTIONS_PARAM = "_options";
    private static String CALLBACK_PARAM = "_callback";

    public static String getGlobalJS(Context context, boolean isDebug) {
        return "window.Capacitor = { DEBUG: " + isDebug + ", Plugins: {} };";
    }

    public static String getCordovaJS(Context context) {
        String fileContent = "";
        try {
            fileContent = readFile(context.getAssets(), "public/cordova.js");
        } catch (IOException ex) {
            Logger.error("Unable to read public/cordova.js file, Cordova plugins will not work");
        }
        return fileContent;
    }

    public static String getCordovaPluginsFileJS(Context context) {
        String fileContent = "";
        try {
            fileContent = readFile(context.getAssets(), "public/cordova_plugins.js");
        } catch (IOException ex) {
            Logger.error("Unable to read public/cordova_plugins.js file, Cordova plugins will not work");
        }
        return fileContent;
    }

    public static String getPluginJS(Collection<PluginHandle> plugins) {
        List<String> lines = new ArrayList<>();
        JSONArray pluginArray = new JSONArray();

        for (PluginHandle plugin : plugins) {
            String id = plugin.getId();
            JSONObject pluginObj = new JSONObject();
            Collection<PluginMethodHandle> methods = plugin.getMethods();
            try {
                JSONArray methodArray = new JSONArray();
                pluginObj.put("name", id);

                for (PluginMethodHandle method : methods) {
                    JSONObject methodObj = new JSONObject();
                    methodObj.put("name", method.getName());
                    if (!method.getReturnType().equals(PluginMethod.RETURN_NONE)) {
                        methodObj.put("rtype", method.getReturnType());
                    }
                    methodArray.put(methodObj);
                }

                pluginObj.put("methods", methodArray);
            } catch (JSONException e) {
              // ignore
            }
            pluginArray.put(pluginObj);
        }

        return "window.Capacitor.PluginHeaders = " + pluginArray.toString() + ";";
    }

    public static String getCordovaPluginJS(Context context) {
        return getFilesContent(context, "public/plugins");
    }

    public static String getFilesContent(Context context, String path) {
        StringBuilder builder = new StringBuilder();
        try {
            String[] content = context.getAssets().list(path);
            if (content.length > 0) {
                for (String file : content) {
                    builder.append(getFilesContent(context, path + "/" + file));
                }
            } else {
                return readFile(context.getAssets(), path);
            }
        } catch (IOException ex) {
            Logger.error("Unable to read file at path " + path);
        }
        return builder.toString();
    }
}
