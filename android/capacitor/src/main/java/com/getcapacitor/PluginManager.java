package com.getcapacitor;

import android.content.res.AssetManager;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class PluginManager {

    private final AssetManager assetManager;

    public PluginManager(AssetManager assetManager) {
        this.assetManager = assetManager;
    }

    public List<Class<? extends Plugin>> loadPluginClasses() throws PluginLoadException {
        JSONArray pluginsJSON = parsePluginsJSON();
        ArrayList<Class<? extends Plugin>> pluginList = new ArrayList<>();

        try {
            for (int i = 0, size = pluginsJSON.length(); i < size; i++) {
                JSONObject pluginJSON = pluginsJSON.getJSONObject(i);
                String classPath = pluginJSON.getString("classpath");
                Class<?> c = Class.forName(classPath);
                pluginList.add(c.asSubclass(Plugin.class));
            }
        } catch (JSONException e) {
            throw new PluginLoadException("Could not parse capacitor.plugins.json as JSON");
        } catch (ClassNotFoundException e) {
            throw new PluginLoadException("Could not find class by class path: " + e.getMessage());
        }

        return pluginList;
    }

    private JSONArray parsePluginsJSON() throws PluginLoadException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(assetManager.open("capacitor.plugins.json")))) {
            StringBuilder builder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                builder.append(line);
            }
            String jsonString = builder.toString();
            return new JSONArray(jsonString);
        } catch (IOException e) {
            throw new PluginLoadException("Could not load capacitor.plugins.json");
        } catch (JSONException e) {
            throw new PluginLoadException("Could not parse capacitor.plugins.json as JSON");
        }
    }
}
