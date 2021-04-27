package com.getcapacitor;

import static com.getcapacitor.FileUtils.readFile;

import android.content.Context;
import java.io.IOException;
import java.util.Collection;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class JSExport {

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
        JSONArray pluginArray = new JSONArray();

        for (PluginHandle plugin : plugins) {
            pluginArray.put(createPluginHeader(plugin));
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

    private static JSONObject createPluginHeader(PluginHandle plugin) {
        JSONObject pluginObj = new JSONObject();
        Collection<PluginMethodHandle> methods = plugin.getMethods();
        try {
            String id = plugin.getId();
            JSONArray methodArray = new JSONArray();
            pluginObj.put("name", id);

            for (PluginMethodHandle method : methods) {
                methodArray.put(createPluginMethodHeader(method));
            }

            pluginObj.put("methods", methodArray);
        } catch (JSONException e) {
            // ignore
        }
        return pluginObj;
    }

    private static JSONObject createPluginMethodHeader(PluginMethodHandle method) {
        JSONObject methodObj = new JSONObject();

        try {
            methodObj.put("name", method.getName());
            if (!method.getReturnType().equals(PluginMethod.RETURN_NONE)) {
                methodObj.put("rtype", method.getReturnType());
            }
        } catch (JSONException e) {
            // ignore
        }

        return methodObj;
    }

    public static String getBridgeJS(Context context) throws JSExportException {
        return getFilesContent(context, "native-bridge.js");
    }
}
