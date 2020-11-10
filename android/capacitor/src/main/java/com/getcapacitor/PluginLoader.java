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

public class PluginLoader {

    private JSONArray pluginsJSON = new JSONArray();

    public PluginLoader(AssetManager assetManager) {
        this.loadPlugins(assetManager);
    }

    public List<Class<? extends Plugin>> getPlugins() {
        ArrayList<Class<? extends Plugin>> pluginList = new ArrayList<>();

        try {
            for (int i = 0, size = pluginsJSON.length(); i < size; i++) {
                JSONObject pluginJSON = pluginsJSON.getJSONObject(i);
                String classPath = pluginJSON.getString("classpath");
                Class<?> c = Class.forName(classPath);
                pluginList.add(c.asSubclass(Plugin.class));
            }
        } catch (JSONException e) {
            Logger.error("Could not parse capacitor.plugins.json as JSON");
        } catch (ClassNotFoundException e) {
            Logger.error("Could not find class by class path: " + e.getMessage());
        }

        return pluginList;
    }

    private void loadPlugins(AssetManager assetManager) {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(assetManager.open("capacitor.plugins.json")))) {
            StringBuilder b = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                b.append(line);
            }
            String jsonString = b.toString();
            pluginsJSON = new JSONArray(jsonString);
        } catch (IOException e) {
            Logger.error("Could not load capacitor.plugins.json");
        } catch (JSONException e) {
            Logger.error("Could not parse capacitor.plugins.json as JSON");
        }
    }
}
